import { useAuth } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import {
  Alert,
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
import { technicianService } from '../../../services/technicianService'
import { useLocationStore } from '../../../store/locationStore'
import { useTechnicianStore } from '../../../store/technicianStore'

const FILTERS = [
  'All',
  'Available Now',
  'Top Rated',
  'Nearest',
  'Cheapest',
]

export default function Technicians() {
  const { service } = useLocalSearchParams()

  const router = useRouter()
  const { getToken } = useAuth()

  // =====================================================
  // CUSTOMER LOCATION
  // =====================================================

  const customerLatitude = useLocationStore(
    (state) => state.latitude
  )

  const customerLongitude = useLocationStore(
    (state) => state.longitude
  )

  // =====================================================
  // STATES
  // =====================================================

  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] =
    useState('All')

  const serviceKey =
    typeof service === 'string'
      ? service
      : 'All'

  const techniciansByService =
    useTechnicianStore(
      (state) => state.techniciansByService
    )

  const setCachedTechnicians =
    useTechnicianStore(
      (state) => state.setTechnicians
    )

  const technicians =
    techniciansByService[serviceKey] ?? []

  const [loading, setLoading] = useState(
    technicians.length === 0
  )

  const [refreshing, setRefreshing] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  // =====================================================
  // ANIMATIONS
  // =====================================================

  const headerAnim = useRef(
    new Animated.Value(0)
  ).current

  const searchAnim = useRef(
    new Animated.Value(0)
  ).current

  const filterAnim = useRef(
    new Animated.Value(0)
  ).current

  const listAnim = useRef(
    new Animated.Value(0)
  ).current

  const runAnimations = () => {
    headerAnim.setValue(0)
    searchAnim.setValue(0)
    filterAnim.setValue(0)
    listAnim.setValue(0)

    Animated.stagger(90, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),

      Animated.timing(searchAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),

      Animated.timing(filterAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),

      Animated.timing(listAnim, {
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
          outputRange: [18, 0],
        }),
      },
    ],
  })

  // =====================================================
  // DISTANCE CALCULATION
  // =====================================================

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const earthRadius = 6371

    const toRadians = (degree: number) =>
      degree * (Math.PI / 180)

    const latitudeDifference =
      toRadians(lat2 - lat1)

    const longitudeDifference =
      toRadians(lon2 - lon1)

    const a =
      Math.sin(latitudeDifference / 2) *
      Math.sin(latitudeDifference / 2) +
      Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(longitudeDifference / 2) *
      Math.sin(longitudeDifference / 2)

    const c =
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      )

    return earthRadius * c
  }

  // =====================================================
  // ADD DISTANCE TO TECHNICIANS
  // =====================================================

  const techniciansWithDistance =
    technicians.map((tech) => {
      if (
        customerLatitude === null ||
        customerLongitude === null ||
        tech.latitude === null ||
        tech.latitude === undefined ||
        tech.longitude === null ||
        tech.longitude === undefined
      ) {
        return {
          ...tech,
          distance: null,
        }
      }

      const distance = calculateDistance(
        customerLatitude,
        customerLongitude,
        Number(tech.latitude),
        Number(tech.longitude)
      )

      return {
        ...tech,
        distance,
      }
    })

  // =====================================================
  // LOAD TECHNICIANS
  // =====================================================

  useEffect(() => {
    const cachedTechnicians =
      techniciansByService[serviceKey] ?? []

    // Cache nahi hai to hi loading screen dikhao
    setLoading(cachedTechnicians.length === 0)

    // API phir bhi chalegi taake fresh data aaye
    loadTechnicians()
  }, [service])

  const loadTechnicians = async () => {
    try {
      setError(null)

      const token = await getToken()

      const data =
        await technicianService.getAll(
          token,
          service as string
        )

      setCachedTechnicians(serviceKey, data)

      runAnimations()
    } catch (err: any) {
      console.log(
        'Error loading technicians:',
        err.message
      )

      if (technicians.length === 0) {
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

    await loadTechnicians()

    setRefreshing(false)
  }

  // =====================================================
  // RETRY
  // =====================================================

  const onRetry = () => {
    setLoading(true)

    loadTechnicians()
  }

  // =====================================================
  // FILTER CHANGE
  // =====================================================

  const handleFilterChange = (
    filter: string
  ) => {
    // Nearest needs actual customer GPS coordinates

    if (
      filter === 'Nearest' &&
      (customerLatitude === null ||
        customerLongitude === null)
    ) {
      Alert.alert(
        'Location Required',
        'Please set your current location to find technicians nearest to you.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Set Location',
            onPress: () => {
              router.push('/(onboarding)/location-selection')
            },
          },
        ]
      )

      return
    }

    setActiveFilter(filter)
  }

  // =====================================================
  // FILTER + SORT
  // =====================================================

  const filteredTechnicians =
    techniciansWithDistance
      .filter((tech) =>
        tech.name
          .toLowerCase()
          .includes(search.toLowerCase())
      )
      .filter((tech) => {
        if (
          activeFilter === 'Available Now'
        ) {
          return tech.available
        }

        if (
          activeFilter === 'Top Rated'
        ) {
          return tech.rating >= 4.5
        }

        return true
      })
      .sort((a, b) => {
        // Cheapest first

        if (activeFilter === 'Cheapest') {
          return a.price - b.price
        }

        // Highest rated first

        if (activeFilter === 'Top Rated') {
          return b.rating - a.rating
        }

        // Nearest first

        if (activeFilter === 'Nearest') {
          const distanceA =
            a.distance ?? Infinity

          const distanceB =
            b.distance ?? Infinity

          return distanceA - distanceB
        }

        return 0
      })

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
        className="px-6 pt-4"
      >
        <View className="flex-row items-center">

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

            <Text
              className="text-[22px] font-extrabold text-gray-950"
              numberOfLines={1}
            >
              {service || 'Technicians'}
            </Text>

            {!error && (
              <View className="flex-row items-center mt-1">

                <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />

                <Text className="text-xs text-gray-500">
                  {filteredTechnicians.length}{' '}
                  {activeFilter === 'Nearest'
                    ? 'technicians nearby'
                    : 'technicians found'}
                </Text>

              </View>
            )}

          </View>

          <View className="w-11 h-11 rounded-full bg-[#FFC342] items-center justify-center">
            <Ionicons
              name="people-outline"
              size={21}
              color="#111827"
            />
          </View>

        </View>
      </Animated.View>

      {/* =================================================
          SEARCH
      ================================================= */}

      <Animated.View
        style={slideUp(searchAnim)}
        className="px-6 mt-5"
      >
        <View
          className="flex-row items-center bg-white rounded-[20px] px-4 h-[54px]"
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

          <View className="w-8 h-8 rounded-full bg-[#FFF3D2] items-center justify-center">
            <Ionicons
              name="search"
              size={16}
              color="#B77900"
            />
          </View>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search technician by name..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-3 text-sm text-gray-900"
          />

          {search.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setSearch('')}
              className="w-8 h-8 items-center justify-center"
            >
              <Ionicons
                name="close-circle"
                size={19}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          )}

        </View>
      </Animated.View>

      {/* =================================================
          FILTER HEADING
      ================================================= */}

      <Animated.View
        style={slideUp(filterAnim)}
        className="flex-row items-center justify-between px-6 mt-5 mb-2"
      >

        <View className="flex-row items-center">

          <View className="w-8 h-8 rounded-full bg-[#FFF0C7] items-center justify-center mr-2">
            <Ionicons
              name="options-outline"
              size={15}
              color="#B77900"
            />
          </View>

          <Text className="text-sm font-extrabold text-gray-900">
            Filter By
          </Text>

        </View>

        {activeFilter !== 'All' && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              setActiveFilter('All')
            }
          >
            <Text className="text-xs font-bold text-[#B77900]">
              Clear
            </Text>
          </TouchableOpacity>
        )}

      </Animated.View>

      {/* =================================================
          FILTERS
      ================================================= */}

      <Animated.View
        style={[
          slideUp(filterAnim),
          {
            height: 52,
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{
            flexGrow: 0,
          }}
          contentContainerStyle={{
            paddingHorizontal: 24,
            gap: 8,
            alignItems: 'center',
          }}
        >
          {FILTERS.map((filter) => {
            const isActive =
              activeFilter === filter

            let icon:
              | 'apps-outline'
              | 'flash-outline'
              | 'star-outline'
              | 'navigate-outline'
              | 'cash-outline' =
              'apps-outline'

            if (
              filter === 'Available Now'
            ) {
              icon = 'flash-outline'
            }

            if (filter === 'Top Rated') {
              icon = 'star-outline'
            }

            if (filter === 'Nearest') {
              icon = 'navigate-outline'
            }

            if (filter === 'Cheapest') {
              icon = 'cash-outline'
            }

            return (
              <TouchableOpacity
                key={filter}
                activeOpacity={0.75}
                onPress={() =>
                  handleFilterChange(filter)
                }
                className={`flex-row items-center px-4 h-10 rounded-full border ${isActive
                    ? 'bg-[#FFC342] border-[#FFC342]'
                    : 'bg-white border-gray-100'
                  }`}
              >
                <Ionicons
                  name={icon}
                  size={14}
                  color={
                    isActive
                      ? '#111827'
                      : '#9CA3AF'
                  }
                />

                <Text
                  className={`text-xs ml-1.5 ${isActive
                      ? 'font-extrabold text-gray-950'
                      : 'font-semibold text-gray-600'
                    }`}
                  numberOfLines={1}
                >
                  {filter}
                </Text>

              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </Animated.View>

      {/* =================================================
          NEAREST INFO
      ================================================= */}

      {activeFilter === 'Nearest' && (
        <View className="mx-6 mt-2 bg-[#FFF0C7] rounded-2xl px-4 py-3">

          <View className="flex-row items-center">

            <Ionicons
              name="navigate"
              size={16}
              color="#B77900"
            />

            <Text className="flex-1 text-xs text-[#8A6200] ml-2">
              Showing technicians closest to your current location.
            </Text>

          </View>

        </View>
      )}

      {/* =================================================
          RESULTS HEADER
      ================================================= */}

      {!loading &&
        !error &&
        filteredTechnicians.length > 0 && (
          <Animated.View
            style={slideUp(listAnim)}
            className="flex-row items-center justify-between px-6 mt-3 mb-2"
          >

            <Text className="text-lg font-extrabold text-gray-950">
              {activeFilter === 'Nearest'
                ? 'Nearest Experts'
                : 'Available Experts'}
            </Text>

            <View className="bg-[#FFF3D2] px-3 py-1.5 rounded-full">
              <Text className="text-[11px] font-bold text-[#B77900]">
                {filteredTechnicians.length}{' '}
                found
              </Text>
            </View>

          </Animated.View>
        )}

      {/* =================================================
          LIST
      ================================================= */}

      <Animated.View
        style={[
          slideUp(listAnim),
          {
            flex: 1,
          },
        ]}
      >
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingTop: 8,
            paddingBottom: 30,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#D99A00']}
              tintColor="#D99A00"
            />
          }
        >

          {loading ? (
            <View className="pt-8">
              <LoadingState message="Loading technicians..." />
            </View>
          ) : error ? (
            <View className="pt-8">
              <ErrorState
                message={error}
                onRetry={onRetry}
              />
            </View>
          ) : filteredTechnicians.length === 0 ? (
            <View className="items-center justify-center py-20">

              <View className="w-20 h-20 rounded-full bg-white items-center justify-center">
                <View className="w-14 h-14 rounded-full bg-[#FFF3D2] items-center justify-center">
                  <Ionicons
                    name="people-outline"
                    size={26}
                    color="#B77900"
                  />
                </View>
              </View>

              <Text className="text-base font-extrabold text-gray-800 mt-4">
                No technicians found
              </Text>

              <Text className="text-xs text-gray-400 text-center mt-2 px-8 leading-5">
                Try changing your search or selected filter.
              </Text>

              {(search.length > 0 ||
                activeFilter !== 'All') && (
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => {
                      setSearch('')
                      setActiveFilter('All')
                    }}
                    className="bg-[#FFC342] rounded-full px-5 py-3 mt-5"
                  >
                    <Text className="text-xs font-extrabold text-gray-950">
                      Reset Filters
                    </Text>
                  </TouchableOpacity>
                )}

            </View>
          ) : (
            filteredTechnicians.map(
              (tech) => (
                <TechnicianCard
                  key={tech.id}
                  technician={tech}
                  onPress={() =>
                    router.push(
                      `/(customer)/technicians/${tech.id}`
                    )
                  }
                />
              )
            )
          )}

        </ScrollView>
      </Animated.View>

    </SafeAreaView>
  )
}