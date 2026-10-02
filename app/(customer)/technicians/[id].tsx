import { useAuth } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import ErrorState from '../../../components/ErrorState'
import { technicianService } from '../../../services/technicianService'
import {
  Technician,
  TechnicianReview,
} from '../../../types/technician'

export default function TechnicianProfile() {
  const { id } = useLocalSearchParams()

  const router = useRouter()

  const { getToken } = useAuth()

  // =====================================================
  // STATES
  // =====================================================

  const [technician, setTechnician] =
    useState<Technician | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  // =====================================================
  // ANIMATIONS
  // =====================================================

  const headerAnim = useRef(
    new Animated.Value(0)
  ).current

  const profileAnim = useRef(
    new Animated.Value(0)
  ).current

  const statsAnim = useRef(
    new Animated.Value(0)
  ).current

  const contentAnim = useRef(
    new Animated.Value(0)
  ).current

  const reviewAnim = useRef(
    new Animated.Value(0)
  ).current

  const runAnimations = () => {
    headerAnim.setValue(0)
    profileAnim.setValue(0)
    statsAnim.setValue(0)
    contentAnim.setValue(0)
    reviewAnim.setValue(0)

    Animated.stagger(90, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),

      Animated.timing(profileAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),

      Animated.timing(statsAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),

      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),

      Animated.timing(reviewAnim, {
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
  // LOAD TECHNICIAN
  // =====================================================

  useEffect(() => {
    loadTechnician()
  }, [id])

  const loadTechnician = async () => {
    setLoading(true)

    try {
      setError(null)

      const token = await getToken()

      const data =
        await technicianService.getById(
          token,
          id as string
        )

      setTechnician(data)

      runAnimations()
    } catch (err: any) {
      console.log(
        'Error loading technician:',
        err.message
      )

      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#FFF8E8] items-center justify-center">

        <View className="w-20 h-20 rounded-full bg-white items-center justify-center">
          <ActivityIndicator
            size="large"
            color="#D99A00"
          />
        </View>

        <Text className="text-sm font-semibold text-gray-500 mt-4">
          Loading technician...
        </Text>

      </SafeAreaView>
    )
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !technician) {
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

        <ErrorState
          message={
            error ||
            'Technician not found'
          }
          onRetry={loadTechnician}
        />

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
        className="flex-row items-center justify-between px-6 pt-4 pb-2"
      >

        {/* Back */}

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className="w-11 h-11 rounded-full bg-white items-center justify-center"
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

        {/* Title */}

        <View className="items-center">

          <Text className="text-lg font-extrabold text-gray-950">
            Technician Profile
          </Text>

          <Text className="text-[11px] text-gray-400 mt-0.5">
            Service professional
          </Text>

        </View>

        {/* Favorite */}

        <TouchableOpacity
          activeOpacity={0.7}
          className="w-11 h-11 rounded-full bg-white items-center justify-center"
          style={{
            elevation: 2,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 5,
          }}
        >
          <Ionicons
            name="heart-outline"
            size={21}
            color="#111827"
          />
        </TouchableOpacity>

      </Animated.View>

      {/* =================================================
          CONTENT
      ================================================= */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: 30,
        }}
      >

        {/* =================================================
            PROFILE
        ================================================= */}

        <Animated.View
          style={slideUp(profileAnim)}
          className="px-6 pt-6"
        >

          <View
            className="bg-white rounded-[28px] px-5 py-6 items-center"
            style={{
              elevation: 3,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.05,
              shadowRadius: 8,
            }}
          >

            {/* Avatar */}

            <View className="relative">

              <View className="w-28 h-28 rounded-full bg-[#FFF3D2] items-center justify-center">

                <View className="w-22 h-22 rounded-full bg-[#FFC342] items-center justify-center">

                  <Ionicons
                    name="person-outline"
                    size={42}
                    color="#111827"
                  />

                </View>

              </View>

              {/* Availability dot */}

              <View
                className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-[4px] border-white ${
                  technician.available
                    ? 'bg-green-500'
                    : 'bg-gray-400'
                }`}
              />

            </View>

            {/* Name */}

            <Text className="text-[22px] font-extrabold text-gray-950 mt-4 text-center">
              {technician.name}
            </Text>

            {/* Services */}

            <View className="flex-row items-center mt-2 px-4">

              <Ionicons
                name="construct-outline"
                size={14}
                color="#9CA3AF"
              />

              <Text className="text-sm text-gray-500 ml-1 text-center">
                {technician.services?.join(', ')}
              </Text>

            </View>

            {/* Availability */}

            {technician.available ? (

              <View className="flex-row items-center bg-green-50 px-4 py-2 rounded-full mt-4">

                <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />

                <Text className="text-xs text-green-700 font-bold">
                  Available Now
                </Text>

              </View>

            ) : (

              <View className="flex-row items-center bg-gray-100 px-4 py-2 rounded-full mt-4">

                <View className="w-2 h-2 rounded-full bg-gray-400 mr-2" />

                <Text className="text-xs text-gray-500 font-bold">
                  Currently Busy
                </Text>

              </View>

            )}

          </View>

        </Animated.View>

        {/* =================================================
            STATS
        ================================================= */}

        <Animated.View
          style={slideUp(statsAnim)}
          className="px-6 mt-4"
        >

          <View
            className="flex-row bg-white rounded-[24px] py-5"
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

            {/* Rating */}

            <View className="items-center flex-1">

              <View className="w-9 h-9 rounded-full bg-[#FFF3D2] items-center justify-center mb-2">

                <Ionicons
                  name="star"
                  size={17}
                  color="#D99A00"
                />

              </View>

              <Text className="text-base font-extrabold text-gray-950">
                {technician.rating || 0}
              </Text>

              <Text className="text-[10px] text-gray-400 mt-1">
                {technician.reviews} reviews
              </Text>

            </View>

            <View className="w-[1px] bg-gray-100" />

            {/* Jobs */}

            <View className="items-center flex-1">

              <View className="w-9 h-9 rounded-full bg-[#FFF3D2] items-center justify-center mb-2">

                <Ionicons
                  name="briefcase-outline"
                  size={17}
                  color="#B77900"
                />

              </View>

              <Text className="text-base font-extrabold text-gray-950">
                {technician.completed_jobs || 0}
              </Text>

              <Text className="text-[10px] text-gray-400 mt-1">
                Jobs done
              </Text>

            </View>

            <View className="w-[1px] bg-gray-100" />

            {/* Experience */}

            <View className="items-center flex-1">

              <View className="w-9 h-9 rounded-full bg-[#FFF3D2] items-center justify-center mb-2">

                <Ionicons
                  name="ribbon-outline"
                  size={17}
                  color="#B77900"
                />

              </View>

              <Text
                className="text-base font-extrabold text-gray-950"
                numberOfLines={1}
              >
                {technician.experience || 'N/A'}
              </Text>

              <Text className="text-[10px] text-gray-400 mt-1">
                Experience
              </Text>

            </View>

          </View>

        </Animated.View>

        {/* =================================================
            ABOUT
        ================================================= */}

        {technician.bio ? (

          <Animated.View
            style={slideUp(contentAnim)}
            className="px-6 mt-7"
          >

            <View className="flex-row items-center mb-3">

              <View className="w-9 h-9 rounded-full bg-[#FFF0C7] items-center justify-center mr-3">

                <Ionicons
                  name="person-outline"
                  size={17}
                  color="#B77900"
                />

              </View>

              <Text className="text-lg font-extrabold text-gray-950">
                About
              </Text>

            </View>

            <View
              className="bg-white rounded-[24px] p-5"
              style={{
                elevation: 2,
                shadowColor: '#000',
                shadowOpacity: 0.04,
                shadowRadius: 6,
              }}
            >

              <Text className="text-sm text-gray-600 leading-6">
                {technician.bio}
              </Text>

            </View>

          </Animated.View>

        ) : null}

        {/* =================================================
            LOCATION
        ================================================= */}

        {technician.address ? (

          <Animated.View
            style={slideUp(contentAnim)}
            className="px-6 mt-7"
          >

            <View className="flex-row items-center mb-3">

              <View className="w-9 h-9 rounded-full bg-[#FFF0C7] items-center justify-center mr-3">

                <Ionicons
                  name="location-outline"
                  size={18}
                  color="#B77900"
                />

              </View>

              <Text className="text-lg font-extrabold text-gray-950">
                Location
              </Text>

            </View>

            <View
              className="bg-white rounded-[24px] p-5 flex-row items-start"
              style={{
                elevation: 2,
                shadowColor: '#000',
                shadowOpacity: 0.04,
                shadowRadius: 6,
              }}
            >

              <View className="w-11 h-11 rounded-full bg-[#FFF3D2] items-center justify-center">

                <Ionicons
                  name="location"
                  size={19}
                  color="#B77900"
                />

              </View>

              <View className="ml-3 flex-1">

                <Text className="text-xs text-gray-400">
                  Service Area
                </Text>

                <Text className="text-sm text-gray-800 font-semibold leading-5 mt-1">
                  {technician.address}
                </Text>

              </View>

            </View>

          </Animated.View>

        ) : null}

        {/* =================================================
            REVIEWS
        ================================================= */}

        <Animated.View
          style={slideUp(reviewAnim)}
          className="px-6 mt-7"
        >

          {/* Review heading */}

          <View className="flex-row items-center justify-between mb-3">

            <View className="flex-row items-center">

              <View className="w-9 h-9 rounded-full bg-[#FFF0C7] items-center justify-center mr-3">

                <Ionicons
                  name="star-outline"
                  size={17}
                  color="#B77900"
                />

              </View>

              <Text className="text-lg font-extrabold text-gray-950">
                Reviews
              </Text>

            </View>

            {technician.reviews > 0 && (

              <View className="bg-[#FFF3D2] px-3 py-1.5 rounded-full">

                <Text className="text-[11px] font-bold text-[#B77900]">
                  {technician.reviews} total
                </Text>

              </View>

            )}

          </View>

          {/* Reviews */}

          {technician.recent_reviews &&
          technician.recent_reviews.length > 0 ? (

            <View
              className="bg-white rounded-[24px] px-5"
              style={{
                elevation: 2,
                shadowColor: '#000',
                shadowOpacity: 0.04,
                shadowRadius: 6,
              }}
            >

              {technician.recent_reviews.map(
                (
                  review: TechnicianReview,
                  index: number
                ) => (

                  <View
                    key={index}
                    className={`py-5 ${
                     index !==
(technician.recent_reviews?.length ?? 0) - 1
  ? 'border-b border-gray-100'
  : ''
                    }`}
                  >

                    {/* Customer */}

                    <View className="flex-row items-center">

                      <View className="w-10 h-10 rounded-full bg-[#FFF3D2] items-center justify-center mr-3">

                        <Ionicons
                          name="person-outline"
                          size={17}
                          color="#B77900"
                        />

                      </View>

                      <View className="flex-1">

                        <Text className="text-sm font-extrabold text-gray-900">
                          {review.customer_name}
                        </Text>

                        {/* Stars */}

                        <View className="flex-row items-center mt-1">

                          {[...Array(5)].map(
                            (_, i) => (

                              <Ionicons
                                key={i}
                                name="star"
                                size={12}
                                color={
                                  i <
                                  review.rating
                                    ? '#FFC342'
                                    : '#E5E7EB'
                                }
                              />

                            )
                          )}

                        </View>

                      </View>

                      <Text className="text-[10px] text-gray-400">
                        {review.created_at}
                      </Text>

                    </View>

                    {/* Comment */}

                    {review.comment ? (

                      <View className="bg-[#FFF8E8] rounded-[16px] p-3 mt-3">

                        <Text className="text-sm text-gray-600 leading-5">
                          {review.comment}
                        </Text>

                      </View>

                    ) : null}

                  </View>

                )
              )}

            </View>

          ) : (

            /* NO REVIEWS */

            <View className="bg-white rounded-[24px] py-8 items-center">

              <View className="w-14 h-14 rounded-full bg-[#FFF3D2] items-center justify-center">

                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={23}
                  color="#B77900"
                />

              </View>

              <Text className="text-sm font-bold text-gray-700 mt-3">
                No reviews yet
              </Text>

              <Text className="text-xs text-gray-400 mt-1">
                Still no reviews available.
              </Text>

            </View>

          )}

        </Animated.View>

      </ScrollView>

      {/* =================================================
          BOTTOM BOOKING BAR
      ================================================= */}

      <View
        className="bg-white px-6 pt-3 pb-4 border-t border-gray-100"
        style={{
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -3,
          },
          shadowOpacity: 0.05,
          shadowRadius: 7,
        }}
      >

        <View className="flex-row items-center">

          {/* Price */}

          <View className="flex-1">

            <Text className="text-xs text-gray-400">
              Starting from
            </Text>

            <View className="flex-row items-end mt-1">

              <Text className="text-xl font-extrabold text-gray-950">
                Rs. {technician.price}
              </Text>

              <Text className="text-xs text-gray-400 mb-1 ml-1">
                /visit
              </Text>

            </View>

          </View>

          {/* Book Button */}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              router.push(
                `/(customer)/booking/create?technicianId=${technician.id}&serviceCategoryId=${technician.service_ids?.[0] || 1}`
              )
            }
            className="bg-[#FFC342] rounded-full px-7 py-4"
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
                name="calendar-outline"
                size={18}
                color="#111827"
              />

              <Text className="text-gray-950 font-extrabold text-base ml-2">
                Book Now
              </Text>

            </View>

          </TouchableOpacity>

        </View>

      </View>

    </SafeAreaView>
  )
}