import { Ionicons } from '@expo/vector-icons'
import { Text, TouchableOpacity, View } from 'react-native'
import { Technician } from '../types/technician'

type Props = {
  technician: Technician
  onPress: () => void
}

export default function TechnicianCard({ technician, onPress }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="flex-row bg-white border border-gray-200 rounded-2xl p-4 mb-4"
    >
      <View className="w-16 h-16 rounded-full bg-gray-200 items-center justify-center mr-4">
        <Ionicons name="person" size={28} color="#9ca3af" />
      </View>

      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-bold text-gray-900">{technician.name}</Text>
          <View
            className={`px-2 py-1 rounded-full ${technician.available ? 'bg-green-100' : 'bg-gray-100'}`}
          >
            <Text
              className={`text-xs font-semibold ${
                technician.available ? 'text-green-700' : 'text-gray-500'
              }`}
            >
              {technician.available ? 'Available' : 'Busy'}
            </Text>
          </View>
        </View>

        <Text className="text-sm text-gray-500 mt-1">
          {technician.experience || 'N/A'} experience
        </Text>

        <View className="flex-row items-center mt-2">
          <Ionicons name="star" size={14} color="#facc15" />
          <Text className="text-sm text-gray-700 ml-1 font-medium">{technician.rating}</Text>
          <Text className="text-sm text-gray-400 ml-1">({technician.reviews})</Text>
        </View>

        <Text className="text-base font-bold text-gray-900 mt-2">
          Rs. {technician.price}
          <Text className="text-xs text-gray-400 font-normal"> / visit</Text>
        </Text>
      </View>
    </TouchableOpacity>
  )
}