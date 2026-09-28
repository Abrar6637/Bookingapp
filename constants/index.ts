export const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  Pending: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  Ongoing: { bg: 'bg-blue-100', text: 'text-blue-700' },
  Completed: { bg: 'bg-green-100', text: 'text-green-700' },
  Rejected: { bg: 'bg-red-100', text: 'text-red-700' },
  Cancelled: { bg: 'bg-gray-100', text: 'text-gray-500' },
}

export const SERVICE_COLORS: Record<string, { color: string; bg: string }> = {
  Electrician: { color: '#eab308', bg: '#fef9c3' },
  Plumber: { color: '#3b82f6', bg: '#dbeafe' },
  'AC Repair': { color: '#06b6d4', bg: '#cffafe' },
  Mechanic: { color: '#dc2626', bg: '#fee2e2' },
  Painter: { color: '#ec4899', bg: '#fce7f3' },
  Cleaner: { color: '#22c55e', bg: '#dcfce7' },
  Carpenter: { color: '#a16207', bg: '#fef3c7' },
}