import { api } from './client';

export interface AuditLogEntry {
  id: string;
  action: string;
  description: string;
  userName: string;
  createdAt: string;
  ticketId: string | null;
}

export const auditLogApi = {
  listForTicket: (ticketId: string) => api.get<AuditLogEntry[]>('/audit-logs', { params: { ticketId } }),
};
