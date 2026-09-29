import { useAuth } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import BookingCard from '../../../components/BookingCard'
import ErrorState from '../../../components/ErrorState'
import { bookingService } from '../../../services/bookingService'
import { Booking } from '../../../types/booking'
import LoadingState from '../../../components/LoadingState'

const TABS = ['Pending', 'Accepted', 'Completed']

export default function Bookings() {
  const router = useRouter()
  const { getToken } = useAuth()
  const [activeTab, setActiveTab] = useState('Pending')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useFocusEffect(
    useCallback(() => {
      loadBookings()
    }, [])
  )

  const loadBookings = async () => {
    try {
      setError(null)
      const token = await getToken()
      const data = await bookingService.getAll(token)
      setBookings(data)
    } catch (err: any) {
      console.log('Error loading bookings:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadBookings()
    setRefreshing(false)
  }

  const onRetry = () => {
    setLoading(true)
    loadBookings()
  }

  // "Ongoing" ko customer side "Accepted" tab me dikhate hain
  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'Accepted') return b.status === 'Ongoing'
    return b.status === activeTab
  })

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">My Bookings</Text>
      </View>

      <View className="flex-row px-6 mt-4 border-b border-gray-100">
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{ paddingBottom: 12 }}
            className={`flex-1 items-center border-b-2 ${
              activeTab === tab ? 'border-black' : 'border-transparent'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                activeTab === tab ? 'text-black' : 'text-gray-400'
              }`}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        className="flex-1 px-6 mt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <LoadingState message="Loading bookings..." />
        ) : error ? (
          <ErrorState message={error} onRetry={onRetry} />
        ) : filteredBookings.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Ionicons name="calendar-outline" size={40} color="#d1d5db" />
            <Text className="text-gray-400 text-sm mt-3">
              No {activeTab.toLowerCase()} bookings
            </Text>
          </View>
        ) : (
          filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              name={booking.technician_name}
              onPress={() => router.push(`/(customer)/booking/${booking.id}`)}
            >
              {activeTab === 'Completed' && (
                <TouchableOpacity
                  onPress={() => router.push(`/(customer)/review?bookingId=${booking.id}`)}
                  className="mt-3 bg-gray-50 rounded-lg py-2 items-center"
                >
                  <Text className="text-sm font-semibold text-gray-700">Leave a Review</Text>
                </TouchableOpacity>
              )}
            </BookingCard>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}