import api from './index'

export interface RegisterDto {
  username: string
  email: string
  password: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  user: {
    id: number
    username: string
    email: string
    role: string
  }
}

export interface UserProfile {
  id: number
  username: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
}

export const authApi = {
  register: (data: RegisterDto) =>
    api.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  login: (data: LoginDto) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  getProfile: () =>
    api.get<UserProfile>('/auth/profile').then((r) => r.data),
}
