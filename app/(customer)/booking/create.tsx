import { useAuth } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { bookingService } from '../../../services/bookingService'
import { useLocationStore } from '../../../store/locationStore'

const TIME_SLOTS = ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM', '07:00 PM']

const DATES = Array.from({ length: 7 }, (_, index) => {
  const date = new Date()
  date.setDate(date.getDate() + index)

  return {
    label:
      index === 0
        ? 'Today'
        : index === 1
          ? 'Tomorrow'
          : date.toLocaleDateString('en-US', { weekday: 'short' }),

    date: date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
    }),

    value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(2, '0')}`,
  }
})

export default function Booking() {
  const { technicianId, serviceCategoryId } = useLocalSearchParams()
  const router = useRouter()
  const { getToken } = useAuth()

  const [selectedDate, setSelectedDate] = useState(DATES[0])
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const fullAddress = useLocationStore((state) => state.fullAddress)
  const [address, setAddress] = useState(fullAddress)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const onConfirmBooking = async () => {
    if (!selectedTime) {
      Alert.alert('Error', 'Please select a time slot')
      return
    }
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter your address')
      return
    }

    setLoading(true)
    try {
      const token = await getToken()
      const booking = await bookingService.create(token, {
        technician_profile_id: Number(technicianId),
        service_category_id: Number(serviceCategoryId) || 1,
        booking_date: selectedDate.value,
        booking_time: selectedTime,
        address,
        description,
      })

      router.push(`/(customer)/booking/confirmation?bookingId=${booking.booking.id}`)
    } catch (err: any) {
      console.log('Booking error:', err.message)
      Alert.alert('Error', err.message || 'Booking failed, please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-6 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Book Service</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 mt-4">
        {/* Select Date */}
        <Text className="text-base font-bold text-gray-900 mb-3">Select Date</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10 }}
        >
          {DATES.map((d) => (
            <TouchableOpacity
              key={d.label}
              onPress={() => setSelectedDate(d)}
              style={{ width: 72, height: 72 }}
              className={`items-center justify-center rounded-2xl border ${selectedDate.label === d.label ? 'bg-black border-black' : 'bg-white border-gray-200'
                }`}
            >
              <Text
                className={`text-xs font-medium ${selectedDate.label === d.label ? 'text-white' : 'text-gray-500'
                  }`}
              >
                {d.label}
              </Text>
              <Text
                className={`text-sm font-bold mt-1 ${selectedDate.label === d.label ? 'text-white' : 'text-gray-900'
                  }`}
              >
                {d.date}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Select Time */}
        <Text className="text-base font-bold text-gray-900 mb-3 mt-6">Select Time</Text>
        <View className="flex-row flex-wrap" style={{ gap: 10 }}>
          {TIME_SLOTS.map((time) => (
            <TouchableOpacity
              key={time}
              onPress={() => setSelectedTime(time)}
              style={{ height: 44 }}
              className={`px-4 items-center justify-center rounded-xl border ${selectedTime === time ? 'bg-black border-black' : 'bg-white border-gray-200'
                }`}
            >
              <Text
                className={`text-sm font-medium ${selectedTime === time ? 'text-white' : 'text-gray-700'
                  }`}
              >
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Address */}
        <Text className="text-base font-bold text-gray-900 mb-2 mt-6">Service Address</Text>
        <View className="flex-row items-start bg-gray-100 rounded-xl px-4 py-3">
          <Ionicons name="location-outline" size={20} color="#9ca3af" style={{ marginTop: 2 }} />
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="House #, Street, Area..."
            placeholderTextColor="#9ca3af"
            multiline
            className="flex-1 ml-2 text-base"
          />
        </View>

        {/* Problem Description */}
        <Text className="text-base font-bold text-gray-900 mb-2 mt-6">
          Describe the Problem <Text className="text-gray-400 font-normal">(optional)</Text>
        </Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="e.g. Fan not working in bedroom..."
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={4}
          style={{ height: 100, textAlignVertical: 'top' }}
          className="bg-gray-100 rounded-xl px-4 py-3 text-base mb-6"
        />
      </ScrollView>

      {/* Bottom Confirm Button */}
      <View className="px-6 py-4 border-t border-gray-100">
        <TouchableOpacity
          onPress={onConfirmBooking}
          disabled={loading}
          className="w-full bg-black rounded-xl p-4 items-center"
        >
          <Text className="text-white font-bold text-base">
            {loading ? 'Confirming...' : 'Confirm Booking'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}