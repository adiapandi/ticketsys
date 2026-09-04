import { api } from './client';

export interface Department {
  id: string;
  name: string;
  createdAt: string;
  _count?: { users: number; tickets: number; categories: number };
}

export const departmentsApi = {
  list: () => api.get<Department[]>('/departments'),
  create: (name: string) => api.post<Department>('/departments', { name }),
  update: (id: string, name: string) => api.patch<Department>(`/departments/${id}`, { name }),
  remove: (id: string) => api.delete(`/departments/${id}`),
};
