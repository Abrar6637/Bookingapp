import { Ionicons } from '@expo/vector-icons'
import {
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

type Props = {
  message?: string
  onRetry: () => void
}

export default function ErrorState({
  message,
  onRetry,
}: Props) {
  return (
    <View className="items-center justify-center py-16 px-5">
      <View
        className="w-full bg-white rounded-[28px] px-6 py-10 items-center border border-[#F5EBD5]"
        style={{
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 3,
          },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        {/* ICON */}
        <View className="w-20 h-20 rounded-full bg-[#FFF3D2] items-center justify-center">
          <Ionicons
            name="cloud-offline-outline"
            size={36}
            color="#D99A00"
          />
        </View>

        {/* TITLE */}
        <Text className="text-gray-900 font-bold text-lg mt-5">
          Something went wrong
        </Text>

        {/* MESSAGE */}
        <Text className="text-gray-500 text-sm mt-2 text-center leading-5">
          {message ||
            'Data could not be loaded. Check your internet connection and try again.'}
        </Text>

        {/* RETRY */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onRetry}
          className="mt-6 bg-[#FFC342] rounded-2xl px-8 py-3.5"
        >
          <View className="flex-row items-center">
            <Ionicons
              name="refresh-outline"
              size={18}
              color="#111827"
            />

            <Text className="text-gray-900 font-bold ml-2">
              Try Again
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )
}