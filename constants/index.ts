export const STATUS_STYLES: Record<
  string,
  { bg: string; text: string }
> = {
  Pending: {
    bg: 'bg-[#FFF3D2]',
    text: 'text-[#9A6A00]',
  },

  Ongoing: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
  },

  Completed: {
    bg: 'bg-green-50',
    text: 'text-green-600',
  },

  Rejected: {
    bg: 'bg-red-50',
    text: 'text-red-600',
  },

  Cancelled: {
    bg: 'bg-gray-100',
    text: 'text-gray-500',
  },
}

export const SERVICE_COLORS: Record<
  string,
  { color: string; bg: string }
> = {
  Electrician: {
    color: '#D99A00',
    bg: '#FFF3D2',
  },

  Plumber: {
    color: '#3B82F6',
    bg: '#EFF6FF',
  },

  'AC Repair': {
    color: '#0891B2',
    bg: '#ECFEFF',
  },

  Mechanic: {
    color: '#DC2626',
    bg: '#FEF2F2',
  },

  Painter: {
    color: '#DB2777',
    bg: '#FDF2F8',
  },

  Cleaner: {
    color: '#16A34A',
    bg: '#F0FDF4',
  },

  Carpenter: {
    color: '#A16207',
    bg: '#FFFBEB',
  },
}