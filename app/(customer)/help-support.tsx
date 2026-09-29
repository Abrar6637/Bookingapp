import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native'
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
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-6 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Help & Support</Text>
      </View>

      <ScrollView className="flex-1 px-6 mt-4" showsVerticalScrollIndicator={false}>
        {/* Contact Options */}
        <View className="flex-row mb-6" style={{ gap: 12 }}>
          <TouchableOpacity
            onPress={() => Linking.openURL('tel:+923001234567')}
            className="flex-1 bg-gray-50 rounded-2xl p-4 items-center"
          >
            <Ionicons name="call" size={22} color="#22c55e" />
            <Text className="text-sm font-semibold text-gray-900 mt-2">Call Us</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Linking.openURL('mailto:support@bookingapp.com')}
            className="flex-1 bg-gray-50 rounded-2xl p-4 items-center"
          >
            <Ionicons name="mail" size={22} color="#3b82f6" />
            <Text className="text-sm font-semibold text-gray-900 mt-2">Email Us</Text>
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <Text className="text-lg font-bold text-gray-900 mb-3">Frequently Asked Questions</Text>
        {FAQS.map((faq, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.7}
            onPress={() => setOpenIndex(openIndex === index ? null : index)}
            className="border-b border-gray-100 py-4"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold text-gray-900 flex-1 pr-3">{faq.q}</Text>
              <Ionicons
                name={openIndex === index ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#9ca3af"
              />
            </View>
            {openIndex === index && (
              <Text className="text-sm text-gray-500 mt-2 leading-5">{faq.a}</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}