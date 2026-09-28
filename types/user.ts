export interface User {
  id: number
  name: string
  email: string
  role: 'customer' | 'technician'
  phone: string | null
}