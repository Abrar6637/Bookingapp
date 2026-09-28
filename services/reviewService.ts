import { apiFetch } from './api'

export const reviewService = {
  submit: (token: string | null, data: { booking_id: number; rating: number; comment: string }) =>
    apiFetch('/reviews', { method: 'POST', token, body: data }),
}