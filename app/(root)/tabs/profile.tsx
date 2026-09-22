import { View, Text, TouchableOpacity, Alert } from 'react-native'
import { useUser, useAuth } from '@clerk/expo'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Profile() {
  const { user } = useUser()
  const { signOut } = useAuth()
  const router = useRouter()

  const onSignOutPress = async () => {
    try {
      await signOut()
      router.replace('/(auth)/sign-in')
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2))
      Alert.alert('Error', 'Sign out failed')
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center mb-4">
          <Text className="text-3xl font-bold text-gray-500">
            {user?.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase()}
          </Text>
        </View>

        <Text className="text-xl font-bold mb-1">
          {user?.firstName || 'User'}
        </Text>
        <Text className="text-gray-500 mb-8">
          {user?.emailAddresses[0]?.emailAddress}
        </Text>

        <TouchableOpacity
          onPress={onSignOutPress}
          className="w-full bg-red-500 rounded-lg p-4 items-center"
        >
          <Text className="text-white font-bold">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}