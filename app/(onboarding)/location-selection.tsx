import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useLocationStore } from '../../store/locationStore'

const CITIES = [
  {
    name: 'Lahore',
    areas: ['DHA Phase 5', 'DHA Phase 6', 'Johar Town', 'Gulberg', 'Model Town', 'Bahria Town'],
  },
  {
    name: 'Karachi',
    areas: ['Clifton', 'DHA', 'Gulshan-e-Iqbal', 'North Nazimabad', 'Bahadurabad'],
  },
  {
    name: 'Islamabad',
    areas: ['F-6', 'F-7', 'F-10', 'G-9', 'Bahria Town'],
  },
]

export default function LocationSelection() {
  const router = useRouter()
  const setLocation = useLocationStore((state) => state.setLocation)
  const [search, setSearch] = useState('')
  const [selectedCity, setSelectedCity] = useState(CITIES[0].name)

  const currentCity = CITIES.find((c) => c.name === selectedCity)
  const filteredAreas = currentCity?.areas.filter((area) =>
    area.toLowerCase().includes(search.toLowerCase())
  ) || []

  const onSelectArea = (area: string) => {
    setLocation(selectedCity, area)
    router.back()
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-6 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Select Location</Text>
      </View>

      {/* Search */}
      <View className="px-6 mt-3">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search area..."
            placeholderTextColor="#9ca3af"
            className="flex-1 ml-2 text-base"
          />
        </View>
      </View>

      {/* City Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-4"
        style={{ maxHeight: 44, flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 10, alignItems: 'center' }}
      >
        {CITIES.map((city) => (
          <TouchableOpacity
            key={city.name}
            onPress={() => setSelectedCity(city.name)}
            style={{ height: 40 }}
            className={`items-center justify-center px-5 rounded-full border ${
              selectedCity === city.name ? 'bg-black border-black' : 'bg-white border-gray-300'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                selectedCity === city.name ? 'text-white' : 'text-gray-700'
              }`}
            >
              {city.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Areas List */}
      <ScrollView className="flex-1 px-6 mt-4" showsVerticalScrollIndicator={false}>
        <Text className="text-sm font-semibold text-gray-500 mb-3">
          Areas in {selectedCity}
        </Text>

        {filteredAreas.length === 0 ? (
          <Text className="text-gray-400 text-sm text-center mt-8">No areas found</Text>
        ) : (
          filteredAreas.map((area) => (
            <TouchableOpacity
              key={area}
              onPress={() => onSelectArea(area)}
              className="flex-row items-center py-4 border-b border-gray-100"
            >
              <Ionicons name="location-outline" size={20} color="#9ca3af" />
              <Text className="text-base text-gray-900 ml-3">{area}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}