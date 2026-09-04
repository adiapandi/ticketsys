import { api } from './client';

export interface Category {
  id: string;
  name: string;
  departmentId?: string | null;
  department?: { id: string; name: string } | null;
  _count?: { tickets: number };
}

export const categoriesApi = {
  list: (departmentId?: string) =>
    api.get<Category[]>('/categories', { params: departmentId ? { departmentId } : undefined }),
  create: (name: string, departmentId?: string) => api.post<Category>('/categories', { name, departmentId }),
  update: (id: string, name: string) => api.patch<Category>(`/categories/${id}`, { name }),
  remove: (id: string) => api.delete(`/categories/${id}`),
};
