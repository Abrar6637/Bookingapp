import { Ionicons } from '@expo/vector-icons'
import { Text, TouchableOpacity, View } from 'react-native'

type Props = {
  message?: string
  onRetry: () => void
}

export default function ErrorState({ message, onRetry }: Props) {
  return (
    <View className="items-center justify-center py-20 px-6">
      <Ionicons name="cloud-offline-outline" size={44} color="#d1d5db" />
      <Text className="text-gray-900 font-bold text-base mt-3">Something went wrong</Text>
      <Text className="text-gray-500 text-sm mt-1 text-center">
        {message || 'Data load nahi ho saka. Internet check karke dobara try karein.'}
      </Text>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onRetry}
        className="mt-5 bg-black rounded-xl px-8 py-3"
      >
        <Text className="text-white font-bold">Retry</Text>
      </TouchableOpacity>
    </View>
  )
}