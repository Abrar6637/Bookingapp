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

export default function BookingCard({
  booking,
  name,
  onPress,
  showAddress,
  children,
}: Props) {
  const badge = STATUS_STYLES[booking.status]

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={!onPress}
      className="bg-white rounded-[24px] p-5 mb-4"
      style={{
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      }}
    >
      {/* ============================================
          TOP SECTION
      ============================================ */}

      <View className="flex-row items-center justify-between">

        {/* Technician */}
        <View className="flex-row items-center flex-1 mr-3">

          {/* Avatar */}
          <View className="w-14 h-14 rounded-full bg-[#FFF3D2] items-center justify-center mr-3">

            <View className="w-11 h-11 rounded-full bg-[#FFC342] items-center justify-center">
              <Ionicons
                name="person-outline"
                size={22}
                color="#111827"
              />
            </View>

          </View>

          {/* Name + Service */}
          <View className="flex-1">

            <Text
              className="text-base font-extrabold text-gray-950"
              numberOfLines={1}
            >
              {name}
            </Text>

            <View className="flex-row items-center mt-1">

              <Ionicons
                name="construct-outline"
                size={14}
                color="#9CA3AF"
              />

              <Text
                className="text-sm text-gray-500 ml-1"
                numberOfLines={1}
              >
                {booking.service}
              </Text>

            </View>

          </View>
        </View>

        {/* Status Badge */}
        <View
          className={`px-3 py-1.5 rounded-full ${
            badge?.bg || 'bg-gray-100'
          }`}
        >
          <Text
            className={`text-[11px] font-bold ${
              badge?.text || 'text-gray-500'
            }`}
          >
            {booking.status}
          </Text>
        </View>

      </View>

      {/* Divider */}
      <View className="h-[1px] bg-gray-100 my-4" />

      {/* ============================================
          DATE + PRICE
      ============================================ */}

      <View className="flex-row items-center justify-between">

        {/* Date */}
        <View className="flex-row items-center flex-1">

          <View className="w-8 h-8 rounded-full bg-[#FFF8E8] items-center justify-center mr-2">
            <Ionicons
              name="calendar-outline"
              size={16}
              color="#D99A00"
            />
          </View>

          <View>
            <Text className="text-[10px] text-gray-400">
              Booking Date
            </Text>

            <Text className="text-sm font-semibold text-gray-700 mt-0.5">
              {booking.date}
            </Text>
          </View>

        </View>

        {/* Price */}
        <View className="items-end">

          <Text className="text-[10px] text-gray-400">
            Total Price
          </Text>

          <Text className="text-lg font-extrabold text-gray-950 mt-0.5">
            Rs. {booking.price}
          </Text>

        </View>

      </View>

      {/* ============================================
          ADDRESS
      ============================================ */}

      {showAddress ? (
        <View className="flex-row items-start mt-4 bg-[#FFF8E8] rounded-2xl p-3">

          <View className="w-8 h-8 rounded-full bg-[#FFC342] items-center justify-center mr-2">

            <Ionicons
              name="location-outline"
              size={17}
              color="#111827"
            />

          </View>

          <View className="flex-1">

            <Text className="text-[10px] text-gray-400 mb-0.5">
              Service Location
            </Text>

            <Text className="text-sm text-gray-600 leading-5">
              {booking.address}
            </Text>

          </View>

        </View>
      ) : null}

      {/* ============================================
          EXTRA CONTENT
          e.g. Leave Review button
      ============================================ */}

      {children}

      {/* Open Details Indicator */}
      {onPress ? (
        <View className="flex-row justify-end items-center mt-3">

          <Text className="text-xs font-bold text-[#B77900] mr-1">
            View Details
          </Text>

          <View className="w-6 h-6 rounded-full bg-[#FFF3D2] items-center justify-center">
            <Ionicons
              name="chevron-forward"
              size={14}
              color="#B77900"
            />
          </View>

        </View>
      ) : null}

    </TouchableOpacity>
  )
}