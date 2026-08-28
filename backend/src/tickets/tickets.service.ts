import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { QueryTicketDto } from './dto/query-ticket.dto';
import { TicketStatus } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SlaService } from '../sla/sla.service';
import { AuditLogService } from '../audit-log/audit-log.service';

interface AuthUser {
  userId: string;
  email: string;
  role: 'ADMIN' | 'AGENT' | 'CUSTOMER';
}

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private notificationsService: NotificationsService,
    private slaService: SlaService,
    private auditLogService: AuditLogService,
  ) {}

  async create(dto: CreateTicketDto, user: AuthUser) {
    const priority = dto.priority || 'MEDIUM';
    const { firstResponseDueAt, resolutionDueAt } = this.slaService.computeDueDates(priority);

    const isStaff = user.role === 'ADMIN' || user.role === 'AGENT';
    const requesterId = isStaff && dto.requestedForUserId ? dto.requestedForUserId : user.userId;
    const assigneeId = isStaff && dto.assigneeId ? dto.assigneeId : undefined;

    const ticket = await this.prisma.ticket.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority,
        categoryId: dto.categoryId,
        requesterId,
        assigneeId,
        firstResponseDueAt,
        resolutionDueAt,
      },
      include: { requester: true, category: true },
    });

    await this.auditLogService.log(
      'TICKET_CREATED',
      `Ticket dibuat: "${ticket.title}"`,
      user.userId,
      ticket.id,
    );

    const staff = await this.prisma.user.findMany({
      where: { role: { in: ['AGENT', 'ADMIN'] }, id: { not: assigneeId } },
      select: { id: true, email: true },
    });
    await Promise.all(
      staff.map((s) =>
        Promise.all([
          this.notificationsService.create(
            s.id,
            'TICKET_CREATED',
            `Ticket baru: "${ticket.title}" oleh ${ticket.requester.name}`,
            ticket.id,
          ),
          this.mailService.sendTicketCreated(s.email, ticket.title, ticket.id, ticket.requester.name),
        ]),
      ),
    );

    if (assigneeId) {
      const assignee = await this.prisma.user.findUnique({ where: { id: assigneeId } });
      if (assignee) {
        await Promise.all([
          this.notificationsService.create(
            assignee.id,
            'TICKET_ASSIGNED',
            `Kamu di-assign ke ticket "${ticket.title}"`,
            ticket.id,
          ),
          this.mailService.sendTicketAssigned(assignee.email, ticket.title, ticket.id),
        ]);
        await this.auditLogService.log(
          'ASSIGNED',
          `Ticket di-assign ke ${assignee.name} (saat dibuat)`,
          user.userId,
          ticket.id,
        );
      }
    }

    return ticket;
  }

  async findAll(query: QueryTicketDto, user: AuthUser) {
    const where: any = {};

    if (user.role === 'CUSTOMER') {
      where.requesterId = user.userId;
    }

    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.assigneeId) where.assigneeId = query.assigneeId;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const sortableFields = ['createdAt', 'updatedAt', 'resolutionDueAt', 'title'];
    const sortBy = sortableFields.includes(query.sortBy || '') ? (query.sortBy as string) : 'createdAt';
    const order = query.order === 'asc' ? 'asc' : 'desc';

    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        include: {
          requester: { select: { id: true, name: true, email: true } },
          assignee: { select: { id: true, name: true, email: true } },
          category: true,
          _count: { select: { comments: true } },
        },
        orderBy: { [sortBy]: order },
        skip,
        take: limit,
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return {
      data: tickets.map((t) => ({ ...t, isOverdue: this.isOverdue(t) })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string, user: AuthUser) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        category: true,
        comments: {
          include: { author: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) throw new NotFoundException('Ticket tidak ditemukan');

    if (user.role === 'CUSTOMER' && ticket.requesterId !== user.userId) {
      throw new ForbiddenException('Kamu tidak punya akses ke ticket ini');
    }

    return { ...ticket, isOverdue: this.isOverdue(ticket) };
  }

  private isOverdue(ticket: { status: string; resolutionDueAt: Date | null; slaBreached: boolean }) {
    if (['RESOLVED', 'CLOSED'].includes(ticket.status)) return false;
    if (ticket.slaBreached) return true;
    if (!ticket.resolutionDueAt) return false;
    return new Date(ticket.resolutionDueAt) < new Date();
  }

  async update(id: string, dto: UpdateTicketDto, user: AuthUser) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: { requester: true },
    });
    if (!ticket) throw new NotFoundException('Ticket tidak ditemukan');

    if (user.role === 'CUSTOMER') {
      if (ticket.requesterId !== user.userId) {
        throw new ForbiddenException('Kamu tidak punya akses ke ticket ini');
      }
      const { title, description } = dto;
      return this.prisma.ticket.update({
        where: { id },
        data: { title, description },
      });
    }

    const data: any = { ...dto };
    if (dto.status === TicketStatus.CLOSED || dto.status === TicketStatus.RESOLVED) {
      data.closedAt = new Date();
    }

    if (dto.priority && dto.priority !== ticket.priority) {
      const { firstResponseDueAt, resolutionDueAt } = this.slaService.computeDueDates(dto.priority);
      data.firstResponseDueAt = firstResponseDueAt;
      data.resolutionDueAt = resolutionDueAt;
      data.slaBreached = false;
    }

    const updated = await this.prisma.ticket.update({
      where: { id },
      data,
      include: {
        requester: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        category: true,
      },
    });

    if (dto.status && dto.status !== ticket.status) {
      await Promise.all([
        this.notificationsService.create(
          ticket.requesterId,
          'TICKET_STATUS_CHANGED',
          `Status ticket "${ticket.title}" berubah menjadi ${dto.status.replace('_', ' ')}`,
          ticket.id,
        ),
        this.mailService.sendStatusChanged(
          ticket.requester.email,
          ticket.title,
          ticket.id,
          dto.status,
        ),
        this.auditLogService.log(
          'STATUS_CHANGED',
          `Status diubah dari ${ticket.status.replace('_', ' ')} menjadi ${dto.status.replace('_', ' ')}`,
          user.userId,
          ticket.id,
        ),
      ]);
    }

    if (dto.priority && dto.priority !== ticket.priority) {
      await this.auditLogService.log(
        'PRIORITY_CHANGED',
        `Priority diubah dari ${ticket.priority} menjadi ${dto.priority}`,
        user.userId,
        ticket.id,
      );
    }

    if (dto.assigneeId && dto.assigneeId !== ticket.assigneeId) {
      const newAssignee = await this.prisma.user.findUnique({ where: { id: dto.assigneeId } });
      if (newAssignee) {
        await Promise.all([
          this.notificationsService.create(
            newAssignee.id,
            'TICKET_ASSIGNED',
            `Kamu di-assign ke ticket "${ticket.title}"`,
            ticket.id,
          ),
          this.mailService.sendTicketAssigned(newAssignee.email, ticket.title, ticket.id),
          this.auditLogService.log(
            'ASSIGNED',
            `Ticket di-assign ke ${newAssignee.name}`,
            user.userId,
            ticket.id,
          ),
        ]);
      }
    }

    return updated;
  }

  async remove(id: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket tidak ditemukan');
    return this.prisma.ticket.delete({ where: { id } });
  }

  async getStats(user: AuthUser) {
    const where: any = user.role === 'CUSTOMER' ? { requesterId: user.userId } : {};
    const [open, inProgress, resolved, closed, total] = await Promise.all([
      this.prisma.ticket.count({ where: { ...where, status: 'OPEN' } }),
      this.prisma.ticket.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      this.prisma.ticket.count({ where: { ...where, status: 'RESOLVED' } }),
      this.prisma.ticket.count({ where: { ...where, status: 'CLOSED' } }),
      this.prisma.ticket.count({ where }),
    ]);
    return { open, inProgress, resolved, closed, total };
  }
}
