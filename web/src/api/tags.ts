import api from './index'

export interface Tag {
  id: number
  name: string
  createdAt: string
}

export interface CreateTagDto {
  name: string
}

export const tagsApi = {
  findAll: () => api.get<Tag[]>('/tags').then((r) => r.data),

  findOne: (id: number) =>
    api.get<Tag>(`/tags/${id}`).then((r) => r.data),

  create: (data: CreateTagDto) =>
    api.post<Tag>('/tags', data).then((r) => r.data),

  remove: (id: number) =>
    api.delete<void>(`/tags/${id}`).then((r) => r.data),
}
