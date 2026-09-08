import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

export const DEFAULT_NOTIFICATION_PREFS = {
  emailEnabled: true,
  soundEnabled: true,
  notifyTicketCreated: true,
  notifyTicketAssigned: true,
  notifyStatusChanged: true,
  notifyNewComment: true,
  notifySlaBreached: true,
};

export type NotificationPrefs = typeof DEFAULT_NOTIFICATION_PREFS;
type PrefEventKey = Exclude<keyof NotificationPrefs, 'emailEnabled' | 'soundEnabled'>;

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, type: NotificationType, message: string, ticketId?: string) {
    return this.prisma.notification.create({
      data: { userId, type, message, ticketId },
    });
  }

  findForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
  }

  async markRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  countUnread(userId: string) {
    return this.prisma.notification.count({ where: { userId, isRead: false } });
  }

  async getPreferences(userId: string): Promise<NotificationPrefs> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { notificationPrefs: true },
    });
    return { ...DEFAULT_NOTIFICATION_PREFS, ...((user?.notificationPrefs as object) || {}) };
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto): Promise<NotificationPrefs> {
    const current = await this.getPreferences(userId);
    const updated = { ...current, ...dto };
    await this.prisma.user.update({
      where: { id: userId },
      data: { notificationPrefs: updated },
    });
    return updated;
  }

  // Dipanggil sebelum kirim email notifikasi — cek master switch + toggle per jenis
  async canSendEmail(userId: string, eventKey: PrefEventKey): Promise<boolean> {
    const prefs = await this.getPreferences(userId);
    return prefs.emailEnabled && prefs[eventKey];
  }
}
