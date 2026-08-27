import { api } from './client';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'AGENT' | 'CUSTOMER';
  createdAt: string;
  _count?: { ticketsCreated: number; ticketsAssigned: number };
}

export const usersManagementApi = {
  list: () => api.get<AppUser[]>('/users'),
  updateRole: (id: string, role: 'ADMIN' | 'AGENT' | 'CUSTOMER') =>
    api.patch<AppUser>(`/users/${id}/role`, { role }),
  remove: (id: string) => api.delete(`/users/${id}`),
};
