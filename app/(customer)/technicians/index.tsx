import { useAuth } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import ErrorState from '../../../components/ErrorState'
import TechnicianCard from '../../../components/TechnicianCard'
import { technicianService } from '../../../services/technicianService'
import { Technician } from '../../../types/technician'

const FILTERS = ['All', 'Available Now', 'Top Rated', 'Nearest', 'Cheapest']

export default function Technicians() {
  const { service } = useLocalSearchParams()
  const router = useRouter()
  const { getToken } = useAuth()

  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    loadTechnicians()
  }, [service])

  const loadTechnicians = async () => {
    try {
      setError(null)
      const token = await getToken()
      const data = await technicianService.getAll(token, service as string)
      setTechnicians(data)
    } catch (err: any) {
      console.log('Error loading technicians:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadTechnicians()
    setRefreshing(false)
  }

  const onRetry = () => {
    setLoading(true)
    loadTechnicians()
  }

  const filteredTechnicians = technicians
    .filter((tech) => tech.name.toLowerCase().includes(search.toLowerCase()))
    .filter((tech) => {
      if (activeFilter === 'Available Now') return tech.available
      if (activeFilter === 'Top Rated') return tech.rating >= 4.5
      return true
    })
    .sort((a, b) => {
      if (activeFilter === 'Cheapest') return a.price - b.price
      if (activeFilter === 'Top Rated') return b.rating - a.rating
      return 0
    })

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-6 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View>
          <Text className="text-xl font-bold text-gray-900">{service || 'Technicians'}</Text>
          {!error && (
            <Text className="text-sm text-gray-500">
              {filteredTechnicians.length} technicians nearby
            </Text>
          )}
        </View>
      </View>

      <View className="px-6 mt-3">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search technician by name..."
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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-4"
        style={{ maxHeight: 44, flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 10, alignItems: 'center' }}
      >
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter}
            onPress={() => setActiveFilter(filter)}
            style={{ height: 40, minWidth: 90 }}
            className={`items-center justify-center px-4 rounded-full border ${
              activeFilter === filter ? 'bg-black border-black' : 'bg-white border-gray-300'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                activeFilter === filter ? 'text-white' : 'text-gray-700'
              }`}
              numberOfLines={1}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        className="flex-1 mt-2 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <Text className="text-center text-gray-400 mt-8">Loading technicians...</Text>
        ) : error ? (
          <ErrorState message={error} onRetry={onRetry} />
        ) : filteredTechnicians.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Ionicons name="people-outline" size={40} color="#d1d5db" />
            <Text className="text-gray-400 text-sm mt-3">No technicians found</Text>
          </View>
        ) : (
          filteredTechnicians.map((tech) => (
            <TechnicianCard
              key={tech.id}
              technician={tech}
              onPress={() => router.push(`/(customer)/technicians/${tech.id}`)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}