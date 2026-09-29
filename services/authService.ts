import { apiFetch } from './api'

export const authService = {
  getStats: (token: string | null) => apiFetch('/user/stats', { token }),
}