export interface Booking {
  id: number
  booking_code: string
  status: 'Pending' | 'Ongoing' | 'Completed' | 'Rejected' | 'Cancelled'
  service: string
  date: string
  address: string
  description: string | null
  price: number
  total_price: number
  platform_fee?: number
  technician_name?: string
  customer_name?: string
  customer_phone?: string
}