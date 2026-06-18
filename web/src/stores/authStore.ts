import { create } from 'zustand'
import type { UserProfile } from '../api/auth'
import { authApi } from '../api/auth'

interface AuthState {
  token: string | null
  user: UserProfile | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  fetchProfile: () => Promise<void>
  initialize: () => void
}

const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  loading: false,

  initialize: () => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    if (token) {
      set({ token })
      if (userStr) {
        try {
          set({ user: JSON.parse(userStr) })
        } catch {
          localStorage.removeItem('user')
        }
      }
    }
  },

  login: async (email: string, password: string) => {
    set({ loading: true })
    try {
      const res = await authApi.login({ email, password })
      localStorage.setItem('token', res.access_token)
      localStorage.setItem('user', JSON.stringify(res.user))
      set({ token: res.access_token, user: res.user as unknown as UserProfile })
    } finally {
      set({ loading: false })
    }
  },

  register: async (username: string, email: string, password: string) => {
    set({ loading: true })
    try {
      const res = await authApi.register({ username, email, password })
      localStorage.setItem('token', res.access_token)
      localStorage.setItem('user', JSON.stringify(res.user))
      set({ token: res.access_token, user: res.user as unknown as UserProfile })
    } finally {
      set({ loading: false })
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ token: null, user: null })
  },

  fetchProfile: async () => {
    try {
      const profile = await authApi.getProfile()
      set({ user: profile })
      localStorage.setItem('user', JSON.stringify(profile))
    } catch {
      get().logout()
    }
  },
}))

export default useAuthStore
