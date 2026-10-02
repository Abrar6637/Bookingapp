import { Ionicons } from '@expo/vector-icons'
import * as Location from 'expo-location'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useLocationStore } from '../../store/locationStore'

const CITIES = [
  {
    name: 'Lahore',
    areas: [
      'DHA Phase 5',
      'DHA Phase 6',
      'Johar Town',
      'Gulberg',
      'Model Town',
      'Bahria Town',
    ],
  },
  {
    name: 'Karachi',
    areas: [
      'Clifton',
      'DHA',
      'Gulshan-e-Iqbal',
      'North Nazimabad',
      'Bahadurabad',
    ],
  },
  {
    name: 'Islamabad',
    areas: [
      'F-6',
      'F-7',
      'F-10',
      'G-9',
      'Bahria Town',
    ],
  },
]

export default function LocationSelection() {
  const router = useRouter()

  const setLocation = useLocationStore(
    (state) => state.setLocation
  )

  const [search, setSearch] = useState('')
  const [selectedCity, setSelectedCity] = useState(
    CITIES[0].name
  )

  const [locationLoading, setLocationLoading] =
    useState(false)

  // =====================================================
  // MANUAL LOCATION
  // =====================================================

  const currentCity = CITIES.find(
    (city) => city.name === selectedCity
  )

  const filteredAreas =
    currentCity?.areas.filter((area) =>
      area
        .toLowerCase()
        .includes(search.toLowerCase())
    ) || []

  const onSelectArea = (area: string) => {
    setLocation(
      selectedCity,
      area,
      null,
      null
    )

    router.back()
  }

  // =====================================================
  // CURRENT GPS LOCATION
  // =====================================================

  const useCurrentLocation = async () => {
    try {
      setLocationLoading(true)

      // -----------------------------------------------
      // Ask location permission
      // -----------------------------------------------

      const { status } =
        await Location.requestForegroundPermissionsAsync()

      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please allow location access to find technicians near you.'
        )

        return
      }

      // -----------------------------------------------
      // Get GPS coordinates
      // -----------------------------------------------

      const currentLocation =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })

      const {
        latitude,
        longitude,
      } = currentLocation.coords

      // -----------------------------------------------
      // Convert coordinates into address
      // -----------------------------------------------

      const addresses =
        await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        })

      const address = addresses[0]

      if (!address) {
        Alert.alert(
          'Location Error',
          'Unable to detect your address. Please select your location manually.'
        )

        return
      }

      // -----------------------------------------------
      // Prepare city
      // -----------------------------------------------

      const city =
        address.city ||
        address.subregion ||
        address.region ||
        'Current Location'

      // -----------------------------------------------
      // Prepare area
      // -----------------------------------------------

      const area =
        address.district ||
        address.subregion ||
        address.street ||
        address.name ||
        'Current Location'

      // -----------------------------------------------
      // Save in Zustand
      // -----------------------------------------------

      setLocation(
        city,
        area,
        latitude,
        longitude
      )

      // -----------------------------------------------
      // Go back to Home
      // -----------------------------------------------

      router.back()
    } catch (error: any) {
      console.log(
        'Location error:',
        error
      )

      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please try again or select your area manually.'
      )
    } finally {
      setLocationLoading(false)
    }
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

      <View className="flex-row items-center px-6 pt-4">

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

          <Text className="text-[22px] font-extrabold text-gray-950">
            Select Location
          </Text>

          <Text className="text-xs text-gray-500 mt-1">
            Find professionals near you
          </Text>

        </View>

        <View className="w-11 h-11 rounded-full bg-[#FFC342] items-center justify-center">

          <Ionicons
            name="location"
            size={21}
            color="#111827"
          />

        </View>

      </View>

      {/* =================================================
          CURRENT LOCATION
      ================================================= */}

      <View className="px-6 mt-6">

        <TouchableOpacity
          activeOpacity={0.8}
          disabled={locationLoading}
          onPress={useCurrentLocation}
          className="bg-[#FFC342] rounded-[22px] p-4"
          style={{
            elevation: 3,
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

            <View className="w-12 h-12 rounded-full bg-white/80 items-center justify-center">

              {locationLoading ? (

                <ActivityIndicator
                  size="small"
                  color="#111827"
                />

              ) : (

                <Ionicons
                  name="navigate"
                  size={22}
                  color="#111827"
                />

              )}

            </View>

            <View className="flex-1 ml-3">

              <Text className="text-base font-extrabold text-gray-950">

                {locationLoading
                  ? 'Detecting Location...'
                  : 'Use My Current Location'}

              </Text>

              <Text className="text-xs text-gray-700 mt-1">

                {locationLoading
                  ? 'Please wait while we locate you'
                  : 'Use GPS for accurate nearby results'}

              </Text>

            </View>

            {!locationLoading && (

              <Ionicons
                name="chevron-forward"
                size={20}
                color="#111827"
              />

            )}

          </View>

        </TouchableOpacity>

      </View>

      {/* =================================================
          OR
      ================================================= */}

      <View className="flex-row items-center px-6 mt-6">

        <View className="flex-1 h-[1px] bg-gray-200" />

        <Text className="text-xs text-gray-400 font-semibold mx-4">
          OR SELECT MANUALLY
        </Text>

        <View className="flex-1 h-[1px] bg-gray-200" />

      </View>

      {/* =================================================
          SEARCH
      ================================================= */}

      <View className="px-6 mt-5">

        <View
          className="flex-row items-center bg-white rounded-[20px] px-4 h-[54px]"
          style={{
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.04,
            shadowRadius: 5,
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
            placeholder="Search area..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-3 text-sm text-gray-900"
          />

          {search.length > 0 && (

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setSearch('')}
            >
              <Ionicons
                name="close-circle"
                size={19}
                color="#9CA3AF"
              />
            </TouchableOpacity>

          )}

        </View>

      </View>

      {/* =================================================
          CITY TABS
      ================================================= */}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-5"
        style={{
          maxHeight: 45,
          flexGrow: 0,
        }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          gap: 8,
          alignItems: 'center',
        }}
      >

        {CITIES.map((city) => {

          const isSelected =
            selectedCity === city.name

          return (
            <TouchableOpacity
              key={city.name}
              activeOpacity={0.75}
              onPress={() => {
                setSelectedCity(city.name)
                setSearch('')
              }}
              className={`items-center justify-center px-5 h-10 rounded-full border ${
                isSelected
                  ? 'bg-[#FFC342] border-[#FFC342]'
                  : 'bg-white border-gray-100'
              }`}
            >

              <Text
                className={`text-sm ${
                  isSelected
                    ? 'font-extrabold text-gray-950'
                    : 'font-semibold text-gray-600'
                }`}
              >
                {city.name}
              </Text>

            </TouchableOpacity>
          )
        })}

      </ScrollView>

      {/* =================================================
          AREAS
      ================================================= */}

      <ScrollView
        className="flex-1 px-6 mt-5"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 30,
        }}
      >

        <View className="flex-row items-center justify-between mb-3">

          <View>

            <Text className="text-lg font-extrabold text-gray-950">
              Areas in {selectedCity}
            </Text>

            <Text className="text-xs text-gray-400 mt-1">
              Choose your preferred area
            </Text>

          </View>

          <View className="bg-[#FFF3D2] rounded-full px-3 py-1.5">

            <Text className="text-[11px] font-bold text-[#B77900]">
              {filteredAreas.length} areas
            </Text>

          </View>

        </View>

        {/* Empty */}

        {filteredAreas.length === 0 ? (

          <View className="items-center py-16">

            <View className="w-16 h-16 rounded-full bg-white items-center justify-center">

              <Ionicons
                name="location-outline"
                size={27}
                color="#D99A00"
              />

            </View>

            <Text className="text-base font-bold text-gray-800 mt-4">
              No areas found
            </Text>

            <Text className="text-xs text-gray-400 mt-1">
              Try another search
            </Text>

          </View>

        ) : (

          <View
            className="bg-white rounded-[24px] px-4"
            style={{
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.04,
              shadowRadius: 5,
            }}
          >

            {filteredAreas.map(
              (area, index) => (

                <TouchableOpacity
                  key={area}
                  activeOpacity={0.7}
                  onPress={() =>
                    onSelectArea(area)
                  }
                  className={`flex-row items-center py-4 ${
                    index !==
                    filteredAreas.length - 1
                      ? 'border-b border-gray-100'
                      : ''
                  }`}
                >

                  <View className="w-10 h-10 rounded-full bg-[#FFF3D2] items-center justify-center">

                    <Ionicons
                      name="location-outline"
                      size={18}
                      color="#B77900"
                    />

                  </View>

                  <Text className="flex-1 text-sm font-semibold text-gray-800 ml-3">
                    {area}
                  </Text>

                  <Ionicons
                    name="chevron-forward"
                    size={17}
                    color="#D1D5DB"
                  />

                </TouchableOpacity>

              )
            )}

          </View>

        )}

      </ScrollView>

    </SafeAreaView>
  )
}