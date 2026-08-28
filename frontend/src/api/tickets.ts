import { api } from './client';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'PENDING' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
  updatedAt: string;
  resolutionDueAt?: string | null;
  firstResponseDueAt?: string | null;
  slaBreached?: boolean;
  escalated?: boolean;
  isOverdue?: boolean;
  requester: { id: string; name: string; email: string };
  assignee?: { id: string; name: string; email: string } | null;
  category?: { id: string; name: string } | null;
  _count?: { comments: number };
}

export interface Comment {
  id: string;
  body: string;
  isInternal: boolean;
  createdAt: string;
  author: { id: string; name: string; role: string };
}

export interface Attachment {
  id: string;
  filename: string;
  mimetype: string;
  size: number;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  type: 'TICKET_CREATED' | 'TICKET_ASSIGNED' | 'TICKET_STATUS_CHANGED' | 'NEW_COMMENT';
  message: string;
  isRead: boolean;
  createdAt: string;
  ticketId: string | null;
}

export interface PaginatedTickets {
  data: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const ticketsApi = {
  list: (params?: Record<string, string>) => api.get<PaginatedTickets>('/tickets', { params }),
  get: (id: string) => api.get<Ticket & { comments: Comment[] }>(`/tickets/${id}`),
  create: (data: {
    title: string;
    description: string;
    priority?: string;
    categoryId?: string;
    requestedForUserId?: string;
    assigneeId?: string;
  }) =>
    api.post<Ticket>('/tickets', data),
  update: (id: string, data: Partial<Ticket> & { assigneeId?: string }) =>
    api.patch<Ticket>(`/tickets/${id}`, data),
  remove: (id: string) => api.delete(`/tickets/${id}`),
  stats: () =>
    api.get<{ open: number; inProgress: number; resolved: number; closed: number; total: number }>(
      '/tickets/stats',
    ),
};

export const commentsApi = {
  list: (ticketId: string) => api.get<Comment[]>(`/tickets/${ticketId}/comments`),
  create: (ticketId: string, data: { body: string; isInternal?: boolean }) =>
    api.post<Comment>(`/tickets/${ticketId}/comments`, data),
};

export const usersApi = {
  agents: () => api.get<{ id: string; name: string; email: string }[]>('/users/agents'),
};

export const attachmentsApi = {
  list: (ticketId: string) => api.get<Attachment[]>(`/tickets/${ticketId}/attachments`),
  upload: (ticketId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<Attachment>(`/tickets/${ticketId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  downloadUrl: (attachmentId: string) => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    return `${base}/attachments/${attachmentId}/download`;
  },
  remove: (attachmentId: string) => api.delete(`/attachments/${attachmentId}`),
};

export const notificationsApi = {
  list: () => api.get<AppNotification[]>('/notifications'),
  unreadCount: () => api.get<number>('/notifications/unread-count'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};
