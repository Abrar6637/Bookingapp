import { Ionicons } from '@expo/vector-icons'
import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router'
import { useAuth } from '@clerk/expo'
import { bookingService } from '../../../services/bookingService'
import { Booking } from '../../../types/booking'
import { useEffect, useRef, useState } from 'react'
import {
  Animated,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function BookingConfirmation() {
  const router = useRouter()
  const { bookingId } = useLocalSearchParams()
  const { getToken } = useAuth()

const [booking, setBooking] = useState<Booking | null>(null)
const [loading, setLoading] = useState(true)

  // =====================================================
  // ANIMATIONS
  // =====================================================

  const iconAnim = useRef(new Animated.Value(0)).current
  const contentAnim = useRef(new Animated.Value(0)).current
  const cardAnim = useRef(new Animated.Value(0)).current
  const buttonAnim = useRef(new Animated.Value(0)).current

useEffect(() => {
  const loadBooking = async () => {
    if (!bookingId) {
      setLoading(false)
      return
    }

    try {
      const token = await getToken()

      const data = await bookingService.getById(
        token,
        String(bookingId)
      )

      setBooking(data)
    } catch (error) {
      console.log(
        'Confirmation booking error:',
        error
      )
    } finally {
      setLoading(false)
    }
  }

  loadBooking()
}, [bookingId])

  useEffect(() => {
    Animated.stagger(120, [
      Animated.spring(iconAnim, {
        toValue: 1,
        tension: 70,
        friction: 7,
        useNativeDriver: true,
      }),

      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),

      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),

      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const slideUp = (animation: Animated.Value) => ({
    opacity: animation,
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [25, 0],
        }),
      },
    ],
  })

  return (
    <SafeAreaView
      edges={['top']}
      className="flex-1 bg-[#FFF8E8]"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 30,
        }}
      >
        <View className="flex-1 px-6 pt-8">

          {/* =================================================
              SUCCESS ICON
          ================================================= */}

          <Animated.View
            style={{
              opacity: iconAnim,
              transform: [
                {
                  scale: iconAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.6, 1],
                  }),
                },
              ],
            }}
            className="items-center mt-5"
          >
            <View className="w-32 h-32 rounded-full bg-[#FFF0C7] items-center justify-center">

              <View
                className="w-24 h-24 rounded-full bg-[#FFC342] items-center justify-center"
                style={{
                  elevation: 5,
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 4,
                  },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                }}
              >
                <View className="w-16 h-16 rounded-full bg-white items-center justify-center">
                  <Ionicons
                    name="checkmark"
                    size={38}
                    color="#16A34A"
                  />
                </View>
              </View>

            </View>
          </Animated.View>

          {/* =================================================
              SUCCESS TEXT
          ================================================= */}

          <Animated.View
            style={slideUp(contentAnim)}
            className="items-center mt-7"
          >
            <View className="bg-green-100 px-3 py-1.5 rounded-full mb-3">
              <Text className="text-green-700 text-xs font-bold">
                REQUEST SENT
              </Text>
            </View>

            <Text className="text-[28px] font-extrabold text-gray-950 text-center">
              Booking Request Sent!
            </Text>

            <Text className="text-sm text-gray-500 text-center leading-6 mt-3 px-3">
              Your booking request has been sent to the technician.
              You will be notified once they accept or reject your request.
            </Text>
          </Animated.View>

          {/* =================================================
              BOOKING SUMMARY
          ================================================= */}

          <Animated.View
            style={slideUp(cardAnim)}
            className="mt-8"
          >
            <View className="flex-row items-center justify-between mb-3 px-1">

              <Text className="text-lg font-extrabold text-gray-950">
                Booking Summary
              </Text>

              <View className="w-9 h-9 rounded-full bg-[#FFF0C7] items-center justify-center">
                <Ionicons
                  name="receipt-outline"
                  size={18}
                  color="#B77900"
                />
              </View>

            </View>

            <View
              className="bg-white rounded-[26px] p-5"
              style={{
                elevation: 4,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 3,
                },
                shadowOpacity: 0.06,
                shadowRadius: 8,
              }}
            >

              {/* Booking ID */}
              <View className="flex-row items-center">

                <View className="w-10 h-10 rounded-full bg-[#FFF3D2] items-center justify-center mr-3">
                  <Ionicons
                    name="receipt-outline"
                    size={18}
                    color="#B77900"
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-xs text-gray-400">
                    Booking ID
                  </Text>

                  <Text className="text-sm font-bold text-gray-900 mt-0.5">
                   {loading
  ? 'Loading...'
  : booking?.booking_code || 'N/A'}
                  </Text>
                </View>

              </View>

              <View className="h-[1px] bg-gray-100 my-4" />

              {/* Technician */}
              <View className="flex-row items-center">

                <View className="w-10 h-10 rounded-full bg-[#FFF3D2] items-center justify-center mr-3">
                  <Ionicons
                    name="person-outline"
                    size={18}
                    color="#B77900"
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-xs text-gray-400">
                    Technician
                  </Text>

                  <Text className="text-sm font-bold text-gray-900 mt-0.5">
                    {loading
  ? 'Loading...'
  : booking?.technician_name || 'N/A'}
                  </Text>
                </View>

              </View>

              <View className="h-[1px] bg-gray-100 my-4" />

              {/* Date & Time */}
              <View className="flex-row items-center">

                <View className="w-10 h-10 rounded-full bg-[#FFF3D2] items-center justify-center mr-3">
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color="#B77900"
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-xs text-gray-400">
                    Date & Time
                  </Text>

                  <Text className="text-sm font-bold text-gray-900 mt-0.5">
                    {loading
  ? 'Loading...'
  : booking?.date || 'N/A'}
                  </Text>
                </View>

              </View>

              <View className="h-[1px] bg-gray-100 my-4" />

              {/* Status */}
              <View className="flex-row items-center">

                <View className="w-10 h-10 rounded-full bg-[#FFF3D2] items-center justify-center mr-3">
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color="#B77900"
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-xs text-gray-400">
                    Status
                  </Text>

                  <View className="self-start bg-[#FFF3D2] px-3 py-1.5 rounded-full mt-1">
                    <View className="flex-row items-center">

                      <View className="w-2 h-2 rounded-full bg-[#D99A00] mr-2" />

                      <Text className="text-xs font-bold text-[#B77900]">
                        {loading
  ? 'Loading...'
  : booking?.status || 'N/A'}
                      </Text>

                    </View>
                  </View>
                </View>

              </View>

            </View>
          </Animated.View>

          {/* =================================================
              INFO MESSAGE
          ================================================= */}

          <Animated.View
            style={slideUp(cardAnim)}
            className="flex-row items-start bg-[#FFF0C7] rounded-[20px] p-4 mt-4"
          >
            <View className="w-8 h-8 rounded-full bg-[#FFC342] items-center justify-center mr-3">
              <Ionicons
                name="notifications-outline"
                size={16}
                color="#111827"
              />
            </View>

            <Text className="flex-1 text-xs text-gray-600 leading-5">
              We will notify you as soon as the technician responds to your booking request.
            </Text>
          </Animated.View>

          {/* Push buttons towards bottom */}
          <View className="flex-1 min-h-[30px]" />

          {/* =================================================
              BUTTONS
          ================================================= */}

          <Animated.View
            style={slideUp(buttonAnim)}
            className="mt-6"
          >

            {/* Track Booking */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                router.push('/(customer)/(tabs)/bookings')
              }
              className="w-full bg-[#FFC342] rounded-full py-4 items-center"
              style={{
                elevation: 3,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.08,
                shadowRadius: 5,
              }}
            >
              <View className="flex-row items-center">

                <Ionicons
                  name="navigate-outline"
                  size={19}
                  color="#111827"
                />

                <Text className="text-gray-950 font-extrabold text-base ml-2">
                  Track Booking
                </Text>

              </View>
            </TouchableOpacity>

            {/* Back Home */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                router.replace('/(customer)/(tabs)')
              }
              className="w-full bg-white border border-gray-200 rounded-full py-4 items-center mt-3"
            >
              <View className="flex-row items-center">

                <Ionicons
                  name="home-outline"
                  size={18}
                  color="#4B5563"
                />

                <Text className="text-gray-700 font-bold text-base ml-2">
                  Back to Home
                </Text>

              </View>
            </TouchableOpacity>

          </Animated.View>

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}