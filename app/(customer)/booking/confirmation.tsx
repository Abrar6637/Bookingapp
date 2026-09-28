import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function BookingConfirmation() {
  const router = useRouter()

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        {/* Success Icon */}
        <View className="w-24 h-24 rounded-full bg-green-100 items-center justify-center mb-6">
          <Ionicons name="checkmark-circle" size={56} color="#22c55e" />
        </View>

        <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
          Booking Request Sent!
        </Text>
        <Text className="text-base text-gray-500 text-center leading-6 mb-8">
          Apki booking request technician ko bhej di gayi hai. Jaise hi wo accept karega, ap ko notification mil jayegi.
        </Text>

        {/* Booking Summary Card */}
        <View className="w-full bg-gray-50 rounded-2xl p-5 mb-8">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm text-gray-500">Booking ID</Text>
            <Text className="text-sm font-bold text-gray-900">#KW-20260922</Text>
          </View>
          <View className="h-[1px] bg-gray-200 mb-3" />

          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm text-gray-500">Technician</Text>
            <Text className="text-sm font-bold text-gray-900">Ahmed Ali</Text>
          </View>

          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm text-gray-500">Date & Time</Text>
            <Text className="text-sm font-bold text-gray-900">Today, 11:00 AM</Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-500">Status</Text>
            <View className="bg-yellow-100 px-3 py-1 rounded-full">
              <Text className="text-xs font-semibold text-yellow-700">Pending Confirmation</Text>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <TouchableOpacity activeOpacity={0.7}
          onPress={() => router.push('/(customer)/(tabs)/bookings')}
          className="w-full bg-black rounded-xl p-4 items-center mb-3"
        >
          <Text className="text-white font-bold text-base">Track Booking</Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7}
          onPress={() => router.replace('/(customer)/(tabs)')}
          className="w-full bg-white border border-gray-300 rounded-xl p-4 items-center"
        >
          <Text className="text-gray-700 font-bold text-base">Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}