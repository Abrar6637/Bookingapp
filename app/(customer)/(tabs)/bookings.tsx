import { useAuth } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useRef, useState } from 'react'
import {
  Animated,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import BookingCard from '../../../components/BookingCard'
import ErrorState from '../../../components/ErrorState'
import LoadingState from '../../../components/LoadingState'
import { bookingService } from '../../../services/bookingService'
import { useBookingStore } from '../../../store/bookingStore'

const TABS = ['Pending', 'Accepted', 'Completed']

export default function Bookings() {
  const router = useRouter()
  const { getToken } = useAuth()

  const [activeTab, setActiveTab] = useState('Pending')

  const bookings = useBookingStore(
    (state) => state.bookings
  )

  const setBookings = useBookingStore(
    (state) => state.setBookings
  )

  const [loading, setLoading] = useState(
    bookings.length === 0
  )

  const [refreshing, setRefreshing] = useState(false)

  const [error, setError] = useState<string | null>(null)

  // =====================================================
  // ANIMATION
  // =====================================================

  const headerAnim = useRef(new Animated.Value(0)).current
  const contentAnim = useRef(new Animated.Value(0)).current

  const runAnimation = useCallback(() => {
    headerAnim.setValue(0)
    contentAnim.setValue(0)

    Animated.stagger(120, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),

      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start()
  }, [headerAnim, contentAnim])

  const headerAnimatedStyle = {
    opacity: headerAnim,

    transform: [
      {
        translateY: headerAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-15, 0],
        }),
      },
    ],
  }

  const contentAnimatedStyle = {
    opacity: contentAnim,

    transform: [
      {
        translateY: contentAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  }

  // =====================================================
  // LOAD BOOKINGS
  // =====================================================

useFocusEffect(
  useCallback(() => {
    setLoading(bookings.length === 0)

    loadBookings()
    runAnimation()
  }, [])
)

  const loadBookings = async () => {
    try {
      setError(null)

      const token = await getToken()

      const data = await bookingService.getAll(token)

      setBookings(data)
    } catch (err: any) {
      console.log(
        'Error loading bookings:',
        err.message
      )
      if (bookings.length === 0) {
        setError(err.message)
      }

    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // REFRESH
  // =====================================================

  const onRefresh = async () => {
    setRefreshing(true)

    await loadBookings()

    setRefreshing(false)
  }

  // =====================================================
  // RETRY
  // =====================================================

  const onRetry = () => {
    setLoading(true)
    loadBookings()
  }

  // =====================================================
  // FILTER BOOKINGS
  // =====================================================

  // Ongoing ko customer side Accepted tab me show karna hai
  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === 'Accepted') {
      return booking.status === 'Ongoing'
    }

    return booking.status === activeTab
  })

  // =====================================================
  // BOOKING COUNTS
  // =====================================================

  const getTabCount = (tab: string) => {
    if (tab === 'Accepted') {
      return bookings.filter(
        (booking) => booking.status === 'Ongoing'
      ).length
    }

    return bookings.filter(
      (booking) => booking.status === tab
    ).length
  }

  // =====================================================
  // TAB CHANGE
  // =====================================================

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)

    contentAnim.setValue(0)

    Animated.timing(contentAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
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
        style={headerAnimatedStyle}
        className="px-6 pt-5"
      >
        <View className="flex-row items-center justify-between">

          <View>
            <Text className="text-3xl font-extrabold text-gray-950">
              My Bookings
            </Text>

            <Text className="text-sm text-gray-500 mt-1">
              Track and manage your services
            </Text>
          </View>

          {/* Calendar Icon */}
          <View
            className="w-12 h-12 rounded-full bg-[#FFC342] items-center justify-center"
            style={{
              elevation: 3,
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 5,
            }}
          >
            <Ionicons
              name="calendar-outline"
              size={23}
              color="#111827"
            />
          </View>

        </View>
      </Animated.View>

      {/* =================================================
          TABS
      ================================================= */}

      <Animated.View
        style={headerAnimatedStyle}
        className="px-6 mt-7"
      >
        <View
          className="flex-row bg-white rounded-[22px] p-1.5"
          style={{
            elevation: 3,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.06,
            shadowRadius: 6,
          }}
        >

          {TABS.map((tab) => {
            const isActive = activeTab === tab
            const count = getTabCount(tab)

            return (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.8}
                onPress={() => handleTabChange(tab)}
                className={`flex-1 rounded-[17px] py-3 items-center justify-center ${isActive
                    ? 'bg-[#FFC342]'
                    : 'bg-transparent'
                  }`}
              >
                <View className="flex-row items-center">

                  <Text
                    className={`text-sm font-bold ${isActive
                        ? 'text-gray-950'
                        : 'text-gray-400'
                      }`}
                  >
                    {tab}
                  </Text>

                  {/* Count Badge */}
                  {count > 0 && (
                    <View
                      className={`ml-1.5 min-w-[20px] h-5 px-1 rounded-full items-center justify-center ${isActive
                          ? 'bg-gray-950'
                          : 'bg-[#FFF3D2]'
                        }`}
                    >
                      <Text
                        className={`text-[10px] font-extrabold ${isActive
                            ? 'text-white'
                            : 'text-[#B77900]'
                          }`}
                      >
                        {count}
                      </Text>
                    </View>
                  )}

                </View>
              </TouchableOpacity>
            )
          })}

        </View>
      </Animated.View>

      {/* =================================================
          CONTENT
      ================================================= */}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: 30,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FFC342']}
            tintColor="#FFC342"
          />
        }
      >

        <Animated.View
          style={[
            contentAnimatedStyle,
            {
              flexGrow: 1,
            },
          ]}
        >

          {/* Loading */}
          {loading ? (

            <LoadingState message="Loading bookings..." />

          ) : error ? (

            /* Error */
            <ErrorState
              message={error}
              onRetry={onRetry}
            />

          ) : filteredBookings.length === 0 ? (

            /* =================================================
                EMPTY STATE
            ================================================= */

            <View className="flex-1 items-center justify-center">

              <View
                className="w-full bg-white rounded-[28px] px-6 py-12 items-center"
                style={{
                  elevation: 3,
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 3,
                  },
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                }}
              >

                {/* Icon */}
                <View className="w-20 h-20 rounded-full bg-[#FFF3D2] items-center justify-center">

                  <View className="w-14 h-14 rounded-full bg-[#FFC342] items-center justify-center">

                    <Ionicons
                      name="calendar-outline"
                      size={28}
                      color="#111827"
                    />

                  </View>

                </View>

                <Text className="text-lg font-extrabold text-gray-950 mt-5">
                  No {activeTab} Bookings
                </Text>

                <Text className="text-sm text-gray-400 text-center mt-2 leading-5">
                  {activeTab === 'Pending'
                    ? 'Your new booking requests will appear here.'
                    : activeTab === 'Accepted'
                      ? 'Your accepted and ongoing services will appear here.'
                      : 'Your completed services will appear here.'}
                </Text>

              </View>

            </View>

          ) : (

            /* =================================================
                BOOKING CARDS
            ================================================= */

            <View>
              {filteredBookings.map(
                (booking, index) => (
                  <Animated.View
                    key={booking.id}
                    style={{
                      opacity: contentAnim,

                      transform: [
                        {
                          translateY:
                            contentAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [
                                20 + index * 4,
                                0,
                              ],
                            }),
                        },
                      ],
                    }}
                  >

                    <BookingCard
                      booking={booking}
                      name={booking.technician_name}
                      onPress={() =>
                        router.push(
                          `/(customer)/booking/${booking.id}`
                        )
                      }
                    >

                      {/* Review Button */}
                      {activeTab === 'Completed' && (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() =>
                            router.push(
                              `/(customer)/review?bookingId=${booking.id}`
                            )
                          }
                          className="mt-3 bg-[#FFC342] rounded-full py-3 items-center"
                        >
                          <View className="flex-row items-center">

                            <Ionicons
                              name="star-outline"
                              size={17}
                              color="#111827"
                            />

                            <Text className="text-sm font-extrabold text-gray-950 ml-2">
                              Leave a Review
                            </Text>

                          </View>
                        </TouchableOpacity>
                      )}

                    </BookingCard>

                  </Animated.View>
                )
              )}
            </View>
          )}

        </Animated.View>

      </ScrollView>

    </SafeAreaView>
  )
}