import { useAuth } from '@clerk/expo'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
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
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [price, setPrice] = useState('')
  const [experience, setExperience] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const onSubmit = async () => {
    if (selectedServices.length === 0) {
      Alert.alert('Error', 'Select at least one service')
      return
    }
    if (!price.trim()) {
      Alert.alert('Error', 'Enter you price')
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
          price: Number(price),
          experience,
          bio,
        },
      })

      router.replace('/(technician)/(tabs)')
    } catch (err: any) {
      console.log('Error saving profile:', err.message)
      Alert.alert('Error', err.message || 'something wrong, Try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-6 pb-2">
          <Text className="text-2xl font-bold text-gray-900">Setup Your Profile</Text>
          <Text className="text-sm text-gray-500 mt-1">
          Set up your profile to start receiving bookings.
          </Text>
        </View>

        {/* Select Services */}
        <View className="px-6 mt-6">
          <Text className="text-base font-bold text-gray-900 mb-3">
            Apki Services <Text className="text-gray-400 font-normal">(multiple select kar sakte hain)</Text>
          </Text>
          <View className="flex-row flex-wrap" style={{ gap: 10 }}>
            {SERVICES.map((service) => {
              const isSelected = selectedServices.includes(service.id)
              return (
                <TouchableOpacity
                  key={service.id}
                  onPress={() => toggleService(service.id)}
                  className={`flex-row items-center px-4 py-3 rounded-xl border ${
                    isSelected ? 'bg-black border-black' : 'bg-white border-gray-300'
                  }`}
                >
                  <MaterialCommunityIcons
                    name={service.icon as any}
                    size={18}
                    color={isSelected ? 'white' : '#374151'}
                  />
                  <Text
                    className={`text-sm font-medium ml-2 ${
                      isSelected ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {service.name}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* Price */}
        <View className="px-6 mt-6">
          <Text className="text-base font-bold text-gray-900 mb-2">Visit Charges (Rs.)</Text>
          <TextInput
            value={price}
            onChangeText={setPrice}
            placeholder="e.g. 500"
            placeholderTextColor="#9ca3af"
            keyboardType="number-pad"
            className="bg-gray-100 rounded-xl px-4 py-3 text-base"
          />
        </View>

        {/* Experience */}
        <View className="px-6 mt-6">
          <Text className="text-base font-bold text-gray-900 mb-2">Experience</Text>
          <TextInput
            value={experience}
            onChangeText={setExperience}
            placeholder="e.g. 5 years"
            placeholderTextColor="#9ca3af"
            className="bg-gray-100 rounded-xl px-4 py-3 text-base"
          />
        </View>

        {/* Bio */}
        <View className="px-6 mt-6 mb-6">
          <Text className="text-base font-bold text-gray-900 mb-2">
            About Yourself <Text className="text-gray-400 font-normal">(optional)</Text>
          </Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about your work..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            style={{ height: 100, textAlignVertical: 'top' }}
            className="bg-gray-100 rounded-xl px-4 py-3 text-base"
          />
        </View>
      </ScrollView>

      {/* Submit */}
      <View className="px-6 py-4 border-t border-gray-100">
        <TouchableOpacity
          onPress={onSubmit}
          disabled={loading}
          className="w-full bg-black rounded-xl p-4 items-center"
        >
          <Text className="text-white font-bold text-base">
            {loading ? 'Saving...' : 'Complete Setup'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}