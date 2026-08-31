import { api } from './client';

export interface CannedResponse {
  id: string;
  title: string;
  body: string;
  createdByName?: string | null;
  createdAt: string;
}

export const cannedResponsesApi = {
  list: () => api.get<CannedResponse[]>('/canned-responses'),
  create: (data: { title: string; body: string }) => api.post<CannedResponse>('/canned-responses', data),
  update: (id: string, data: { title: string; body: string }) =>
    api.patch<CannedResponse>(`/canned-responses/${id}`, data),
  remove: (id: string) => api.delete(`/canned-responses/${id}`),
};
