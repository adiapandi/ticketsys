import { api } from './client';

export interface Category {
  id: string;
  name: string;
  _count?: { tickets: number };
}

export const categoriesApi = {
  list: () => api.get<Category[]>('/categories'),
  create: (name: string) => api.post<Category>('/categories', { name }),
  update: (id: string, name: string) => api.patch<Category>(`/categories/${id}`, { name }),
  remove: (id: string) => api.delete(`/categories/${id}`),
};
