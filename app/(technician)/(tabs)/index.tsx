import { useAuth } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import ErrorState from '../../../components/ErrorState'
import LoadingState from '../../../components/LoadingState'
import { bookingService } from '../../../services/bookingService'
import { technicianService } from '../../../services/technicianService'
import { useBookingStore } from '../../../store/bookingStore'
import { useTechnicianRequestStore } from '../../../store/technicianRequestStore'
import { Booking } from '../../../types/booking'

export default function TechnicianRequests() {
  const { getToken } = useAuth()
  const updateBookingStatus = useBookingStore(
    (state) => state.updateBookingStatus
  )

  const [requests, setRequests] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availabilityOn, setAvailabilityOn] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)

  const setPendingCount = useTechnicianRequestStore(
    (state) => state.setPendingCount
  )

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

      // Sirf real Pending requests
      const pendingRequests = data.filter(
        (booking) => booking.status === 'Pending'
      )

      setRequests(pendingRequests)

      // Tab badge ke liye real count
      setPendingCount(pendingRequests.length)
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

      await technicianService.updateAvailability(
        token,
        newValue
      )

      setAvailabilityOn(newValue)
    } catch (err: any) {
      console.log(
        'Error updating availability:',
        err.message
      )

      Alert.alert(
        'Error',
        err.message || 'Availability not updated'
      )
    }
  }

  const removeRequest = (id: number) => {
    setRequests((previousRequests) => {
      const updatedRequests = previousRequests.filter(
        (request) => request.id !== id
      )

      // Accept/Reject ke baad badge bhi update
      setPendingCount(updatedRequests.length)

      return updatedRequests
    })
  }

  const onAccept = (id: number) => {
    Alert.alert(
      'Accept Request',
      'Are you sure you want to accept this request?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              setProcessingId(id)

              const token = await getToken()

              await bookingService.accept(token, id)

              updateBookingStatus(
                id,
                'Ongoing'
              )

              removeRequest(id)
            } catch (err: any) {
              Alert.alert(
                'Error',
                err.message || 'Something went wrong'
              )
            } finally {
              setProcessingId(null)
            }
          },
        },
      ]
    )
  }

  const onReject = (id: number) => {
    Alert.alert(
      'Reject Request',
      'Are you sure you want to reject this request?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessingId(id)

              const token = await getToken()

              await bookingService.reject(token, id)

updateBookingStatus(
  id,
  'Rejected'
)

removeRequest(id)
            } catch (err: any) {
              Alert.alert(
                'Error',
                err.message || 'Something went wrong'
              )
            } finally {
              setProcessingId(null)
            }
          },
        },
      ]
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FFF8E8]">
      {/* HEADER */}
      <View className="px-5 pt-4 pb-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-[28px] font-bold text-gray-900">
              Requests
            </Text>

            {!error && (
              <View className="flex-row items-center mt-2">
                <View className="bg-[#FFF0C7] px-3 py-1.5 rounded-full flex-row items-center">
                  <Ionicons
                    name="notifications-outline"
                    size={14}
                    color="#D99A00"
                  />

                  <Text className="text-[#9A6A00] text-xs font-semibold ml-1.5">
                    {requests.length}{' '}
                    {requests.length === 1
                      ? 'pending request'
                      : 'pending requests'}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* AVAILABILITY */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={toggleAvailability}
            className={`flex-row items-center px-4 py-2.5 rounded-full ${availabilityOn
                ? 'bg-green-100'
                : 'bg-gray-200'
              }`}
          >
            <View
              className={`w-2.5 h-2.5 rounded-full mr-2 ${availabilityOn
                  ? 'bg-green-500'
                  : 'bg-gray-400'
                }`}
            />

            <Text
              className={`text-xs font-bold ${availabilityOn
                  ? 'text-green-700'
                  : 'text-gray-500'
                }`}
            >
              {availabilityOn
                ? 'Available'
                : 'Offline'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* CONTENT */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#D99A00"
          />
        }
      >
        {loading ? (
          <LoadingState message="Loading requests..." />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={onRetry}
          />
        ) : !availabilityOn ? (
          /* OFFLINE */
          <View className="bg-white rounded-[28px] px-6 py-12 items-center mt-6">
            <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center">
              <Ionicons
                name="moon-outline"
                size={36}
                color="#9CA3AF"
              />
            </View>

            <Text className="text-lg font-bold text-gray-900 mt-5">
              You're Offline
            </Text>

            <Text className="text-gray-500 text-sm text-center mt-2 leading-5">
              Set your availability to Available to
              view and accept new service requests.
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={toggleAvailability}
              className="bg-[#FFC342] rounded-2xl px-6 py-3.5 mt-6 flex-row items-center"
            >
              <Ionicons
                name="flash-outline"
                size={18}
                color="#111827"
              />

              <Text className="font-bold text-gray-900 ml-2">
                Go Available
              </Text>
            </TouchableOpacity>
          </View>
        ) : requests.length === 0 ? (
          /* EMPTY */
          <View className="bg-white rounded-[28px] px-6 py-12 items-center mt-6">
            <View className="w-20 h-20 rounded-full bg-[#FFF3D2] items-center justify-center">
              <Ionicons
                name="checkmark-done-outline"
                size={38}
                color="#D99A00"
              />
            </View>

            <Text className="text-lg font-bold text-gray-900 mt-5">
              You're All Caught Up
            </Text>

            <Text className="text-gray-500 text-sm text-center mt-2">
              No new service requests right now.
            </Text>
          </View>
        ) : (
          requests.map((req) => {
            const isProcessing =
              processingId === req.id

            return (
              <View
                key={req.id}
                className="bg-white rounded-[24px] p-5 mb-4 border border-[#F5EBD5]"
                style={{
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 3,
                  },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                {/* CUSTOMER */}
                <View className="flex-row items-center">
                  <View className="w-14 h-14 rounded-2xl bg-[#FFF3D2] items-center justify-center mr-3">
                    <Ionicons
                      name="person-outline"
                      size={25}
                      color="#D99A00"
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="text-base font-bold text-gray-900">
                      {req.customer_name}
                    </Text>

                    <Text className="text-sm text-gray-500 mt-0.5">
                      {req.service}
                    </Text>
                  </View>

                  <View className="items-end">
                    <Text className="text-xs text-gray-400">
                      Service Price
                    </Text>

                    <Text className="text-lg font-bold text-gray-900 mt-0.5">
                      Rs. {req.price}
                    </Text>
                  </View>
                </View>

                {/* DIVIDER */}
                <View className="h-[1px] bg-[#F3EEE4] my-4" />

                {/* DATE */}
                <View className="flex-row items-start mb-3">
                  <View className="w-9 h-9 rounded-xl bg-[#FFF8E8] items-center justify-center">
                    <Ionicons
                      name="calendar-outline"
                      size={18}
                      color="#D99A00"
                    />
                  </View>

                  <View className="flex-1 ml-3">
                    <Text className="text-xs text-gray-400">
                      Date & Time
                    </Text>

                    <Text className="text-sm font-semibold text-gray-700 mt-0.5">
                      {req.date}
                    </Text>
                  </View>
                </View>

                {/* LOCATION */}
                <View className="flex-row items-start mb-3">
                  <View className="w-9 h-9 rounded-xl bg-[#FFF8E8] items-center justify-center">
                    <Ionicons
                      name="location-outline"
                      size={18}
                      color="#D99A00"
                    />
                  </View>

                  <View className="flex-1 ml-3">
                    <Text className="text-xs text-gray-400">
                      Service Location
                    </Text>

                    <Text className="text-sm font-semibold text-gray-700 mt-0.5 leading-5">
                      {req.address}
                    </Text>
                  </View>
                </View>

                {/* DESCRIPTION */}
                {req.description ? (
                  <View className="flex-row items-start">
                    <View className="w-9 h-9 rounded-xl bg-[#FFF8E8] items-center justify-center">
                      <Ionicons
                        name="document-text-outline"
                        size={18}
                        color="#D99A00"
                      />
                    </View>

                    <View className="flex-1 ml-3">
                      <Text className="text-xs text-gray-400">
                        Description
                      </Text>

                      <Text className="text-sm text-gray-600 mt-0.5 leading-5">
                        {req.description}
                      </Text>
                    </View>
                  </View>
                ) : null}

                {/* BUTTONS */}
                <View
                  className="flex-row mt-5"
                  style={{ gap: 10 }}
                >
                  <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={isProcessing}
                    onPress={() =>
                      onReject(req.id)
                    }
                    className={`flex-1 rounded-2xl py-3.5 items-center justify-center border border-red-100 ${isProcessing
                        ? 'bg-gray-100'
                        : 'bg-red-50'
                      }`}
                  >
                    <View className="flex-row items-center">
                      <Ionicons
                        name="close-outline"
                        size={19}
                        color={
                          isProcessing
                            ? '#9CA3AF'
                            : '#DC2626'
                        }
                      />

                      <Text
                        className={`font-bold text-sm ml-1 ${isProcessing
                            ? 'text-gray-400'
                            : 'text-red-600'
                          }`}
                      >
                        Reject
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={isProcessing}
                    onPress={() =>
                      onAccept(req.id)
                    }
                    className={`flex-1 rounded-2xl py-3.5 items-center justify-center ${isProcessing
                        ? 'bg-gray-300'
                        : 'bg-[#FFC342]'
                      }`}
                  >
                    <View className="flex-row items-center">
                      <Ionicons
                        name={
                          isProcessing
                            ? 'hourglass-outline'
                            : 'checkmark-outline'
                        }
                        size={19}
                        color="#111827"
                      />

                      <Text className="text-gray-900 font-bold text-sm ml-1">
                        {isProcessing
                          ? 'Please wait'
                          : 'Accept'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            )
          })
        )}
      </ScrollView>
    </SafeAreaView>
  )
}