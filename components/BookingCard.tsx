import { Ionicons } from '@expo/vector-icons'
import { ReactNode } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { STATUS_STYLES } from '../constants'
import { Booking } from '../types/booking'

type Props = {
  booking: Booking
  name?: string
  onPress?: () => void
  showAddress?: boolean
  children?: ReactNode
}

export default function BookingCard({ booking, name, onPress, showAddress, children }: Props) {
  const badge = STATUS_STYLES[booking.status]

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={!onPress}
      className="bg-white border border-gray-200 rounded-2xl p-4 mb-4"
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-3">
            <Ionicons name="person" size={22} color="#9ca3af" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-gray-900">{name}</Text>
            <Text className="text-sm text-gray-500">{booking.service}</Text>
          </View>
        </View>

        <View className={`px-3 py-1 rounded-full ${badge?.bg || 'bg-gray-100'}`}>
          <Text className={`text-xs font-semibold ${badge?.text || 'text-gray-500'}`}>
            {booking.status}
          </Text>
        </View>
      </View>

      <View className="h-[1px] bg-gray-100 mb-3" />

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={16} color="#9ca3af" />
          <Text className="text-sm text-gray-500 ml-1">{booking.date}</Text>
        </View>
        <Text className="text-base font-bold text-gray-900">Rs. {booking.price}</Text>
      </View>

      {showAddress ? (
        <View className="flex-row items-center mt-2">
          <Ionicons name="location-outline" size={16} color="#9ca3af" />
          <Text className="text-sm text-gray-500 ml-1 flex-1">{booking.address}</Text>
        </View>
      ) : null}

      {children}
    </TouchableOpacity>
  )
}