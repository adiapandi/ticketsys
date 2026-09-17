import { api } from './client';

export interface Tag {
  id: string;
  name: string;
}

export const tagsApi = {
  list: () => api.get<Tag[]>('/tags'),
};
