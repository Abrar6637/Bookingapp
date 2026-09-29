import { ActivityIndicator, Text, View } from 'react-native'

type Props = {
  message?: string
}

export default function LoadingState({ message }: Props) {
  return (
    <View className="items-center justify-center py-16">
      <ActivityIndicator size="large" color="#000" />
      {message ? <Text className="text-gray-400 text-sm mt-3">{message}</Text> : null}
    </View>
  )
}