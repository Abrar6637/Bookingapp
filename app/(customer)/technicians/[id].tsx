import { useAuth } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import ErrorState from '../../../components/ErrorState'
import { technicianService } from '../../../services/technicianService'
import { Technician, TechnicianReview } from '../../../types/technician'
import LoadingState from '../../../components/LoadingState'
import { ActivityIndicator } from 'react-native'

export default function TechnicianProfile() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const { getToken } = useAuth()

  const [technician, setTechnician] = useState<Technician | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTechnician()
  }, [id])

  const loadTechnician = async () => {
    setLoading(true)
    try {
      setError(null)
      const token = await getToken()
      const data = await technicianService.getById(token, id as string)
      setTechnician(data)
    } catch (err: any) {
      console.log('Error loading technician:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

 if (loading) {
  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <ActivityIndicator size="large" color="#000" />
    </SafeAreaView>
  )
}

  if (error || !technician) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-6 pt-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <ErrorState
          message={error || 'Technician not found'}
          onRetry={loadTechnician}
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="heart-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Profile Header */}
        <View className="items-center px-6 pt-4 pb-6">
          <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center mb-3">
            <Ionicons name="person" size={44} color="#9ca3af" />
          </View>
          <Text className="text-xl font-bold text-gray-900">{technician.name}</Text>
          <Text className="text-sm text-gray-500 mt-1">{technician.services?.join(', ')}</Text>

          {technician.available ? (
            <View className="bg-green-100 px-3 py-1 rounded-full mt-2">
              <Text className="text-xs text-green-700 font-semibold">● Available Now</Text>
            </View>
          ) : (
            <View className="bg-gray-100 px-3 py-1 rounded-full mt-2">
              <Text className="text-xs text-gray-500 font-semibold">● Currently Busy</Text>
            </View>
          )}
        </View>

        {/* Stats Row */}
        <View className="flex-row justify-between mx-6 bg-gray-50 rounded-2xl p-4 mb-6">
          <View className="items-center flex-1">
            <View className="flex-row items-center">
              <Ionicons name="star" size={16} color="#facc15" />
              <Text className="text-base font-bold text-gray-900 ml-1">{technician.rating || 0}</Text>
            </View>
            <Text className="text-xs text-gray-500 mt-1">{technician.reviews} reviews</Text>
          </View>

          <View className="w-[1px] bg-gray-200" />

          <View className="items-center flex-1">
            <Text className="text-base font-bold text-gray-900">{technician.completed_jobs || 0}</Text>
            <Text className="text-xs text-gray-500 mt-1">Jobs done</Text>
          </View>

          <View className="w-[1px] bg-gray-200" />

          <View className="items-center flex-1">
            <Text className="text-base font-bold text-gray-900">{technician.experience || 'N/A'}</Text>
            <Text className="text-xs text-gray-500 mt-1">Experience</Text>
          </View>
        </View>

        {/* About */}
        {technician.bio ? (
          <View className="px-6 mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-2">About</Text>
            <Text className="text-sm text-gray-600 leading-5">{technician.bio}</Text>
          </View>
        ) : null}

        {/* Location */}
        {technician.address ? (
          <View className="px-6 mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-2">Location</Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl p-4">
              <Ionicons name="location" size={20} color="#000" />
              <Text className="text-sm text-gray-700 ml-2">{technician.address}</Text>
            </View>
          </View>
        ) : null}

        {/* Reviews */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-900">Reviews</Text>
          </View>

          {technician.recent_reviews && technician.recent_reviews.length > 0 ? (
            technician.recent_reviews.map((review: TechnicianReview, index: number) => (
              <View key={index} className="border-b border-gray-100 py-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-bold text-gray-900">{review.customer_name}</Text>
                  <Text className="text-xs text-gray-400">{review.created_at}</Text>
                </View>
                <View className="flex-row items-center mt-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Ionicons
                      key={i}
                      name="star"
                      size={12}
                      color={i < review.rating ? '#facc15' : '#e5e7eb'}
                    />
                  ))}
                </View>
                {review.comment ? (
                  <Text className="text-sm text-gray-600">{review.comment}</Text>
                ) : null}
              </View>
            ))
          ) : (
            <Text className="text-sm text-gray-400">Still no reviews available.</Text>
          )}
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View className="flex-row items-center justify-between px-6 py-4 border-t border-gray-100">
        <View>
          <Text className="text-xs text-gray-500">Starting from</Text>
          <Text className="text-xl font-bold text-gray-900">
            Rs. {technician.price}
            <Text className="text-xs text-gray-400 font-normal"> /visit</Text>
          </Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            router.push(
              `/(customer)/booking/create?technicianId=${technician.id}&serviceCategoryId=${technician.service_ids?.[0] || 1}`
            )
          }
          className="bg-black rounded-xl px-8 py-4"
        >
          <Text className="text-white font-bold text-base">Book Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}