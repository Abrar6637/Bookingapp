import { Ionicons } from '@expo/vector-icons'
import { Pressable, Text, View } from 'react-native'

type ButtonProps = {
  title: string
  onPress: () => void
}

export default function Button({
  title,
  onPress,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: pressed
          ? '#E8AC2F'
          : '#FFC342',
        paddingHorizontal: 24,
        paddingVertical: 15,
        borderRadius: 16,
        marginTop: 16,
        opacity: pressed ? 0.9 : 1,

        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 5,
        elevation: 2,
      })}
    >
      <View className="flex-row items-center justify-center">
        <Text className="text-gray-900 font-bold text-base text-center">
          {title}
        </Text>

        <Ionicons
          name="arrow-forward"
          size={18}
          color="#111827"
          style={{ marginLeft: 8 }}
        />
      </View>
    </Pressable>
  )
}