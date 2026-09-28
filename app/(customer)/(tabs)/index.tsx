import { useAuth } from '@clerk/expo'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import ErrorState from '../../../components/ErrorState'
import { SERVICE_COLORS } from '../../../constants'
import { serviceService } from '../../../services/serviceService'
import { useLocationStore } from '../../../store/locationStore'
import { ServiceCategory } from '../../../types/service'

export default function Home() {
  const router = useRouter()
  const { getToken } = useAuth()
  const fullAddress = useLocationStore((state) => state.fullAddress)

  const [search, setSearch] = useState('')
  const [services, setServices] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      setError(null)
      const token = await getToken()
      const data = await serviceService.getAll(token)
      setServices(data)
    } catch (err: any) {
      console.log('Error loading services:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadServices()
    setRefreshing(false)
  }

  const onRetry = () => {
    setLoading(true)
    loadServices()
  }

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
          <View>
            <Text className="text-sm text-gray-500">Your Location</Text>
            <TouchableOpacity
              onPress={() => router.push('/(onboarding)/location-selection')}
              className="flex-row items-center mt-1"
            >
              <Ionicons name="location" size={16} color="black" />
              <Text className="text-base font-bold text-gray-900 ml-1">{fullAddress}</Text>
              <Ionicons name="chevron-down" size={16} color="black" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity className="w-11 h-11 rounded-full bg-gray-100 items-center justify-center">
            <Ionicons name="notifications-outline" size={22} color="black" />
          </TouchableOpacity>
        </View>

        <View className="px-6 mt-4">
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
            <Ionicons name="search" size={20} color="#9ca3af" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search for a service..."
              placeholderTextColor="#9ca3af"
              className="flex-1 ml-2 text-base"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {!search && !error && (
          <View className="mx-6 mt-6 bg-black rounded-2xl p-5 overflow-hidden">
            <Text className="text-white text-lg font-bold">Need urgent help? 🚨</Text>
            <Text className="text-gray-300 text-sm mt-1 mb-3">
              Book a verified technician within 30 minutes
            </Text>
            <TouchableOpacity className="bg-white rounded-lg py-2 px-4 self-start">
              <Text className="text-black font-bold text-sm">Book Now</Text>
            </TouchableOpacity>
          </View>
        )}

        {!error && (
          <View className="px-6 mt-8 mb-4">
            <Text className="text-xl font-bold text-gray-900">
              {search ? `Results for "${search}"` : 'All Services'}
            </Text>
          </View>
        )}

        {loading ? (
          <Text className="text-center text-gray-400 mt-4">Loading services...</Text>
        ) : error ? (
          <ErrorState message={error} onRetry={onRetry} />
        ) : filteredServices.length === 0 ? (
          <View className="items-center justify-center py-10">
            <Ionicons name="search-outline" size={32} color="#d1d5db" />
            <Text className="text-gray-400 text-sm mt-2">No services found</Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap px-6 justify-between">
            {filteredServices.map((service) => {
              const style = SERVICE_COLORS[service.name] || { color: '#374151', bg: '#f3f4f6' }
              return (
                <TouchableOpacity
                  key={service.id}
                  onPress={() => router.push(`/(customer)/technicians?service=${service.name}`)}
                  className="w-[23%] items-center mb-6"
                >
                  <View
                    style={{ backgroundColor: style.bg }}
                    className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
                  >
                    <MaterialCommunityIcons
                      name={service.icon as any}
                      size={28}
                      color={style.color}
                    />
                  </View>
                  <Text className="text-xs text-gray-700 text-center font-medium">
                    {service.name}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        )}

        {!search && !error && (
          <View className="px-6 mt-4 mb-8">
            <Text className="text-xl font-bold text-gray-900 mb-4">Top Rated Technicians</Text>
            <View className="bg-gray-50 rounded-2xl p-5 items-center justify-center py-10">
              <Ionicons name="star-outline" size={32} color="#9ca3af" />
              <Text className="text-gray-400 text-sm mt-2">
                Technicians list yahan aayegi (Laravel API se)
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}