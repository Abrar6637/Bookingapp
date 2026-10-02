import { Ionicons } from '@expo/vector-icons'
import Constants from 'expo-constants'
import { useRouter } from 'expo-router'
import {
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function About() {
  const router = useRouter()

  const version =
    Constants.expoConfig?.version || '1.0.0'

  return (
    <SafeAreaView
      edges={['top']}
      className="flex-1 bg-[#FFF8E8]"
    >
      {/* HEADER */}

      <View className="flex-row items-center px-6 pt-4 pb-3">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className="w-11 h-11 rounded-full bg-white items-center justify-center mr-4"
          style={{
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 5,
          }}
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color="#111827"
          />
        </TouchableOpacity>

        <View>
          <Text className="text-[22px] font-extrabold text-gray-950">
            About BookingApp
          </Text>

          <Text className="text-xs text-gray-500 mt-1">
            Learn more about our platform
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 30,
        }}
      >
        {/* APP HERO */}

        <View
          className="bg-white rounded-[28px] items-center px-6 py-7 mt-4"
          style={{
            elevation: 3,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
          }}
        >
          <View className="w-24 h-24 rounded-[28px] bg-[#FFC342] items-center justify-center">
            <View className="w-16 h-16 rounded-[20px] bg-white/70 items-center justify-center">
              <Ionicons
                name="construct"
                size={34}
                color="#111827"
              />
            </View>
          </View>

          <Text className="text-2xl font-extrabold text-gray-950 mt-5">
            BookingApp
          </Text>

          <View className="bg-[#FFF3D2] rounded-full px-4 py-2 mt-2">
            <Text className="text-xs font-bold text-[#B77900]">
              Version {version}
            </Text>
          </View>

          <Text className="text-sm text-gray-500 text-center leading-6 mt-5">
            BookingApp connects customers with verified
            technicians for various services. Our mission is
            to provide quick and reliable service, helping
            users find the right professional for their needs
            in a timely manner.
          </Text>
        </View>

        {/* MISSION */}

        <Text className="text-lg font-extrabold text-gray-950 mt-7 mb-3">
          Our Mission
        </Text>

        <View className="bg-[#FFF0C7] rounded-[22px] p-5">
          <View className="flex-row items-start">
            <View className="w-11 h-11 rounded-full bg-[#FFC342] items-center justify-center">
              <Ionicons
                name="flash"
                size={20}
                color="#111827"
              />
            </View>

            <View className="flex-1 ml-3">
              <Text className="text-sm font-extrabold text-gray-900">
                Simple. Fast. Reliable.
              </Text>

              <Text className="text-xs text-gray-600 leading-5 mt-1">
                Making it easier for customers to connect
                with service professionals when they need
                help.
              </Text>
            </View>
          </View>
        </View>

        {/* INFORMATION */}

        <Text className="text-lg font-extrabold text-gray-950 mt-7 mb-3">
          Information
        </Text>

        <View
          className="bg-white rounded-[24px] px-4"
          style={{
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.04,
            shadowRadius: 6,
          }}
        >
          {/* EMAIL */}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              Linking.openURL(
                'mailto:support@bookingapp.com'
              )
            }
            className="flex-row items-center py-4 border-b border-gray-100"
          >
            <View className="w-10 h-10 rounded-full bg-[#FFF3D2] items-center justify-center">
              <Ionicons
                name="mail-outline"
                size={18}
                color="#B77900"
              />
            </View>

            <View className="flex-1 ml-3">
              <Text className="text-sm font-bold text-gray-900">
                Contact Support
              </Text>

              <Text className="text-xs text-gray-400 mt-0.5">
                support@bookingapp.com
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color="#D1D5DB"
            />
          </TouchableOpacity>

          {/* TERMS */}

          <TouchableOpacity
            activeOpacity={0.7}
            className="flex-row items-center py-4 border-b border-gray-100"
          >
            <View className="w-10 h-10 rounded-full bg-[#FFF3D2] items-center justify-center">
              <Ionicons
                name="document-text-outline"
                size={18}
                color="#B77900"
              />
            </View>

            <Text className="flex-1 text-sm font-bold text-gray-900 ml-3">
              Terms & Conditions
            </Text>

            <Ionicons
              name="chevron-forward"
              size={18}
              color="#D1D5DB"
            />
          </TouchableOpacity>

          {/* PRIVACY */}

          <TouchableOpacity
            activeOpacity={0.7}
            className="flex-row items-center py-4"
          >
            <View className="w-10 h-10 rounded-full bg-[#FFF3D2] items-center justify-center">
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color="#B77900"
              />
            </View>

            <Text className="flex-1 text-sm font-bold text-gray-900 ml-3">
              Privacy Policy
            </Text>

            <Ionicons
              name="chevron-forward"
              size={18}
              color="#D1D5DB"
            />
          </TouchableOpacity>
        </View>

        <Text className="text-[11px] text-gray-400 text-center mt-8">
          © BookingApp
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}