export interface Technician {
  id: number
  name: string
  services: string[]
  service_ids?: number[]
  bio?: string
  rating: number
  reviews: number
  completed_jobs?: number
  price: number
  experience: string | null
  available: boolean
  address?: string | null
  recent_reviews?: TechnicianReview[]
}

export interface TechnicianReview {
  customer_name: string
  rating: number
  comment: string | null
  created_at: string
}