import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

  findAll(ticketId?: string) {
    return this.prisma.auditLog.findMany({
      where: ticketId ? { ticketId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
