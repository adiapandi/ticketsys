import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';

interface AuthUser {
  userId: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'AGENT' | 'CUSTOMER';
  departmentId?: string | null;
}

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private notificationsService: NotificationsService,
  ) {}

  private assertAccess(ticket: { departmentId: string | null; requesterId: string }, user: AuthUser) {
    if (user.role === 'CUSTOMER') {
      if (ticket.requesterId !== user.userId) {
        throw new ForbiddenException('Kamu tidak punya akses ke ticket ini');
      }
      return;
    }
    if (user.role === 'SUPER_ADMIN') return;
    if (ticket.departmentId !== user.departmentId) {
      throw new ForbiddenException('Ticket ini bukan dari department kamu');
    }
  }

  async create(ticketId: string, dto: CreateCommentDto, user: AuthUser) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { requester: true, assignee: true },
    });
    if (!ticket) throw new NotFoundException('Ticket tidak ditemukan');

    this.assertAccess(ticket, user);

    const isInternal = user.role === 'CUSTOMER' ? false : !!dto.isInternal;

    const comment = await this.prisma.comment.create({
      data: { body: dto.body, isInternal, ticketId, authorId: user.userId },
      include: { author: { select: { id: true, name: true, role: true } } },
    });

    if (user.role !== 'CUSTOMER' && !ticket.firstRespondedAt) {
      await this.prisma.ticket.update({ where: { id: ticketId }, data: { firstRespondedAt: new Date() } });
    }

    if (!isInternal) {
      await this.notifyOtherParty(ticket, comment.author.name, dto.body, user);
    }

    return comment;
  }

  private async notifyOtherParty(
    ticket: {
      id: string;
      title: string;
      requesterId: string;
      departmentId: string | null;
      requester: { id: string; email: string };
      assignee: { id: string; email: string } | null;
    },
    authorName: string,
    body: string,
    author: AuthUser,
  ) {
    const recipients = new Map<string, string>();

    if (author.userId === ticket.requesterId) {
      if (ticket.assignee) {
        recipients.set(ticket.assignee.id, ticket.assignee.email);
      } else {
        const staff = await this.prisma.user.findMany({
          where: { role: { in: ['AGENT', 'ADMIN'] }, departmentId: ticket.departmentId },
          select: { id: true, email: true },
        });
        staff.forEach((s) => recipients.set(s.id, s.email));
      }
    } else {
      recipients.set(ticket.requesterId, ticket.requester.email);
    }

    await Promise.all(
      Array.from(recipients.entries()).map(([userId, email]) =>
        Promise.all([
          this.notificationsService.create(
            userId,
            'NEW_COMMENT',
            `${authorName} membalas ticket "${ticket.title}"`,
            ticket.id,
          ),
          this.mailService.sendNewComment(email, ticket.title, ticket.id, authorName, body),
        ]),
      ),
    );
  }

  async findByTicket(ticketId: string, user: AuthUser) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket tidak ditemukan');
    this.assertAccess(ticket, user);

    const where: any = { ticketId };
    if (user.role === 'CUSTOMER') where.isInternal = false;

    return this.prisma.comment.findMany({
      where,
      include: { author: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }
}
