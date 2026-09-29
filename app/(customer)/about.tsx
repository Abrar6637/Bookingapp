import { View, Text, TouchableOpacity, ScrollView, Image, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'

export default function About() {
  const router = useRouter()
  const version = Constants.expoConfig?.version || '1.0.0'

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-6 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">About BookingApp</Text>
      </View>

      <ScrollView className="flex-1 px-6 mt-4" showsVerticalScrollIndicator={false}>
        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-2xl bg-black items-center justify-center mb-3">
            <Ionicons name="construct" size={36} color="white" />
          </View>
          <Text className="text-xl font-bold text-gray-900">BookingApp</Text>
          <Text className="text-sm text-gray-400 mt-1">Version {version}</Text>
        </View>

        <Text className="text-sm text-gray-600 leading-6 mb-6">
          BookingApp is a platform that connects customers with verified technicians for various services. Our mission is to provide quick and reliable service to our users, ensuring that they can find the right professional for their needs in a timely manner.
        </Text>

        <View className="border-t border-gray-100 pt-4">
          <TouchableOpacity
            onPress={() => Linking.openURL('mailto:support@bookingapp.com')}
            className="flex-row items-center py-3"
          >
            <Ionicons name="mail-outline" size={20} color="#374151" />
            <Text className="text-sm text-gray-700 ml-3">support@bookingapp.com</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center py-3">
            <Ionicons name="document-text-outline" size={20} color="#374151" />
            <Text className="text-sm text-gray-700 ml-3">Terms & Conditions</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center py-3">
            <Ionicons name="shield-checkmark-outline" size={20} color="#374151" />
            <Text className="text-sm text-gray-700 ml-3">Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}