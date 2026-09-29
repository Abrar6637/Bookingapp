import { useAuth } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import ErrorState from '../../../components/ErrorState'
import LoadingState from '../../../components/LoadingState'
import { bookingService } from '../../../services/bookingService'
import { technicianService } from '../../../services/technicianService'
import { Booking } from '../../../types/booking'

export default function TechnicianRequests() {
  const { getToken } = useAuth()
  const [requests, setRequests] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availabilityOn, setAvailabilityOn] = useState(true)

  useFocusEffect(
    useCallback(() => {
      loadRequests()
    }, [])
  )

  const loadRequests = async () => {
    try {
      setError(null)
      const token = await getToken()
      const data = await bookingService.getAll(token)
      // Sirf Pending requests dikhayein is screen par
      setRequests(data.filter((b) => b.status === 'Pending'))
    } catch (err: any) {
      console.log('Error loading requests:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadRequests()
    setRefreshing(false)
  }

  const onRetry = () => {
    setLoading(true)
    loadRequests()
  }

  const toggleAvailability = async () => {
    const newValue = !availabilityOn
    try {
      const token = await getToken()
      await technicianService.updateAvailability(token, newValue)
      setAvailabilityOn(newValue)
    } catch (err: any) {
      console.log('Error updating availability:', err.message)
      Alert.alert('Error', err.message || 'Availability not updated')
    }
  }

  const onAccept = (id: number) => {
    Alert.alert('Accept Request', 'Are you sure you want to accept this request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept',
        onPress: async () => {
          try {
            const token = await getToken()
            await bookingService.accept(token, id)
            setRequests((prev) => prev.filter((r) => r.id !== id))
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Something went wrong')
          }
        },
      },
    ])
  }

  const onReject = (id: number) => {
    Alert.alert('Reject Request', 'Are you sure you want to reject this request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await getToken()
            await bookingService.reject(token, id)
            setRequests((prev) => prev.filter((r) => r.id !== id))
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Something went wrong')
          }
        },
      },
    ])
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <View>
          <Text className="text-2xl font-bold text-gray-900">Requests</Text>
          {!error && (
            <Text className="text-sm text-gray-500 mt-1">{requests.length} pending requests</Text>
          )}
        </View>

        <TouchableOpacity
          onPress={toggleAvailability}
          className={`flex-row items-center px-3 py-2 rounded-full ${
            availabilityOn ? 'bg-green-100' : 'bg-gray-100'
          }`}
        >
          <View
            className={`w-2 h-2 rounded-full mr-2 ${
              availabilityOn ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
          <Text
            className={`text-xs font-semibold ${
              availabilityOn ? 'text-green-700' : 'text-gray-500'
            }`}
          >
            {availabilityOn ? 'Available' : 'Offline'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Requests List */}
      <ScrollView
        className="flex-1 px-6 mt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <LoadingState message="Loading request..." />
        ) : error ? (
          <ErrorState message={error} onRetry={onRetry} />
        ) : !availabilityOn ? (
          <View className="items-center justify-center py-20">
            <Ionicons name="moon-outline" size={40} color="#d1d5db" />
            <Text className="text-gray-400 text-sm mt-3 text-center">
              You are offline. Please set your availability to "Available" to view requests.
            </Text>
          </View>
        ) : requests.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Ionicons name="checkmark-done-circle-outline" size={40} color="#d1d5db" />
            <Text className="text-gray-400 text-sm mt-3">No new request</Text>
          </View>
        ) : (
          requests.map((req) => (
            <View key={req.id} className="bg-white border border-gray-200 rounded-2xl p-4 mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-3">
                    <Ionicons name="person" size={22} color="#9ca3af" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-gray-900">{req.customer_name}</Text>
                    <Text className="text-sm text-gray-500">{req.service}</Text>
                  </View>
                </View>
                <Text className="text-base font-bold text-gray-900">Rs. {req.price}</Text>
              </View>

              <View className="h-[1px] bg-gray-100 mb-3" />

              <View className="flex-row items-start mb-2">
                <Ionicons name="time-outline" size={16} color="#9ca3af" />
                <Text className="text-sm text-gray-600 ml-2 flex-1">{req.date}</Text>
              </View>
              <View className="flex-row items-start mb-2">
                <Ionicons name="location-outline" size={16} color="#9ca3af" />
                <Text className="text-sm text-gray-600 ml-2 flex-1">{req.address}</Text>
              </View>
              {req.description ? (
                <View className="flex-row items-start mb-4">
                  <Ionicons name="document-text-outline" size={16} color="#9ca3af" />
                  <Text className="text-sm text-gray-600 ml-2 flex-1">{req.description}</Text>
                </View>
              ) : null}

              <View className="flex-row" style={{ gap: 10 }}>
                <TouchableOpacity
                  onPress={() => onReject(req.id)}
                  className="flex-1 bg-red-50 rounded-xl py-3 items-center"
                >
                  <Text className="text-red-600 font-bold text-sm">Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onAccept(req.id)}
                  className="flex-1 bg-black rounded-xl py-3 items-center"
                >
                  <Text className="text-white font-bold text-sm">Accept</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}