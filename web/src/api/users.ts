import api from './index'

export interface User {
  id: number
  username: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
}

export interface CreateUserDto {
  username: string
  email: string
  password: string
}

export interface UpdateUserDto {
  username?: string
  email?: string
  password?: string
  role?: string
}

export const usersApi = {
  findAll: () => api.get<User[]>('/users').then((r) => r.data),

  findOne: (id: number) =>
    api.get<User>(`/users/${id}`).then((r) => r.data),

  create: (data: CreateUserDto) =>
    api.post<User>('/users', data).then((r) => r.data),

  update: (id: number, data: UpdateUserDto) =>
    api.patch<User>(`/users/${id}`, data).then((r) => r.data),

  remove: (id: number) =>
    api.delete<void>(`/users/${id}`).then((r) => r.data),
}
