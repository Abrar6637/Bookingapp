import { apiFetch } from './api'
import { Booking } from '../types/booking'

export const bookingService = {
  getAll: (token: string | null): Promise<Booking[]> => apiFetch('/bookings', { token }),

  getById: (token: string | null, id: string | number): Promise<Booking> =>
    apiFetch(`/bookings/${id}`, { token }),

  create: (
    token: string | null,
    data: {
      technician_profile_id: number
      service_category_id: number
      booking_date: string
      booking_time: string
      address: string
      description: string
    }
  ) => apiFetch('/bookings', { method: 'POST', token, body: data }),

  accept: (token: string | null, id: string | number) =>
    apiFetch(`/bookings/${id}/accept`, { method: 'PUT', token }),

  reject: (token: string | null, id: string | number) =>
    apiFetch(`/bookings/${id}/reject`, { method: 'PUT', token }),

  complete: (token: string | null, id: string | number) =>
    apiFetch(`/bookings/${id}/complete`, { method: 'PUT', token }),

  cancel: (token: string | null, id: string | number) =>
    apiFetch(`/bookings/${id}/cancel`, { method: 'PUT', token }),
}