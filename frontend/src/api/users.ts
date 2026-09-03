import { api } from './client';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'AGENT' | 'CUSTOMER';
  createdAt: string;
  _count?: { ticketsCreated: number; ticketsAssigned: number };
}

export interface BulkImportResultItem {
  row: number;
  email: string;
  status: 'success' | 'failed';
  message: string;
  generatedPassword?: string;
}

export interface BulkImportResponse {
  total: number;
  success: number;
  failed: number;
  results: BulkImportResultItem[];
}

export const usersManagementApi = {
  list: () => api.get<AppUser[]>('/users'),
  bulkImport: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<BulkImportResponse>('/users/bulk-import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  create: (data: { email: string; password: string; name: string; role: string }) =>
    api.post<AppUser>('/users', data),
  updateRole: (id: string, role: 'ADMIN' | 'AGENT' | 'CUSTOMER') =>
    api.patch<AppUser>(`/users/${id}/role`, { role }),
  remove: (id: string) => api.delete(`/users/${id}`),
};
