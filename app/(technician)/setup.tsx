import { useAuth } from '@clerk/expo'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
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

import { apiFetch } from '../../services/api'

const SERVICES = [
  { id: '1', name: 'Electrician', icon: 'flash' },
  { id: '2', name: 'Plumber', icon: 'pipe-wrench' },
  { id: '3', name: 'AC Repair', icon: 'air-conditioner' },
  { id: '4', name: 'Mechanic', icon: 'car-wrench' },
  { id: '5', name: 'Painter', icon: 'format-paint' },
  { id: '6', name: 'Cleaner', icon: 'broom' },
  { id: '7', name: 'Carpenter', icon: 'hammer' },
]

export default function TechnicianSetup() {
  const router = useRouter()
  const { getToken } = useAuth()

  // =====================================================
  // STATES
  // =====================================================

  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [price, setPrice] = useState('')
  const [experience, setExperience] = useState('')
  const [bio, setBio] = useState('')

  const [address, setAddress] = useState('')
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)

  const [locationLoading, setLocationLoading] = useState(false)
  const [loading, setLoading] = useState(false)

  // =====================================================
  // SERVICES
  // =====================================================

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id)
        ? prev.filter((serviceId) => serviceId !== id)
        : [...prev, id]
    )
  }

  // =====================================================
  // GET CURRENT LOCATION
  // =====================================================

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true)

      // Ask permission
      const { status } =
        await Location.requestForegroundPermissionsAsync()

      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please allow location access so customers can find technicians near them.'
        )

        return
      }

      // Get GPS coordinates
      const currentLocation =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })

      const {
        latitude: currentLatitude,
        longitude: currentLongitude,
      } = currentLocation.coords

      // Convert GPS coordinates to readable address
      const addresses =
        await Location.reverseGeocodeAsync({
          latitude: currentLatitude,
          longitude: currentLongitude,
        })

      const locationAddress = addresses[0]

      // Build readable address
      let formattedAddress = 'Current Location'

      if (locationAddress) {
        const addressParts = [
          locationAddress.name,
          locationAddress.street,
          locationAddress.district,
          locationAddress.city,
          locationAddress.region,
        ].filter(
          (value, index, array) =>
            value &&
            array.indexOf(value) === index
        )

        if (addressParts.length > 0) {
          formattedAddress = addressParts.join(', ')
        }
      }

      // Save locally
      setAddress(formattedAddress)
      setLatitude(currentLatitude)
      setLongitude(currentLongitude)
    } catch (error: any) {
      console.log('Technician location error:', error)

      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please make sure GPS is enabled and try again.'
      )
    } finally {
      setLocationLoading(false)
    }
  }

  // =====================================================
  // SUBMIT
  // =====================================================

  const onSubmit = async () => {
    if (selectedServices.length === 0) {
      Alert.alert(
        'Services Required',
        'Select at least one service.'
      )
      return
    }

    if (!price.trim()) {
      Alert.alert(
        'Price Required',
        'Enter your visit charges.'
      )
      return
    }

    const numericPrice = Number(price)

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice < 0
    ) {
      Alert.alert(
        'Invalid Price',
        'Please enter a valid visit charge.'
      )
      return
    }

    // Location required for nearby/nearest feature
    if (
      !address ||
      latitude === null ||
      longitude === null
    ) {
      Alert.alert(
        'Location Required',
        'Please use your current location so customers can find you nearby.'
      )
      return
    }

    setLoading(true)

    try {
      const token = await getToken()

      await apiFetch('/technician/profile', {
        method: 'POST',
        token,
        body: {
          service_ids: selectedServices.map(Number),
          price: numericPrice,
          experience,
          bio,

          // Location
          address,
          latitude,
          longitude,
        },
      })

      router.replace('/(technician)/(tabs)')
    } catch (err: any) {
      console.log(
        'Error saving profile:',
        err.message
      )

      Alert.alert(
        'Error',
        err.message ||
          'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 30,
        }}
      >
        {/* ===============================================
            HEADER
        =============================================== */}

        <View className="px-6 pt-5">
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-[#FFC342] items-center justify-center">
              <MaterialCommunityIcons
                name="account-hard-hat"
                size={25}
                color="#111827"
              />
            </View>

            <View className="flex-1 ml-3">
              <Text className="text-[24px] font-extrabold text-gray-950">
                Setup Your Profile
              </Text>

              <Text className="text-xs text-gray-500 mt-1">
                Start receiving bookings from customers
              </Text>
            </View>
          </View>
        </View>

        {/* ===============================================
            SERVICES
        =============================================== */}

        <View className="px-6 mt-7">
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 rounded-full bg-[#FFF0C7] items-center justify-center">
              <MaterialCommunityIcons
                name="tools"
                size={16}
                color="#B77900"
              />
            </View>

            <View className="ml-2">
              <Text className="text-base font-extrabold text-gray-950">
                Your Services
              </Text>

              <Text className="text-[11px] text-gray-400">
                You can select multiple services
              </Text>
            </View>
          </View>

          <View
            className="flex-row flex-wrap"
            style={{
              gap: 9,
            }}
          >
            {SERVICES.map((service) => {
              const isSelected =
                selectedServices.includes(service.id)

              return (
                <TouchableOpacity
                  key={service.id}
                  activeOpacity={0.75}
                  onPress={() =>
                    toggleService(service.id)
                  }
                  className={`flex-row items-center px-4 py-3 rounded-full border ${
                    isSelected
                      ? 'bg-[#FFC342] border-[#FFC342]'
                      : 'bg-white border-gray-100'
                  }`}
                >
                  <MaterialCommunityIcons
                    name={service.icon as any}
                    size={17}
                    color={
                      isSelected
                        ? '#111827'
                        : '#6B7280'
                    }
                  />

                  <Text
                    className={`text-xs ml-2 ${
                      isSelected
                        ? 'font-extrabold text-gray-950'
                        : 'font-semibold text-gray-600'
                    }`}
                  >
                    {service.name}
                  </Text>

                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#111827"
                      style={{
                        marginLeft: 6,
                      }}
                    />
                  )}
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* ===============================================
            LOCATION
        =============================================== */}

        <View className="px-6 mt-7">
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 rounded-full bg-[#FFF0C7] items-center justify-center">
              <Ionicons
                name="location"
                size={16}
                color="#B77900"
              />
            </View>

            <View className="ml-2">
              <Text className="text-base font-extrabold text-gray-950">
                Service Location
              </Text>

              <Text className="text-[11px] text-gray-400">
                Used to show you to nearby customers
              </Text>
            </View>
          </View>

          {latitude !== null &&
          longitude !== null ? (
            /* Location selected */

            <View
              className="bg-white rounded-[22px] p-4"
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
              <View className="flex-row items-center">
                <View className="w-11 h-11 rounded-full bg-[#FFF3D2] items-center justify-center">
                  <Ionicons
                    name="location"
                    size={20}
                    color="#B77900"
                  />
                </View>

                <View className="flex-1 ml-3">
                  <View className="flex-row items-center">
                    <Text className="text-sm font-extrabold text-gray-900">
                      Location Detected
                    </Text>

                    <View className="w-2 h-2 rounded-full bg-green-500 ml-2" />
                  </View>

                  <Text
                    className="text-xs text-gray-500 mt-1 leading-5"
                    numberOfLines={2}
                  >
                    {address}
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  disabled={locationLoading}
                  onPress={getCurrentLocation}
                  className="w-9 h-9 rounded-full bg-[#FFF3D2] items-center justify-center ml-2"
                >
                  {locationLoading ? (
                    <ActivityIndicator
                      size="small"
                      color="#B77900"
                    />
                  ) : (
                    <Ionicons
                      name="refresh"
                      size={17}
                      color="#B77900"
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* Get location */

            <TouchableOpacity
              activeOpacity={0.8}
              disabled={locationLoading}
              onPress={getCurrentLocation}
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
                  <Text className="text-sm font-extrabold text-gray-950">
                    {locationLoading
                      ? 'Detecting Location...'
                      : 'Use My Current Location'}
                  </Text>

                  <Text className="text-xs text-gray-700 mt-1">
                    {locationLoading
                      ? 'Please wait while we locate you'
                      : 'Required for nearby customer bookings'}
                  </Text>
                </View>

                {!locationLoading && (
                  <Ionicons
                    name="chevron-forward"
                    size={19}
                    color="#111827"
                  />
                )}
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* ===============================================
            VISIT CHARGES
        =============================================== */}

        <View className="px-6 mt-7">
          <Text className="text-sm font-extrabold text-gray-900 mb-2">
            Visit Charges
          </Text>

          <View
            className="flex-row items-center bg-white rounded-[18px] px-4"
            style={{
              elevation: 1,
              shadowColor: '#000',
              shadowOpacity: 0.03,
              shadowRadius: 4,
            }}
          >
            <View className="bg-[#FFF3D2] rounded-full px-3 py-1.5">
              <Text className="text-xs font-extrabold text-[#B77900]">
                Rs.
              </Text>
            </View>

            <TextInput
              value={price}
              onChangeText={setPrice}
              placeholder="e.g. 500"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              className="flex-1 ml-3 py-4 text-base text-gray-900"
            />
          </View>
        </View>

        {/* ===============================================
            EXPERIENCE
        =============================================== */}

        <View className="px-6 mt-6">
          <Text className="text-sm font-extrabold text-gray-900 mb-2">
            Experience
          </Text>

          <View
            className="flex-row items-center bg-white rounded-[18px] px-4"
            style={{
              elevation: 1,
              shadowColor: '#000',
              shadowOpacity: 0.03,
              shadowRadius: 4,
            }}
          >
            <View className="w-9 h-9 rounded-full bg-[#FFF3D2] items-center justify-center">
              <MaterialCommunityIcons
                name="briefcase-outline"
                size={17}
                color="#B77900"
              />
            </View>

            <TextInput
              value={experience}
              onChangeText={setExperience}
              placeholder="e.g. 5 years"
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-3 py-4 text-base text-gray-900"
            />
          </View>
        </View>

        {/* ===============================================
            BIO
        =============================================== */}

        <View className="px-6 mt-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-extrabold text-gray-900">
              About Yourself
            </Text>

            <Text className="text-[11px] text-gray-400">
              Optional
            </Text>
          </View>

          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Tell customers about your work and experience..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            maxLength={500}
            style={{
              height: 120,
              textAlignVertical: 'top',
              elevation: 1,
              shadowColor: '#000',
              shadowOpacity: 0.03,
              shadowRadius: 4,
            }}
            className="bg-white rounded-[18px] px-4 py-4 text-sm text-gray-900"
          />

          <Text className="text-[10px] text-gray-400 text-right mt-1">
            {bio.length}/500
          </Text>
        </View>
      </ScrollView>

      {/* ===============================================
          SUBMIT
      =============================================== */}

      <View
        className="bg-white px-6 pt-4 pb-5 border-t border-gray-100"
        style={{
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -3,
          },
          shadowOpacity: 0.05,
          shadowRadius: 6,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onSubmit}
          disabled={loading || locationLoading}
          className={`w-full rounded-full py-4 items-center ${
            loading || locationLoading
              ? 'bg-[#FFD978]'
              : 'bg-[#FFC342]'
          }`}
        >
          {loading ? (
            <View className="flex-row items-center">
              <ActivityIndicator
                size="small"
                color="#111827"
              />

              <Text className="text-gray-950 font-extrabold text-base ml-2">
                Saving Profile...
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center">
              <Text className="text-gray-950 font-extrabold text-base">
                Complete Setup
              </Text>

              <Ionicons
                name="arrow-forward"
                size={18}
                color="#111827"
                style={{
                  marginLeft: 8,
                }}
              />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}