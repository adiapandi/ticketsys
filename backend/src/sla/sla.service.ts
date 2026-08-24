import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';
import { SLA_POLICY, addHours } from './sla.constants';
import { TicketPriority, TicketStatus } from '@prisma/client';

const PRIORITY_ESCALATION_ORDER: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const OPEN_STATUSES: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'PENDING'];

@Injectable()
export class SlaService {
  private readonly logger = new Logger(SlaService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private mailService: MailService,
  ) {}

  computeDueDates(priority: TicketPriority, from: Date = new Date()) {
    const policy = SLA_POLICY[priority];
    return {
      firstResponseDueAt: addHours(from, policy.responseHours),
      resolutionDueAt: addHours(from, policy.resolutionHours),
    };
  }

  // Dipanggil saat priority ticket berubah manual, supaya due date ikut menyesuaikan
  recomputeDueDates(priority: TicketPriority, createdAt: Date) {
    return this.computeDueDates(priority, createdAt);
  }

  /**
   * Cron job: cek tiap 15 menit apakah ada ticket yang lewat resolutionDueAt tapi belum
   * resolved/closed. Kalau ada dan belum ditandai breach, tandai + naikkan priority satu
   * level (auto-escalate) + kirim notifikasi ke assignee (atau semua staff kalau belum di-assign).
   */
  @Cron('0 */15 * * * *')
  async checkOverdueTickets() {
    const now = new Date();

    const overdue = await this.prisma.ticket.findMany({
      where: {
        status: { in: OPEN_STATUSES },
        resolutionDueAt: { lt: now },
        slaBreached: false,
      },
      include: {
        assignee: true,
        requester: true,
      },
    });

    if (overdue.length === 0) return;

    this.logger.warn(`${overdue.length} ticket melewati SLA resolusi, memproses escalasi...`);

    for (const ticket of overdue) {
      const currentIndex = PRIORITY_ESCALATION_ORDER.indexOf(ticket.priority);
      const canEscalate = currentIndex < PRIORITY_ESCALATION_ORDER.length - 1;
      const newPriority = canEscalate ? PRIORITY_ESCALATION_ORDER[currentIndex + 1] : ticket.priority;

      await this.prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          slaBreached: true,
          escalated: canEscalate,
          priority: newPriority,
        },
      });

      const recipients = ticket.assignee
        ? [ticket.assignee]
        : await this.prisma.user.findMany({ where: { role: { in: ['AGENT', 'ADMIN'] } } });

      const message = canEscalate
        ? `Ticket "${ticket.title}" melewati SLA dan di-escalate ke priority ${newPriority}`
        : `Ticket "${ticket.title}" melewati SLA resolusi`;

      await Promise.all(
        recipients.map((r) =>
          Promise.all([
            this.notificationsService.create(r.id, 'SLA_BREACHED', message, ticket.id),
            this.mailService.sendStatusChanged(r.email, ticket.title, ticket.id, `SLA BREACHED (${newPriority})`),
          ]),
        ),
      );
    }
  }
}
