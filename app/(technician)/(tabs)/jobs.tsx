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

const TABS = ['Ongoing', 'Completed']

export default function TechnicianJobs() {
  const router = useRouter()
  const { getToken } = useAuth()
  const [activeTab, setActiveTab] = useState('Ongoing')
  const [jobs, setJobs] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useFocusEffect(
    useCallback(() => {
      loadJobs()
    }, [])
  )

  const loadJobs = async () => {
    try {
      setError(null)
      const token = await getToken()
      const data = await bookingService.getAll(token)
      setJobs(data)
    } catch (err: any) {
      console.log('Error loading jobs:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadJobs()
    setRefreshing(false)
  }

  const onRetry = () => {
    setLoading(true)
    loadJobs()
  }

  const filteredJobs = jobs.filter((j) => j.status === activeTab)

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">My Jobs</Text>
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
          <Text className="text-center text-gray-400 mt-8">Loading jobs...</Text>
        ) : error ? (
          <ErrorState message={error} onRetry={onRetry} />
        ) : filteredJobs.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Ionicons name="briefcase-outline" size={40} color="#d1d5db" />
            <Text className="text-gray-400 text-sm mt-3">No {activeTab.toLowerCase()} jobs</Text>
          </View>
        ) : (
          filteredJobs.map((job) => (
            <BookingCard
              key={job.id}
              booking={job}
              name={job.customer_name}
              showAddress
              onPress={() => router.push(`/(technician)/bookings/${job.id}`)}
            >
              {job.status === 'Ongoing' && (
                <TouchableOpacity
                  onPress={() => router.push(`/(technician)/bookings/${job.id}`)}
                  className="mt-3 bg-black rounded-lg py-2 items-center"
                >
                  <Text className="text-sm font-semibold text-white">Mark as Completed</Text>
                </TouchableOpacity>
              )}
            </BookingCard>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}