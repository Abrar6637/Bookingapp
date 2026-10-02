import { useAuth } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from 'expo-router'
import {
  useCallback,
  useRef,
  useState,
} from 'react'
import {
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { apiFetch } from '../../../services/api'
import { useBookingStore } from '../../../store/bookingStore'

const STEPS = [
  'Pending',
  'Ongoing',
  'Completed',
]

export default function BookingDetail() {
  const { id } = useLocalSearchParams()

  const router = useRouter()

  const { getToken } = useAuth()
  const updateBookingStatus = useBookingStore(
    (state) => state.updateBookingStatus
  )

  const [booking, setBooking] =
    useState<any>(null)

  const [loading, setLoading] =
    useState(true)

  // =====================================================
  // ANIMATIONS
  // =====================================================

  const headerAnim = useRef(
    new Animated.Value(0)
  ).current

  const statusAnim = useRef(
    new Animated.Value(0)
  ).current

  const contentAnim = useRef(
    new Animated.Value(0)
  ).current

  const priceAnim = useRef(
    new Animated.Value(0)
  ).current

  const runAnimations = () => {
    headerAnim.setValue(0)
    statusAnim.setValue(0)
    contentAnim.setValue(0)
    priceAnim.setValue(0)

    Animated.stagger(100, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),

      Animated.timing(statusAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),

      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),

      Animated.timing(priceAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const slideUp = (
    animation: Animated.Value
  ) => ({
    opacity: animation,

    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  })

  // =====================================================
  // LOAD BOOKING
  // =====================================================

  useFocusEffect(
    useCallback(() => {
      loadBooking()
    }, [id])
  )

  const loadBooking = async () => {
    try {
      setLoading(true)

      const token = await getToken()

      const data = await apiFetch(
        `/bookings/${id}`,
        {
          token,
        }
      )

      setBooking(data)

      runAnimations()
    } catch (err: any) {
      console.log(
        'Error loading booking:',
        err.message
      )
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // CURRENT STATUS
  // =====================================================

  const currentStepIndex = booking
    ? STEPS.indexOf(
      booking.status === 'Rejected' ||
        booking.status === 'Cancelled'
        ? 'Pending'
        : booking.status
    )
    : 0

  // =====================================================
  // CANCEL BOOKING
  // =====================================================

  const onCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',

          onPress: async () => {
            try {
              const token =
                await getToken()

              await apiFetch(
                `/bookings/${id}/cancel`,
                {
                  method: 'PUT',
                  token,
                }
              )

              updateBookingStatus(
                String(id),
                'Cancelled'
              )

              router.back()
            } catch (err: any) {
              Alert.alert(
                'Error',
                err.message ||
                'Cancel nahi ho saka'
              )
            }
          },
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

        <View className="w-20 h-20 rounded-full bg-white items-center justify-center mb-4">
          <ActivityIndicator
            size="large"
            color="#D99A00"
          />
        </View>

        <Text className="text-sm font-semibold text-gray-500">
          Loading booking...
        </Text>

      </SafeAreaView>
    )
  }

  // =====================================================
  // NOT FOUND
  // =====================================================

  if (!booking) {
    return (
      <SafeAreaView className="flex-1 bg-[#FFF8E8] items-center justify-center px-6">

        <View className="w-20 h-20 rounded-full bg-[#FFF0C7] items-center justify-center">

          <Ionicons
            name="receipt-outline"
            size={32}
            color="#B77900"
          />

        </View>

        <Text className="text-lg font-extrabold text-gray-900 mt-4">
          Booking not found
        </Text>

        <Text className="text-sm text-gray-400 text-center mt-2">
          We couldn't find the booking details.
        </Text>

      </SafeAreaView>
    )
  }

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

      <Animated.View
        style={slideUp(headerAnim)}
        className="flex-row items-center px-6 pt-4 pb-3"
      >

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className="w-11 h-11 rounded-full bg-white items-center justify-center mr-4"
          style={{
            elevation: 2,
            shadowColor: '#000',
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

          <Text className="text-2xl font-extrabold text-gray-950">
            Booking Details
          </Text>

          <Text className="text-xs text-gray-500 mt-0.5">
            Track and manage your service
          </Text>

        </View>

        <View className="w-11 h-11 rounded-full bg-[#FFC342] items-center justify-center">

          <Ionicons
            name="receipt-outline"
            size={20}
            color="#111827"
          />

        </View>

      </Animated.View>

      {/* =================================================
          SCROLL CONTENT
      ================================================= */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 18,
          paddingBottom: 30,
        }}
      >

        {/* =================================================
            BOOKING ID
        ================================================= */}

        <Animated.View
          style={slideUp(headerAnim)}
          className="flex-row items-center justify-between mb-5"
        >

          <View>

            <Text className="text-xs text-gray-400">
              Booking ID
            </Text>

            <Text className="text-sm font-extrabold text-gray-900 mt-1">
              #{booking.booking_code}
            </Text>

          </View>

          <View className="bg-white px-3 py-2 rounded-full">

            <Text className="text-[11px] font-bold text-[#B77900]">
              {booking.status}
            </Text>

          </View>

        </Animated.View>

        {/* =================================================
            STATUS TRACKER
        ================================================= */}

        <Animated.View
          style={slideUp(statusAnim)}
        >

          {booking.status !== 'Rejected' &&
            booking.status !== 'Cancelled' ? (

            <View
              className="bg-white rounded-[26px] p-5 mb-5"
              style={{
                elevation: 3,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.05,
                shadowRadius: 7,
              }}
            >

              <View className="flex-row items-center mb-5">

                <View className="w-9 h-9 rounded-full bg-[#FFF3D2] items-center justify-center mr-3">

                  <Ionicons
                    name="navigate-outline"
                    size={17}
                    color="#B77900"
                  />

                </View>

                <View>

                  <Text className="text-base font-extrabold text-gray-950">
                    Booking Status
                  </Text>

                  <Text className="text-xs text-gray-400 mt-0.5">
                    Follow your service progress
                  </Text>

                </View>

              </View>

              {/* STATUS STEPS */}

              {STEPS.map(
                (step, index) => {
                  const isCompleted =
                    index <=
                    currentStepIndex

                  const isLast =
                    index ===
                    STEPS.length - 1

                  return (
                    <View
                      key={step}
                      className="flex-row"
                    >

                      {/* Circle + Line */}

                      <View className="items-center mr-4">

                        <View
                          className={`w-8 h-8 rounded-full items-center justify-center ${isCompleted
                              ? 'bg-[#FFC342]'
                              : 'bg-gray-100'
                            }`}
                        >

                          {isCompleted ? (
                            <Ionicons
                              name="checkmark"
                              size={17}
                              color="#111827"
                            />
                          ) : (
                            <View className="w-2 h-2 rounded-full bg-gray-300" />
                          )}

                        </View>

                        {!isLast && (
                          <View
                            className={`w-[2px] flex-1 ${isCompleted
                                ? 'bg-[#FFC342]'
                                : 'bg-gray-100'
                              }`}
                            style={{
                              minHeight: 32,
                            }}
                          />
                        )}

                      </View>

                      {/* Step Text */}

                      <View className="flex-1">

                        <Text
                          className={`text-sm ${isCompleted
                              ? 'text-gray-950 font-extrabold'
                              : 'text-gray-400 font-medium'
                            }`}
                        >
                          {step}
                        </Text>

                        <Text className="text-[11px] text-gray-400 mt-1 mb-6">

                          {step === 'Pending'
                            ? 'Waiting for technician confirmation'
                            : step ===
                              'Ongoing'
                              ? 'Technician is working on your service'
                              : 'Service has been completed'}

                        </Text>

                      </View>

                    </View>
                  )
                }
              )}

            </View>

          ) : (

            /* =============================================
                REJECTED / CANCELLED
            ============================================= */

            <View
              className="bg-white rounded-[26px] p-6 mb-5 items-center"
              style={{
                elevation: 3,
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 7,
              }}
            >

              <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center">

                <Ionicons
                  name="close-circle"
                  size={38}
                  color="#DC2626"
                />

              </View>

              <Text className="text-lg font-extrabold text-red-600 mt-3">
                Booking {booking.status}
              </Text>

              <Text className="text-xs text-gray-400 text-center mt-2">
                This booking is no longer active.
              </Text>

            </View>

          )}

        </Animated.View>

        {/* =================================================
            TECHNICIAN CARD
        ================================================= */}

        <Animated.View
          style={slideUp(contentAnim)}
        >

          <View
            className="bg-white rounded-[26px] p-5 mb-5"
            style={{
              elevation: 3,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.05,
              shadowRadius: 7,
            }}
          >

            <Text className="text-xs font-bold text-gray-400 mb-4">
              YOUR TECHNICIAN
            </Text>

            <View className="flex-row items-center">

              {/* Avatar */}

              <View className="w-14 h-14 rounded-full bg-[#FFF3D2] items-center justify-center mr-3">

                <View className="w-11 h-11 rounded-full bg-[#FFC342] items-center justify-center">

                  <Ionicons
                    name="person-outline"
                    size={21}
                    color="#111827"
                  />

                </View>

              </View>

              {/* Technician */}

              <View className="flex-1">

                <Text
                  className="text-base font-extrabold text-gray-950"
                  numberOfLines={1}
                >
                  {booking.technician_name}
                </Text>

                <View className="flex-row items-center mt-1">

                  <Ionicons
                    name="construct-outline"
                    size={13}
                    color="#9CA3AF"
                  />

                  <Text
                    className="text-xs text-gray-500 ml-1"
                    numberOfLines={1}
                  >
                    {booking.service}
                  </Text>

                </View>

              </View>

              {/* Call */}

              <TouchableOpacity
                activeOpacity={0.7}
                className="w-10 h-10 rounded-full bg-green-50 items-center justify-center mr-2"
              >
                <Ionicons
                  name="call-outline"
                  size={18}
                  color="#16A34A"
                />
              </TouchableOpacity>

              {/* Chat */}

              <TouchableOpacity
                activeOpacity={0.7}
                className="w-10 h-10 rounded-full bg-[#FFF3D2] items-center justify-center"
              >
                <Ionicons
                  name="chatbubble-outline"
                  size={17}
                  color="#B77900"
                />
              </TouchableOpacity>

            </View>

          </View>

        </Animated.View>

        {/* =================================================
            BOOKING INFORMATION
        ================================================= */}

        <Animated.View
          style={slideUp(contentAnim)}
        >

          <Text className="text-lg font-extrabold text-gray-950 mb-3">
            Booking Info
          </Text>

          <View
            className="bg-white rounded-[26px] p-5 mb-5"
            style={{
              elevation: 3,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.05,
              shadowRadius: 7,
            }}
          >

            {/* DATE */}

            <View className="flex-row items-start">

              <View className="w-10 h-10 rounded-full bg-[#FFF3D2] items-center justify-center">

                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color="#B77900"
                />

              </View>

              <View className="ml-3 flex-1">

                <Text className="text-xs text-gray-400">
                  Date & Time
                </Text>

                <Text className="text-sm text-gray-900 font-bold mt-1">
                  {booking.date}
                </Text>

              </View>

            </View>

            <View className="h-[1px] bg-gray-100 my-4" />

            {/* ADDRESS */}

            <View className="flex-row items-start">

              <View className="w-10 h-10 rounded-full bg-[#FFF3D2] items-center justify-center">

                <Ionicons
                  name="location-outline"
                  size={18}
                  color="#B77900"
                />

              </View>

              <View className="ml-3 flex-1">

                <Text className="text-xs text-gray-400">
                  Service Address
                </Text>

                <Text className="text-sm text-gray-900 font-bold mt-1 leading-5">
                  {booking.address}
                </Text>

              </View>

            </View>

            {/* DESCRIPTION */}

            {booking.description && (
              <>
                <View className="h-[1px] bg-gray-100 my-4" />

                <View className="flex-row items-start">

                  <View className="w-10 h-10 rounded-full bg-[#FFF3D2] items-center justify-center">

                    <Ionicons
                      name="document-text-outline"
                      size={18}
                      color="#B77900"
                    />

                  </View>

                  <View className="ml-3 flex-1">

                    <Text className="text-xs text-gray-400">
                      Problem Description
                    </Text>

                    <Text className="text-sm text-gray-900 font-medium mt-1 leading-5">
                      {booking.description}
                    </Text>

                  </View>

                </View>
              </>
            )}

          </View>

        </Animated.View>

        {/* =================================================
            PRICE SUMMARY
        ================================================= */}

        <Animated.View
          style={slideUp(priceAnim)}
        >

          <Text className="text-lg font-extrabold text-gray-950 mb-3">
            Price Summary
          </Text>

          <View
            className="bg-white rounded-[26px] p-5 mb-3"
            style={{
              elevation: 3,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.05,
              shadowRadius: 7,
            }}
          >

            {/* SERVICE CHARGE */}

            <View className="flex-row items-center justify-between mb-4">

              <View className="flex-row items-center">

                <View className="w-8 h-8 rounded-full bg-[#FFF3D2] items-center justify-center mr-3">

                  <Ionicons
                    name="construct-outline"
                    size={15}
                    color="#B77900"
                  />

                </View>

                <Text className="text-sm text-gray-500">
                  Service Charges
                </Text>

              </View>

              <Text className="text-sm font-bold text-gray-900">
                Rs. {booking.price}
              </Text>

            </View>

            {/* PLATFORM FEE */}

            <View className="flex-row items-center justify-between">

              <View className="flex-row items-center">

                <View className="w-8 h-8 rounded-full bg-[#FFF3D2] items-center justify-center mr-3">

                  <Ionicons
                    name="shield-checkmark-outline"
                    size={15}
                    color="#B77900"
                  />

                </View>

                <Text className="text-sm text-gray-500">
                  Platform Fee
                </Text>

              </View>

              <Text className="text-sm font-bold text-gray-900">
                Rs. {booking.platform_fee}
              </Text>

            </View>

            {/* DIVIDER */}

            <View className="h-[1px] bg-gray-100 my-4" />

            {/* TOTAL */}

            <View className="flex-row items-center justify-between">

              <View>

                <Text className="text-xs text-gray-400">
                  Total Amount
                </Text>

                <Text className="text-base font-extrabold text-gray-950 mt-1">
                  Total
                </Text>

              </View>

              <View className="bg-[#FFF3D2] px-4 py-2 rounded-full">

                <Text className="text-lg font-extrabold text-gray-950">
                  Rs. {booking.total_price}
                </Text>

              </View>

            </View>

          </View>

        </Animated.View>

      </ScrollView>

      {/* =================================================
          CANCEL BUTTON
      ================================================= */}

      {(booking.status === 'Pending' ||
        booking.status === 'Ongoing') && (

          <View className="px-6 pt-3 pb-4 bg-[#FFF8E8]">

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onCancelBooking}
              className="w-full bg-red-50 border border-red-100 rounded-full py-4 items-center"
            >

              <View className="flex-row items-center">

                <Ionicons
                  name="close-circle-outline"
                  size={19}
                  color="#DC2626"
                />

                <Text className="text-red-600 font-extrabold text-base ml-2">
                  Cancel Booking
                </Text>

              </View>

            </TouchableOpacity>

          </View>
        )}

      {/* =================================================
          REVIEW BUTTON
      ================================================= */}

      {booking.status === 'Completed' && (

        <View className="px-6 pt-3 pb-4 bg-[#FFF8E8]">

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              router.push(
                `/(customer)/review?bookingId=${id}`
              )
            }
            className="w-full bg-[#FFC342] rounded-full py-4 items-center"
            style={{
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 3,
              },
              shadowOpacity: 0.08,
              shadowRadius: 6,
            }}
          >

            <View className="flex-row items-center">

              <Ionicons
                name="star-outline"
                size={19}
                color="#111827"
              />

              <Text className="text-gray-950 font-extrabold text-base ml-2">
                Leave a Review
              </Text>

            </View>

          </TouchableOpacity>

        </View>
      )}

    </SafeAreaView>
  )
}