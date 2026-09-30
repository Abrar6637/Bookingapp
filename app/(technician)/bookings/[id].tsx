import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAuth } from '@clerk/expo'
import { apiFetch } from '../../../services/api'
import LoadingState from '../../../components/LoadingState'
import { ActivityIndicator } from 'react-native'

export default function TechnicianBookingDetail() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const { getToken } = useAuth()

  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadJob()
  }, [id])

  const loadJob = async () => {
    try {
      const token = await getToken()
      const data = await apiFetch(`/bookings/${id}`, { token })
      setJob(data)
    } catch (err: any) {
      console.log('Error loading job:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const onCallCustomer = () => {
    if (job?.customer_phone) {
      Linking.openURL(`tel:${job.customer_phone}`)
    } else {
      Alert.alert('Info', 'Not able to call customer. Phone number not available.')
    }
  }

  const onMarkCompleted = () => {
    Alert.alert('Mark as Completed', 'Are you sure you want to mark this job as completed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, Complete',
        onPress: async () => {
          try {
            const token = await getToken()
            await apiFetch(`/bookings/${id}/complete`, { method: 'PUT', token })
            router.back()
          } catch (err: any) {
            Alert.alert('Error', err.message || 'something went wrong, please try again.')
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

  if (!job) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-400">Job not found</Text>
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
        <Text className="text-xl font-bold text-gray-900">Job Details</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 mt-4">
        {/* Booking ID + Status */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-sm text-gray-500">Booking ID: #{job.booking_code}</Text>
          {job.status === 'Ongoing' ? (
            <View className="bg-blue-100 px-3 py-1 rounded-full">
              <Text className="text-xs font-semibold text-blue-700">Ongoing</Text>
            </View>
          ) : (
            <View className="bg-green-100 px-3 py-1 rounded-full">
              <Text className="text-xs font-semibold text-green-700">{job.status}</Text>
            </View>
          )}
        </View>

        {/* Customer Card */}
        <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl p-4 mb-6">
          <View className="w-14 h-14 rounded-full bg-gray-100 items-center justify-center mr-4">
            <Ionicons name="person" size={26} color="#9ca3af" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-gray-900">{job.customer_name}</Text>
            <Text className="text-sm text-gray-500">{job.service}</Text>
          </View>
          <TouchableOpacity
            onPress={onCallCustomer}
            className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-2"
          >
            <Ionicons name="call" size={18} color="#22c55e" />
          </TouchableOpacity>
          <TouchableOpacity className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center">
            <Ionicons name="chatbubble" size={18} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        {/* Job Info */}
        <View className="mb-6">
          <Text className="text-base font-bold text-gray-900 mb-3">Job Info</Text>

          <View className="flex-row items-start mb-4">
            <Ionicons name="time-outline" size={20} color="#9ca3af" />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-500">Date & Time</Text>
              <Text className="text-sm text-gray-900 font-medium mt-1">{job.date}</Text>
            </View>
          </View>

          <View className="flex-row items-start mb-4">
            <Ionicons name="location-outline" size={20} color="#9ca3af" />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-500">Address</Text>
              <Text className="text-sm text-gray-900 font-medium mt-1">{job.address}</Text>
            </View>
          </View>

          {job.description && (
            <View className="flex-row items-start">
              <Ionicons name="document-text-outline" size={20} color="#9ca3af" />
              <View className="ml-3 flex-1">
                <Text className="text-xs text-gray-500">Problem Description</Text>
                <Text className="text-sm text-gray-900 font-medium mt-1">{job.description}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Earnings Summary */}
        <View className="bg-gray-50 rounded-2xl p-4 mb-6">
          <Text className="text-sm font-bold text-gray-900 mb-3">Earnings Summary</Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-500">Service Charges</Text>
            <Text className="text-sm text-gray-900">Rs. {job.price}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-500">Platform Fee</Text>
            <Text className="text-sm text-red-500">- Rs. {job.platform_fee}</Text>
          </View>
          <View className="h-[1px] bg-gray-200 my-2" />
          <View className="flex-row justify-between">
            <Text className="text-base font-bold text-gray-900">Your Earning</Text>
            <Text className="text-base font-bold text-gray-900">Rs. {job.price}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      {job.status === 'Ongoing' && (
        <View className="px-6 py-4 border-t border-gray-100">
          <TouchableOpacity
            onPress={onMarkCompleted}
            className="w-full bg-black rounded-xl p-4 items-center"
          >
            <Text className="text-white font-bold text-base">Mark as Completed</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}