import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';

interface AuthUser {
  userId: string;
  email: string;
  role: 'ADMIN' | 'AGENT' | 'CUSTOMER';
}

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private notificationsService: NotificationsService,
  ) {}

  async create(ticketId: string, dto: CreateCommentDto, user: AuthUser) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { requester: true, assignee: true },
    });
    if (!ticket) throw new NotFoundException('Ticket tidak ditemukan');

    if (user.role === 'CUSTOMER' && ticket.requesterId !== user.userId) {
      throw new ForbiddenException('Kamu tidak punya akses ke ticket ini');
    }

    // Customer tidak boleh bikin internal note
    const isInternal = user.role === 'CUSTOMER' ? false : !!dto.isInternal;

    const comment = await this.prisma.comment.create({
      data: {
        body: dto.body,
        isInternal,
        ticketId,
        authorId: user.userId,
      },
      include: { author: { select: { id: true, name: true, role: true } } },
    });

    // Catat waktu respons pertama dari staff (buat SLA response time tracking)
    if (user.role !== 'CUSTOMER' && !ticket.firstRespondedAt) {
      await this.prisma.ticket.update({
        where: { id: ticketId },
        data: { firstRespondedAt: new Date() },
      });
    }

    // Internal note tidak perlu notif ke customer
    if (!isInternal) {
      await this.notifyOtherParty(ticket, comment.author.name, dto.body, user);
    }

    return comment;
  }

  private async notifyOtherParty(
    ticket: { id: string; title: string; requesterId: string; requester: { id: string; email: string }; assignee: { id: string; email: string } | null },
    authorName: string,
    body: string,
    author: AuthUser,
  ) {
    const recipients = new Map<string, string>(); // userId -> email

    if (author.userId === ticket.requesterId) {
      // Customer yang komen → notif ke assignee (kalau ada), atau semua agent/admin kalau belum di-assign
      if (ticket.assignee) {
        recipients.set(ticket.assignee.id, ticket.assignee.email);
      } else {
        const staff = await this.prisma.user.findMany({
          where: { role: { in: ['AGENT', 'ADMIN'] } },
          select: { id: true, email: true },
        });
        staff.forEach((s) => recipients.set(s.id, s.email));
      }
    } else {
      // Agent/admin yang komen → notif ke requester
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
    const where: any = { ticketId };
    // Customer tidak bisa lihat internal note
    if (user.role === 'CUSTOMER') {
      where.isInternal = false;
    }
    return this.prisma.comment.findMany({
      where,
      include: { author: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }
}
