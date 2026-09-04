import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface AuthUser {
  userId: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'AGENT' | 'CUSTOMER';
  departmentId?: string | null;
}

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async log(action: string, description: string, actorId?: string, ticketId?: string) {
    let userName = 'System';
    if (actorId) {
      const actor = await this.prisma.user.findUnique({ where: { id: actorId }, select: { name: true } });
      if (actor) userName = actor.name;
    }
    return this.prisma.auditLog.create({
      data: { action, description, userId: actorId, userName, ticketId },
    });
  }

  async findAll(ticketId: string | undefined, actor: AuthUser) {
    // Non-Super Admin wajib sebutkan ticketId spesifik, dan itu harus dari department dia sendiri.
    // Sebelumnya endpoint ini bisa dipanggil tanpa ticketId dan balikin SEMUA log lintas department.
    if (actor.role !== 'SUPER_ADMIN') {
      if (!ticketId) {
        throw new ForbiddenException('ticketId wajib disertakan');
      }
      const ticket = await this.prisma.ticket.findUnique({
        where: { id: ticketId },
        select: { departmentId: true },
      });
      if (!ticket) throw new NotFoundException('Ticket tidak ditemukan');
      if (ticket.departmentId !== actor.departmentId) {
        throw new ForbiddenException('Ticket ini bukan dari department kamu');
      }
    }

    return this.prisma.auditLog.findMany({
      where: ticketId ? { ticketId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
