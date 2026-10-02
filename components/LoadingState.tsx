import {
  ActivityIndicator,
  Text,
  View,
} from 'react-native'

type Props = {
  message?: string
}

export default function LoadingState({
  message,
}: Props) {
  return (
    <View className="items-center justify-center py-20 px-6">
      <View
        className="w-16 h-16 rounded-[20px] bg-[#FFF3D2] items-center justify-center"
        style={{
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.04,
          shadowRadius: 5,
          elevation: 1,
        }}
      >
        <ActivityIndicator
          size="large"
          color="#D99A00"
        />
      </View>

      {message ? (
        <Text className="text-gray-500 text-sm font-medium mt-4 text-center">
          {message}
        </Text>
      ) : null}
    </View>
  )
}