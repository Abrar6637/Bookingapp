import { useAuth } from '@clerk/expo'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import {
  Animated,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import ErrorState from '../../../components/ErrorState'
import LoadingState from '../../../components/LoadingState'
import TechnicianCard from '../../../components/TechnicianCard'
import { SERVICE_COLORS } from '../../../constants'
import { bookingService } from '../../../services/bookingService'
import { serviceService } from '../../../services/serviceService'
import { technicianService } from '../../../services/technicianService'
import { useLocationStore } from '../../../store/locationStore'
import { useHomeStore } from '../../../store/homeStore'
import { ServiceCategory } from '../../../types/service'
import { Technician } from '../../../types/technician'

export default function Home() {
  const router = useRouter()
  const { getToken } = useAuth()

  const fullAddress = useLocationStore(
    (state) => state.fullAddress
  )

  const [search, setSearch] = useState('')

  const services = useHomeStore(
    (state) => state.services
  )

  const setServices = useHomeStore(
    (state) => state.setServices
  )

  const topTechnicians = useHomeStore(
    (state) => state.topTechnicians
  )

  const setTopTechnicians = useHomeStore(
    (state) => state.setTopTechnicians
  )

  const [loading, setLoading] = useState(
    services.length === 0
  )

  const [refreshing, setRefreshing] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const [hasUpdates, setHasUpdates] = useState(false)

  // =====================================================
  // ANIMATIONS
  // =====================================================

  const headerAnim = useRef(new Animated.Value(0)).current
  const contentAnim = useRef(new Animated.Value(0)).current
  const servicesAnim = useRef(new Animated.Value(0)).current
  const technicianAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),

      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),

      Animated.timing(servicesAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),

      Animated.timing(technicianAnim, {
        toValue: 1,
        duration: 450,
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

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    loadServices()
    loadTopTechnicians()
    checkForUpdates()
  }, [])

  const loadServices = async () => {
    try {
      setError(null)

      const token = await getToken()

      const data = await serviceService.getAll(token)

      setServices(data)
    } catch (err: any) {
      console.log(
        'Error loading services:',
        err.message
      )

      if (services.length === 0) {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const loadTopTechnicians = async () => {
    try {
      const token = await getToken()

      const data =
        await technicianService.getTopRated(token)

      setTopTechnicians(data)
    } catch (err: any) {
      console.log(
        'Error loading top technicians:',
        err.message
      )
    }
  }

  const checkForUpdates = async () => {
    try {
      const token = await getToken()

      const data = await bookingService.getAll(token)

      setHasUpdates(
        data.some(
          (b) =>
            b.status === 'Ongoing' ||
            b.status === 'Completed'
        )
      )
    } catch {
      // Notification badge only
    }
  }

  // =====================================================
  // REFRESH
  // =====================================================

  const onRefresh = async () => {
    setRefreshing(true)

    await Promise.all([
      loadServices(),
      loadTopTechnicians(),
    ])

    setRefreshing(false)
  }

  // =====================================================
  // RETRY
  // =====================================================

  const onRetry = () => {
    setLoading(true)
    loadServices()
  }

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredServices = services.filter((service) =>
    service.name
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  // =====================================================
  // UI
  // =====================================================

  return (
    <SafeAreaView
      edges={['top']}
      className="flex-1 bg-[#FFF8E8]"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FFC342']}
            tintColor="#FFC342"
          />
        }
      >

        {/* =================================================
            YELLOW HEADER
        ================================================= */}

        <Animated.View
          style={slideUp(headerAnim)}
          className="px-6 pt-5 pb-5"
        >

          {/* Location + Notification */}
          <View className="flex-row items-center justify-between">

            {/* Location */}
            <View className="flex-1 mr-4">

              <Text className="text-xs text-gray-800">
                Your Location
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  router.push(
                    '/(onboarding)/location-selection'
                  )
                }
                className="flex-row items-center mt-1"
              >
                <Ionicons
                  name="location"
                  size={18}
                  color="#111827"
                />

                <Text
                  className="text-base font-extrabold text-gray-950 ml-1 flex-shrink"
                  numberOfLines={1}
                >
                  {fullAddress || 'Select Location'}
                </Text>

                <Ionicons
                  name="chevron-down"
                  size={16}
                  color="#111827"
                />
              </TouchableOpacity>

            </View>

            {/* Notification */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                router.push(
                  '/(customer)/(tabs)/bookings'
                )
              }
              className="w-12 h-12 rounded-full bg-white/90 items-center justify-center"
              style={{
                elevation: 3,
                shadowColor: '#000',
                shadowOpacity: 0.08,
                shadowRadius: 5,
              }}
            >
              <Ionicons
                name="notifications-outline"
                size={23}
                color="#111827"
              />

              {hasUpdates && (
                <View className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-red-500 border border-white" />
              )}

            </TouchableOpacity>

          </View>

          {/* Welcome Text */}
          <View className="mt-3">

            <Text className="text-3xl font-extrabold text-gray-950">
              Find the right help
            </Text>

            <Text className="text-sm text-gray-800 mt-1">
              What service do you need today?
            </Text>

          </View>

        </Animated.View>

        {/* =================================================
            SEARCH - OVERLAP HEADER
        ================================================= */}

        <Animated.View
          style={slideUp(contentAnim)}
          className="px-6 mt-2"
        >
          <View
            className="flex-row items-center bg-white rounded-full px-5"
            style={{
              elevation: 6,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.1,
              shadowRadius: 8,
            }}
          >
            <Ionicons
              name="search-outline"
              size={21}
              color="#9CA3AF"
            />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search for a service..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-3 py-4 text-base text-gray-900"
            />

            {search.length > 0 && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setSearch('')}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            )}

          </View>
        </Animated.View>

        {/* =================================================
            URGENT HELP CARD
        ================================================= */}

        {!search && !error && (
          <Animated.View
            style={slideUp(contentAnim)}
            className="mx-6 mt-7"
          >
            <View
              className="bg-gray-950 rounded-[26px] p-5 overflow-hidden"
              style={{
                elevation: 4,
                shadowColor: '#000',
                shadowOpacity: 0.12,
                shadowRadius: 7,
              }}
            >

              {/* Decorative yellow circle */}
              <View className="absolute -right-8 -top-10 w-32 h-32 rounded-full bg-[#FFC342]" />

              <View className="absolute right-8 bottom-3 opacity-20">
                <MaterialCommunityIcons
                  name="tools"
                  size={75}
                  color="#FFC342"
                />
              </View>

              <View className="w-[75%]">

                <View className="flex-row items-center mb-2">

                  <View className="w-8 h-8 rounded-full bg-[#FFC342] items-center justify-center mr-2">
                    <Ionicons
                      name="flash"
                      size={17}
                      color="#111827"
                    />
                  </View>

                  <Text className="text-white text-lg font-extrabold">
                    Need urgent help?
                  </Text>

                </View>

                <Text className="text-gray-300 text-sm leading-5 mb-4">
                  Book a verified technician within
                  30 minutes
                </Text>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() =>
                    router.push(
                      '/(customer)/technicians?service=Electrician'
                    )
                  }
                  className="bg-[#FFC342] rounded-full py-3 px-5 self-start"
                >
                  <View className="flex-row items-center">

                    <Text className="text-gray-950 font-extrabold text-sm">
                      Book Now
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={16}
                      color="#111827"
                      style={{
                        marginLeft: 6,
                      }}
                    />

                  </View>
                </TouchableOpacity>

              </View>

            </View>
          </Animated.View>
        )}

        {/* =================================================
            SERVICES TITLE
        ================================================= */}

        {!error && (
          <Animated.View
            style={slideUp(servicesAnim)}
            className="px-6 mt-5 mb-5"
          >
            <View className="flex-row items-center justify-between">

              <View>
                <Text className="text-xl font-extrabold text-gray-950">
                  {search
                    ? `Results for "${search}"`
                    : 'All Services'}
                </Text>

                {!search && (
                  <Text className="text-xs text-gray-400 mt-1">
                    Choose the service you need
                  </Text>
                )}
              </View>

              {!search && (
                <View className="w-9 h-9 bg-[#FFF0C7] rounded-full items-center justify-center">
                  <Ionicons
                    name="grid-outline"
                    size={18}
                    color="#D99A00"
                  />
                </View>
              )}

            </View>
          </Animated.View>
        )}

        {/* =================================================
            SERVICES
        ================================================= */}

        {loading ? (
          <LoadingState message="Loading services..." />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={onRetry}
          />
        ) : filteredServices.length === 0 ? (

          <View className="mx-6 bg-white rounded-[24px] items-center justify-center py-10">

            <View className="w-14 h-14 rounded-full bg-[#FFF3D2] items-center justify-center">

              <Ionicons
                name="search-outline"
                size={27}
                color="#D99A00"
              />

            </View>

            <Text className="text-gray-500 text-sm mt-3">
              No services found
            </Text>

          </View>

        ) : (

          <Animated.View
            style={slideUp(servicesAnim)}
            className="flex-row flex-wrap px-6 justify-between"
          >
            {filteredServices.map((service) => {

              const serviceStyle =
                SERVICE_COLORS[service.name] || {
                  color: '#374151',
                  bg: '#f3f4f6',
                }

              return (
                <TouchableOpacity
                  key={service.id}
                  activeOpacity={0.75}
                  onPress={() =>
                    router.push(
                      `/(customer)/technicians?service=${service.name}`
                    )
                  }
                  className="w-[23%] items-center mb-6"
                >

                  <View
                    className="w-16 h-16 rounded-[20px] items-center justify-center mb-2"
                    style={{
                      backgroundColor:
                        serviceStyle.bg,

                      elevation: 2,

                      shadowColor: '#000',
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                    }}
                  >
                    <MaterialCommunityIcons
                      name={service.icon as any}
                      size={28}
                      color={serviceStyle.color}
                    />
                  </View>

                  <Text
                    className="text-xs text-gray-700 text-center font-semibold"
                    numberOfLines={2}
                  >
                    {service.name}
                  </Text>

                </TouchableOpacity>
              )
            })}
          </Animated.View>
        )}

        {/* =================================================
            TOP TECHNICIANS
        ================================================= */}

        {!search && !error && (
          <Animated.View
            style={slideUp(technicianAnim)}
            className="px-6 mt-3 mb-10"
          >

            {/* Heading */}
            <View className="flex-row items-center justify-between mb-4">

              <View>
                <Text className="text-xl font-extrabold text-gray-950">
                  Top Rated Technicians
                </Text>

                <Text className="text-xs text-gray-400 mt-1">
                  Professionals recommended for you
                </Text>
              </View>

              <View className="w-9 h-9 bg-[#FFF0C7] rounded-full items-center justify-center">

                <Ionicons
                  name="star"
                  size={18}
                  color="#D99A00"
                />

              </View>

            </View>

            {/* No Technicians */}
            {topTechnicians.length === 0 ? (

              <View
                className="bg-white rounded-[24px] items-center justify-center py-10"
                style={{
                  elevation: 2,
                  shadowColor: '#000',
                  shadowOpacity: 0.05,
                  shadowRadius: 5,
                }}
              >

                <View className="w-14 h-14 rounded-full bg-[#FFF3D2] items-center justify-center">

                  <Ionicons
                    name="star-outline"
                    size={28}
                    color="#D99A00"
                  />

                </View>

                <Text className="text-gray-500 text-sm mt-3">
                  No top-rated technicians available
                </Text>

              </View>

            ) : (

              topTechnicians.map((tech) => (
                <TechnicianCard
                  key={tech.id}
                  technician={tech}
                  onPress={() =>
                    router.push(
                      `/(customer)/technicians/${tech.id}`
                    )
                  }
                />
              ))

            )}

          </Animated.View>
        )}

      </ScrollView>
    </SafeAreaView>
  )
}