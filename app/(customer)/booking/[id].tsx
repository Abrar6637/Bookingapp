import { useAuth } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { apiFetch } from '../../../services/api'
import LoadingState from '../../../components/LoadingState'
import { ActivityIndicator } from 'react-native'

const STEPS = ['Pending', 'Ongoing', 'Completed']

export default function BookingDetail() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const { getToken } = useAuth()

  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      loadBooking()
    }, [id])
  )

  const loadBooking = async () => {
    try {
      const token = await getToken()
      const data = await apiFetch(`/bookings/${id}`, { token })
      setBooking(data)
    } catch (err: any) {
      console.log('Error loading booking:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const currentStepIndex = booking
    ? STEPS.indexOf(booking.status === 'Rejected' || booking.status === 'Cancelled' ? 'Pending' : booking.status)
    : 0

  const onCancelBooking = () => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await getToken()
            await apiFetch(`/bookings/${id}/cancel`, { method: 'PUT', token })
            router.back()
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Cancel nahi ho saka')
          }
        },
      },
    ])
  }

if (loading) {
  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <ActivityIndicator size="large" color="#000" />
    </SafeAreaView>
  )
}

  if (!booking) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-400">Booking not found</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-6 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Booking Details</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 mt-4">
        {/* Booking ID */}
        <Text className="text-sm text-gray-500 mb-6">Booking ID: #{booking.booking_code}</Text>

        {/* Status Tracker */}
        {booking.status !== 'Rejected' && booking.status !== 'Cancelled' ? (
          <View className="bg-gray-50 rounded-2xl p-5 mb-6">
            <Text className="text-base font-bold text-gray-900 mb-4">Booking Status</Text>
            {STEPS.map((step, index) => {
              const isCompleted = index <= currentStepIndex
              const isLast = index === STEPS.length - 1
              return (
                <View key={step} className="flex-row">
                  <View className="items-center mr-4">
                    <View
                      className={`w-6 h-6 rounded-full items-center justify-center ${
                        isCompleted ? 'bg-black' : 'bg-gray-200'
                      }`}
                    >
                      {isCompleted && <Ionicons name="checkmark" size={14} color="white" />}
                    </View>
                    {!isLast && (
                      <View
                        className={`w-[2px] flex-1 ${isCompleted ? 'bg-black' : 'bg-gray-200'}`}
                        style={{ minHeight: 30 }}
                      />
                    )}
                  </View>
                  <Text
                    className={`text-sm mb-6 ${
                      isCompleted ? 'text-gray-900 font-semibold' : 'text-gray-400'
                    }`}
                  >
                    {step}
                  </Text>
                </View>
              )
            })}
          </View>
        ) : (
          <View className="bg-red-50 rounded-2xl p-5 mb-6 items-center">
            <Ionicons name="close-circle" size={32} color="#dc2626" />
            <Text className="text-red-600 font-bold mt-2">Booking {booking.status}</Text>
          </View>
        )}

        {/* Technician Card */}
        <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl p-4 mb-6">
          <View className="w-14 h-14 rounded-full bg-gray-100 items-center justify-center mr-4">
            <Ionicons name="person" size={26} color="#9ca3af" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-gray-900">{booking.technician_name}</Text>
            <Text className="text-sm text-gray-500">{booking.service}</Text>
          </View>
          <TouchableOpacity className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-2">
            <Ionicons name="call" size={18} color="#22c55e" />
          </TouchableOpacity>
          <TouchableOpacity className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center">
            <Ionicons name="chatbubble" size={18} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        {/* Booking Info */}
        <View className="mb-6">
          <Text className="text-base font-bold text-gray-900 mb-3">Booking Info</Text>

          <View className="flex-row items-start mb-4">
            <Ionicons name="time-outline" size={20} color="#9ca3af" />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-500">Date & Time</Text>
              <Text className="text-sm text-gray-900 font-medium mt-1">{booking.date}</Text>
            </View>
          </View>

          <View className="flex-row items-start mb-4">
            <Ionicons name="location-outline" size={20} color="#9ca3af" />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-500">Address</Text>
              <Text className="text-sm text-gray-900 font-medium mt-1">{booking.address}</Text>
            </View>
          </View>

          {booking.description && (
            <View className="flex-row items-start">
              <Ionicons name="document-text-outline" size={20} color="#9ca3af" />
              <View className="ml-3 flex-1">
                <Text className="text-xs text-gray-500">Problem Description</Text>
                <Text className="text-sm text-gray-900 font-medium mt-1">{booking.description}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Price Summary */}
        <View className="bg-gray-50 rounded-2xl p-4 mb-6">
          <Text className="text-sm font-bold text-gray-900 mb-3">Price Summary</Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-500">Service Charges</Text>
            <Text className="text-sm text-gray-900">Rs. {booking.price}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-500">Platform Fee</Text>
            <Text className="text-sm text-gray-900">Rs. {booking.platform_fee}</Text>
          </View>
          <View className="h-[1px] bg-gray-200 my-2" />
          <View className="flex-row justify-between">
            <Text className="text-base font-bold text-gray-900">Total</Text>
            <Text className="text-base font-bold text-gray-900">Rs. {booking.total_price}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      {(booking.status === 'Pending' || booking.status === 'Ongoing') && (
        <View className="px-6 py-4 border-t border-gray-100">
          <TouchableOpacity
            onPress={onCancelBooking}
            className="w-full bg-red-50 rounded-xl p-4 items-center"
          >
            <Text className="text-red-600 font-bold text-base">Cancel Booking</Text>
          </TouchableOpacity>
        </View>
      )}

      {booking.status === 'Completed' && (
        <View className="px-6 py-4 border-t border-gray-100">
          <TouchableOpacity
            onPress={() => router.push(`/(customer)/review?bookingId=${id}`)}
            className="w-full bg-black rounded-xl p-4 items-center"
          >
            <Text className="text-white font-bold text-base">Leave a Review</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}