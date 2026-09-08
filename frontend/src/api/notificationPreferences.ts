import { api } from './client';

export interface NotificationPrefs {
  emailEnabled: boolean;
  soundEnabled: boolean;
  notifyTicketCreated: boolean;
  notifyTicketAssigned: boolean;
  notifyStatusChanged: boolean;
  notifyNewComment: boolean;
  notifySlaBreached: boolean;
}

export const notificationPrefsApi = {
  get: () => api.get<NotificationPrefs>('/notifications/preferences'),
  update: (data: Partial<NotificationPrefs>) => api.patch<NotificationPrefs>('/notifications/preferences', data),
};
