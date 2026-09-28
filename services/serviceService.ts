import { apiFetch } from './api'
import { ServiceCategory } from '../types/service'

export const serviceService = {
  getAll: (token: string | null): Promise<ServiceCategory[]> =>
    apiFetch('/services', { token }),
}