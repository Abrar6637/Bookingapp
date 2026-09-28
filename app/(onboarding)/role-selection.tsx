import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useUser } from '@clerk/expo'

export default function RoleSelection() {
  const router = useRouter()
  const { user } = useUser()
  const [selectedRole, setSelectedRole] = useState<'customer' | 'technician' | null>(null)
  const [loading, setLoading] = useState(false)

  const onContinue = async () => {
    if (!selectedRole || !user) return
    setLoading(true)
    try {
      console.log('Saving role:', selectedRole)

      // Role ko Clerk ke unsafeMetadata me save karein (naya method)
      await user.updateMetadata({
        unsafeMetadata: { role: selectedRole },
      })

      // Reload karein taake user object me naya metadata reflect ho
      await user.reload()

      console.log('Role after save:', user.unsafeMetadata?.role)

      if (selectedRole === 'customer') {
        router.replace('/(customer)/(tabs)')
      } else {
        router.replace('/(technician)/setup')
      }
    } catch (err) {
      console.log('Error saving role:', err)
    } finally {
      setLoading(false)
    }
  }
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-10">
        <Text className="text-3xl font-bold text-gray-900 mb-2">Welcome to BookingApp 👋</Text>
        <Text className="text-base text-gray-500 mb-10">Tell how to use this?</Text>

        <TouchableOpacity activeOpacity={0.7}
          onPress={() => setSelectedRole('customer')}
          className={`flex-row items-center p-5 rounded-2xl border-2 mb-4 ${selectedRole === 'customer' ? 'border-black bg-gray-50' : 'border-gray-200 bg-white'}`}
        >
          <View className="w-14 h-14 rounded-full bg-blue-100 items-center justify-center mr-4">
            <Ionicons name="person" size={26} color="#2563eb" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900">I am Customer</Text>
            <Text className="text-sm text-gray-500 mt-1">You want to book services?</Text>
          </View>
          {selectedRole === 'customer' && <Ionicons name="checkmark-circle" size={24} color="black" />}
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7}
          onPress={() => setSelectedRole('technician')}
          className={`flex-row items-center p-5 rounded-2xl border-2 ${selectedRole === 'technician' ? 'border-black bg-gray-50' : 'border-gray-200 bg-white'}`}
        >
          <View className="w-14 h-14 rounded-full bg-orange-100 items-center justify-center mr-4">
            <Ionicons name="construct" size={26} color="#ea580c" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900">I am Technician </Text>
            <Text className="text-sm text-gray-500 mt-1">what you want offer service?</Text>
          </View>
          {selectedRole === 'technician' && <Ionicons name="checkmark-circle" size={24} color="black" />}
        </TouchableOpacity>
      </View>

      <View className="px-6 pb-8">
        <TouchableOpacity activeOpacity={0.7}
          onPress={onContinue}
          disabled={!selectedRole || loading}
          className={`w-full rounded-xl p-4 items-center ${selectedRole ? 'bg-black' : 'bg-gray-300'}`}
        >
          <Text className="text-white font-bold text-base">{loading ? 'Saving...' : 'Continue'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}