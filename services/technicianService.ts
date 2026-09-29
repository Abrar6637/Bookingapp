import { apiFetch } from './api'
import { Technician } from '../types/technician'

export const technicianService = {
  getAll: (token: string | null, serviceFilter?: string): Promise<Technician[]> =>
    apiFetch(`/technicians${serviceFilter ? `?service=${serviceFilter}` : ''}`, { token }),

  getById: (token: string | null, id: string | number): Promise<Technician> =>
    apiFetch(`/technicians/${id}`, { token }),
  getTopRated: (token: string | null): Promise<Technician[]> =>
  apiFetch('/technicians/top-rated', { token }),

  saveProfile: (
    token: string | null,
    data: { service_ids: number[]; price: number; experience: string; bio: string }
  ) =>
    apiFetch('/technician/profile', { method: 'POST', token, body: data }),

  updateAvailability: (token: string | null, is_available: boolean) =>
    apiFetch('/technician/availability', { method: 'PUT', token, body: { is_available } }),

  getEarnings: (token: string | null) => apiFetch('/technician/earnings', { token }),
}