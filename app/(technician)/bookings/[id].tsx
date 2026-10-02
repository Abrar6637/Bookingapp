import { useAuth } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { apiFetch } from '../../../services/api'
import { useBookingStore } from '../../../store/bookingStore'

export default function TechnicianBookingDetail() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const { getToken } = useAuth()
  const updateBookingStatus = useBookingStore(
    (state) => state.updateBookingStatus
  )

  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)

  // =====================================================
  // LOAD JOB
  // =====================================================

  useEffect(() => {
    loadJob()
  }, [id])

  const loadJob = async () => {
    try {
      const token = await getToken()

      const data = await apiFetch(
        `/bookings/${id}`,
        { token }
      )

      setJob(data)
    } catch (err: any) {
      console.log(
        'Error loading job:',
        err.message
      )
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // CALL CUSTOMER
  // =====================================================

  const onCallCustomer = () => {
    if (job?.customer_phone) {
      Linking.openURL(
        `tel:${job.customer_phone}`
      )
    } else {
      Alert.alert(
        'Phone Number Unavailable',
        'Unable to call the customer because their phone number is not available.'
      )
    }
  }

  // =====================================================
  // COMPLETE JOB
  // =====================================================

  const completeJob = async () => {
    try {
      setCompleting(true)

      const token = await getToken()

      await apiFetch(
        `/bookings/${id}/complete`,
        {
          method: 'PUT',
          token,
        }
      )

      updateBookingStatus(
        String(id),
        'Completed'
      )

      router.back()
    } catch (err: any) {
      Alert.alert(
        'Error',
        err.message ||
        'Something went wrong, please try again.'
      )
    } finally {
      setCompleting(false)
    }
  }

  const onMarkCompleted = () => {
    Alert.alert(
      'Mark as Completed',
      'Are you sure you want to mark this job as completed?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes, Complete',
          onPress: completeJob,
        },
      ]
    )
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#FFF8E8] items-center justify-center">

        <View className="w-20 h-20 rounded-[24px] bg-white items-center justify-center">
          <ActivityIndicator
            size="large"
            color="#D99A00"
          />
        </View>

        <Text className="text-sm font-bold text-gray-700 mt-4">
          Loading job details...
        </Text>

        <Text className="text-xs text-gray-400 mt-1">
          Please wait a moment
        </Text>

      </SafeAreaView>
    )
  }

  // =====================================================
  // NOT FOUND
  // =====================================================

  if (!job) {
    return (
      <SafeAreaView className="flex-1 bg-[#FFF8E8]">

        <View className="px-6 pt-4">

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            className="w-11 h-11 rounded-full bg-white items-center justify-center"
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color="#111827"
            />
          </TouchableOpacity>

        </View>

        <View className="flex-1 items-center justify-center px-6">

          <View className="w-24 h-24 rounded-full bg-white items-center justify-center">

            <View className="w-16 h-16 rounded-full bg-[#FFF3D2] items-center justify-center">
              <Ionicons
                name="briefcase-outline"
                size={28}
                color="#B77900"
              />
            </View>

          </View>

          <Text className="text-lg font-extrabold text-gray-900 mt-5">
            Job not found
          </Text>

          <Text className="text-xs text-gray-400 text-center mt-2">
            We couldn't find the details for this booking.
          </Text>

        </View>

      </SafeAreaView>
    )
  }

  // =====================================================
  // STATUS
  // =====================================================

  const isOngoing =
    job.status === 'Ongoing'

  const isCompleted =
    job.status === 'Completed'

  // =====================================================
  // UI
  // =====================================================

  return (
    <SafeAreaView
      edges={['top']}
      className="flex-1 bg-[#FFF8E8]"
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <View className="flex-row items-center px-6 pt-4 pb-3">

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className="w-11 h-11 rounded-full bg-white items-center justify-center mr-4"
          style={{
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.05,
            shadowRadius: 5,
          }}
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color="#111827"
          />
        </TouchableOpacity>

        <View className="flex-1">

          <Text className="text-[22px] font-extrabold text-gray-950">
            Job Details
          </Text>

          <Text className="text-xs text-gray-500 mt-1">
            Booking #{job.booking_code}
          </Text>

        </View>

        <View className="w-11 h-11 rounded-full bg-[#FFC342] items-center justify-center">

          <Ionicons
            name="briefcase-outline"
            size={20}
            color="#111827"
          />

        </View>

      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 14,
          paddingBottom: 30,
        }}
      >

        {/* =================================================
            STATUS
        ================================================= */}

        <View
          className="bg-white rounded-[24px] p-4"
          style={{
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.04,
            shadowRadius: 6,
          }}
        >

          <View className="flex-row items-center justify-between">

            <View>

              <Text className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                Booking ID
              </Text>

              <Text className="text-base font-extrabold text-gray-950 mt-1">
                #{job.booking_code}
              </Text>

            </View>

            <View
              className={`flex-row items-center px-3 py-2 rounded-full ${isOngoing
                  ? 'bg-blue-100'
                  : isCompleted
                    ? 'bg-green-100'
                    : 'bg-[#FFF3D2]'
                }`}
            >

              <View
                className={`w-2 h-2 rounded-full mr-2 ${isOngoing
                    ? 'bg-blue-500'
                    : isCompleted
                      ? 'bg-green-500'
                      : 'bg-[#D99A00]'
                  }`}
              />

              <Text
                className={`text-[11px] font-extrabold ${isOngoing
                    ? 'text-blue-700'
                    : isCompleted
                      ? 'text-green-700'
                      : 'text-[#B77900]'
                  }`}
              >
                {job.status}
              </Text>

            </View>

          </View>

        </View>

        {/* =================================================
            CUSTOMER
        ================================================= */}

        <Text className="text-lg font-extrabold text-gray-950 mt-7 mb-3">
          Customer
        </Text>

        <View
          className="bg-white rounded-[24px] p-4"
          style={{
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.04,
            shadowRadius: 6,
          }}
        >

          <View className="flex-row items-center">

            {/* Avatar */}

            <View className="w-14 h-14 rounded-full bg-[#FFF3D2] items-center justify-center">

              <Ionicons
                name="person"
                size={25}
                color="#B77900"
              />

            </View>

            {/* Details */}

            <View className="flex-1 ml-3">

              <Text
                className="text-base font-extrabold text-gray-950"
                numberOfLines={1}
              >
                {job.customer_name}
              </Text>

              <View className="flex-row items-center mt-1">

                <Ionicons
                  name="construct-outline"
                  size={13}
                  color="#9CA3AF"
                />

                <Text
                  className="text-xs text-gray-500 ml-1.5"
                  numberOfLines={1}
                >
                  {job.service}
                </Text>

              </View>

            </View>

            {/* Call */}

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onCallCustomer}
              className="w-11 h-11 rounded-full bg-green-100 items-center justify-center mr-2"
            >
              <Ionicons
                name="call"
                size={18}
                color="#16A34A"
              />
            </TouchableOpacity>

            {/* Chat
                Existing screen had no chat functionality,
                so this remains visual only.
            */}

            <TouchableOpacity
              activeOpacity={0.7}
              className="w-11 h-11 rounded-full bg-[#FFF3D2] items-center justify-center"
            >
              <Ionicons
                name="chatbubble-outline"
                size={18}
                color="#B77900"
              />
            </TouchableOpacity>

          </View>

        </View>

        {/* =================================================
            JOB INFORMATION
        ================================================= */}

        <View className="flex-row items-center mt-7 mb-3">

          <View className="w-9 h-9 rounded-full bg-[#FFF3D2] items-center justify-center">

            <Ionicons
              name="information-circle-outline"
              size={18}
              color="#B77900"
            />

          </View>

          <View className="ml-3">

            <Text className="text-lg font-extrabold text-gray-950">
              Job Information
            </Text>

            <Text className="text-[11px] text-gray-400">
              Service details and location
            </Text>

          </View>

        </View>

        <View
          className="bg-white rounded-[24px] px-4"
          style={{
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.04,
            shadowRadius: 6,
          }}
        >

          {/* DATE */}

          <View className="flex-row items-start py-4 border-b border-gray-100">

            <View className="w-10 h-10 rounded-full bg-[#FFF3D2] items-center justify-center">

              <Ionicons
                name="calendar-outline"
                size={18}
                color="#B77900"
              />

            </View>

            <View className="flex-1 ml-3">

              <Text className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                Date & Time
              </Text>

              <Text className="text-sm text-gray-900 font-bold mt-1">
                {job.date}
              </Text>

            </View>

          </View>

          {/* ADDRESS */}

          <View
            className={`flex-row items-start py-4 ${job.description
                ? 'border-b border-gray-100'
                : ''
              }`}
          >

            <View className="w-10 h-10 rounded-full bg-[#FFF3D2] items-center justify-center">

              <Ionicons
                name="location-outline"
                size={18}
                color="#B77900"
              />

            </View>

            <View className="flex-1 ml-3">

              <Text className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                Service Address
              </Text>

              <Text className="text-sm text-gray-900 font-bold leading-5 mt-1">
                {job.address}
              </Text>

            </View>

          </View>

          {/* DESCRIPTION */}

          {job.description && (
            <View className="flex-row items-start py-4">

              <View className="w-10 h-10 rounded-full bg-[#FFF3D2] items-center justify-center">

                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color="#B77900"
                />

              </View>

              <View className="flex-1 ml-3">

                <Text className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                  Problem Description
                </Text>

                <Text className="text-sm text-gray-700 leading-5 mt-1">
                  {job.description}
                </Text>

              </View>

            </View>
          )}

        </View>

        {/* =================================================
            EARNINGS
        ================================================= */}

        <View className="flex-row items-center mt-7 mb-3">

          <View className="w-9 h-9 rounded-full bg-[#FFF3D2] items-center justify-center">

            <Ionicons
              name="wallet-outline"
              size={18}
              color="#B77900"
            />

          </View>

          <View className="ml-3">

            <Text className="text-lg font-extrabold text-gray-950">
              Earnings Summary
            </Text>

            <Text className="text-[11px] text-gray-400">
              Your payment breakdown
            </Text>

          </View>

        </View>

        <View
          className="bg-white rounded-[24px] p-5 mb-5"
          style={{
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.04,
            shadowRadius: 6,
          }}
        >

          {/* Service charge */}

          <View className="flex-row justify-between items-center">

            <Text className="text-sm text-gray-500">
              Service Charges
            </Text>

            <Text className="text-xl font-extrabold text-gray-950">
              Rs. {Math.max(
                0,
                Number(job.price || 0) - Number(job.platform_fee || 0)
              )}
            </Text>

          </View>

          {/* Platform fee */}

          <View className="flex-row justify-between items-center mt-4">

            <Text className="text-sm text-gray-500">
              Platform Fee
            </Text>

            <View className="bg-red-50 rounded-full px-3 py-1.5">

              <Text className="text-xs font-bold text-red-500">
                - Rs. {job.platform_fee}
              </Text>

            </View>

          </View>

          <View className="h-[1px] bg-gray-100 my-5" />

          {/* Earnings */}

          <View className="bg-[#FFF3D2] rounded-[18px] p-4">

            <View className="flex-row items-center justify-between">

              <View className="flex-row items-center">

                <View className="w-9 h-9 rounded-full bg-[#FFC342] items-center justify-center">

                  <Ionicons
                    name="cash-outline"
                    size={17}
                    color="#111827"
                  />

                </View>

                <View className="ml-3">

                  <Text className="text-[10px] uppercase tracking-wider font-semibold text-[#8A6200]">
                    Your Earning
                  </Text>

                  <Text className="text-[10px] text-gray-500 mt-0.5">
                    From this booking
                  </Text>

                </View>

              </View>

              {/* Preserving your existing value */}

              <Text className="text-xl font-extrabold text-gray-950">
                Rs. {job.price}
              </Text>

            </View>

          </View>

        </View>

      </ScrollView>

      {/* =================================================
          BOTTOM ACTION
      ================================================= */}

      {isOngoing && (
        <View
          className="bg-white px-6 pt-4 pb-5 border-t border-gray-100"
          style={{
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -3,
            },
            shadowOpacity: 0.05,
            shadowRadius: 6,
          }}
        >

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onMarkCompleted}
            disabled={completing}
            className={`w-full rounded-full py-4 items-center ${completing
                ? 'bg-[#FFD978]'
                : 'bg-[#FFC342]'
              }`}
          >

            {completing ? (
              <View className="flex-row items-center">

                <ActivityIndicator
                  size="small"
                  color="#111827"
                />

                <Text className="text-base font-extrabold text-gray-950 ml-2">
                  Completing Job...
                </Text>

              </View>
            ) : (
              <View className="flex-row items-center">

                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#111827"
                />

                <Text className="text-base font-extrabold text-gray-950 ml-2">
                  Mark as Completed
                </Text>

              </View>
            )}

          </TouchableOpacity>

          <Text className="text-[10px] text-gray-400 text-center mt-3">
            Complete the job only after the service has been finished
          </Text>

        </View>
      )}

    </SafeAreaView>
  )
}