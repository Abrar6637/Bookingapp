import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const FAQS = [
  {
    q: 'Cancel the Booking?',
    a: 'Go to "My Bookings," tap on the booking you want to cancel, and then press the "Cancel Booking" button.',
  },
  {
    q: 'How to send payment?',
    a: 'Currently, payment is made via the Cash-on-Delivery service. Online payment options (JazzCash/EasyPaisa) will be available soon.',
  },
  {
    q: 'If Technician not coming on time?',
    a: 'You can call or chat with the technician from the booking details screen. For instance, if the issue persists, contact support.',
  },
  {
    q: 'How to refund money?',
    a: 'There are no charges for cancelled bookings. Please contact support for a refund on a completed service.',
  },
]

export default function HelpSupport() {
  const router = useRouter()

  const [openIndex, setOpenIndex] =
    useState<number | null>(null)

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
            Help & Support
          </Text>

          <Text className="text-xs text-gray-500 mt-1">
            How can we help you?
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 30,
        }}
      >
        {/* SUPPORT HERO */}

        <View className="bg-[#FFC342] rounded-[26px] p-5 mt-4">
          <View className="flex-row items-center">
            <View className="w-14 h-14 rounded-full bg-white/80 items-center justify-center">
              <Ionicons
                name="headset"
                size={27}
                color="#111827"
              />
            </View>

            <View className="flex-1 ml-4">
              <Text className="text-lg font-extrabold text-gray-950">
                Need some help?
              </Text>

              <Text className="text-xs text-gray-700 leading-5 mt-1">
                Contact our support team and we'll help
                with your BookingApp questions.
              </Text>
            </View>
          </View>
        </View>

        {/* CONTACT */}

        <Text className="text-lg font-extrabold text-gray-950 mt-7 mb-3">
          Contact Us
        </Text>

        <View
          className="flex-row"
          style={{ gap: 12 }}
        >
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() =>
              Linking.openURL('tel:+923001234567')
            }
            className="flex-1 bg-white rounded-[22px] p-5 items-center"
            style={{
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 6,
            }}
          >
            <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center">
              <Ionicons
                name="call"
                size={21}
                color="#16A34A"
              />
            </View>

            <Text className="text-sm font-extrabold text-gray-900 mt-3">
              Call Us
            </Text>

            <Text className="text-[10px] text-gray-400 mt-1">
              Talk to support
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() =>
              Linking.openURL(
                'mailto:support@bookingapp.com'
              )
            }
            className="flex-1 bg-white rounded-[22px] p-5 items-center"
            style={{
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 6,
            }}
          >
            <View className="w-12 h-12 rounded-full bg-[#FFF3D2] items-center justify-center">
              <Ionicons
                name="mail"
                size={21}
                color="#B77900"
              />
            </View>

            <Text className="text-sm font-extrabold text-gray-900 mt-3">
              Email Us
            </Text>

            <Text className="text-[10px] text-gray-400 mt-1">
              Send us a message
            </Text>
          </TouchableOpacity>
        </View>

        {/* FAQ */}

        <View className="flex-row items-center mt-8 mb-3">
          <View className="w-9 h-9 rounded-full bg-[#FFF3D2] items-center justify-center">
            <Ionicons
              name="help-circle-outline"
              size={19}
              color="#B77900"
            />
          </View>

          <View className="ml-3">
            <Text className="text-lg font-extrabold text-gray-950">
              Frequently Asked Questions
            </Text>

            <Text className="text-[11px] text-gray-400">
              Quick answers to common questions
            </Text>
          </View>
        </View>

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
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index

            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                onPress={() =>
                  setOpenIndex(
                    isOpen ? null : index
                  )
                }
                className={`py-4 ${
                  index !== FAQS.length - 1
                    ? 'border-b border-gray-100'
                    : ''
                }`}
              >
                <View className="flex-row items-center">
                  <View
                    className={`w-9 h-9 rounded-full items-center justify-center ${
                      isOpen
                        ? 'bg-[#FFC342]'
                        : 'bg-[#FFF3D2]'
                    }`}
                  >
                    <Text className="text-xs font-extrabold text-gray-900">
                      {index + 1}
                    </Text>
                  </View>

                  <Text className="flex-1 text-sm font-bold text-gray-900 ml-3 pr-2">
                    {faq.q}
                  </Text>

                  <View className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center">
                    <Ionicons
                      name={
                        isOpen
                          ? 'chevron-up'
                          : 'chevron-down'
                      }
                      size={16}
                      color="#6B7280"
                    />
                  </View>
                </View>

                {isOpen && (
                  <View className="bg-[#FFF8E8] rounded-2xl p-4 mt-3 ml-12">
                    <Text className="text-xs text-gray-600 leading-5">
                      {faq.a}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}