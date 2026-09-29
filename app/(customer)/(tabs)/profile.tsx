import { useAuth, useUser } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useEffect } from 'react'

import { authService } from '../../../services/authService'

const MENU_ITEMS = [
  { id: '1', label: 'My Bookings', icon: 'calendar-outline', route: '/(customer)/(tabs)/bookings' },
  { id: '2', label: 'Saved Addresses', icon: 'location-outline', route: '/(customer)/saved-addresses' },
  { id: '3', label: 'Payment Methods', icon: 'card-outline', route: null },
  { id: '4', label: 'Notifications', icon: 'notifications-outline', route: '/(customer)/(tabs)/bookings' },
  { id: '5', label: 'Help & Support', icon: 'help-circle-outline', route: '/(customer)/help-support' },
  { id: '6', label: 'About BookingApp', icon: 'information-circle-outline', route: '/(customer)/about' },
]

export default function Profile() {
  const { user } = useUser()
  const { signOut } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({ total_bookings: 0, avg_rating_given: 0 })
  const { getToken } = useAuth()

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const token = await getToken()
      const data = await authService.getStats(token)
      setStats(data)
    } catch (err: any) {
      console.log('Error loading stats:', err.message)
    }
  }

  const onSignOutPress = () => {
    Alert.alert('Sign Out', 'You want to signout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut()
            router.replace('/(auth)/sign-in')
          } catch (err: any) {
            Alert.alert('Error', 'Sign out failed')
          }
        },
      },
    ])
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-2xl font-bold text-gray-900">Profile</Text>
        </View>

        {/* User Card */}
        <View className="mx-6 bg-gray-50 rounded-2xl p-5 flex-row items-center mb-6">
          <View className="w-16 h-16 rounded-full bg-gray-200 items-center justify-center mr-4">
            <Text className="text-2xl font-bold text-gray-500">
              {user?.firstName?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900">
              {user?.firstName || 'User'} {user?.lastName || ''}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              {user?.emailAddresses[0]?.emailAddress || user?.phoneNumbers[0]?.phoneNumber}
            </Text>
          </View>
          <TouchableOpacity activeOpacity={0.7} className="w-9 h-9 rounded-full bg-white items-center justify-center">
            <Ionicons name="pencil" size={16} color="black" />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View className="flex-row mx-6 mb-6">
          <View className="flex-1 items-center bg-gray-50 rounded-xl py-4 mr-2">
            <Text className="text-lg font-bold text-gray-900">{stats.total_bookings}</Text>
            <Text className="text-xs text-gray-500 mt-1">Total Bookings</Text>
          </View>
          <View className="flex-1 items-center bg-gray-50 rounded-xl py-4 ml-2">
            <Text className="text-lg font-bold text-gray-900">{stats.avg_rating_given || 'N/A'}</Text>
            <Text className="text-xs text-gray-500 mt-1">Avg Rating Given</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View className="px-6">
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() =>
                item.route
                  ? router.push(item.route as any)
                  : Alert.alert('Coming Soon', 'This feature will be coming soon.')
              }
              className="flex-row items-center py-4 border-b border-gray-100"
            >
              
              <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center mr-4">
                <Ionicons name={item.icon as any} size={20} color="#374151" />
              </View>
              <Text className="flex-1 text-base text-gray-900 font-medium">{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <View className="px-6 mt-6 mb-10">
          <TouchableOpacity activeOpacity={0.7}
            onPress={onSignOutPress}
            className="w-full bg-red-50 rounded-xl p-4 items-center flex-row justify-center"
          >
            <Ionicons name="log-out-outline" size={20} color="#dc2626" />
            <Text className="text-red-600 font-bold text-base ml-2">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}