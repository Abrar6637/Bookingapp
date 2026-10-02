import { useAuth } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Animated,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { bookingService } from '../../../services/bookingService'
import { useLocationStore } from '../../../store/locationStore'

// =====================================================
// TIME SLOTS
// =====================================================

const TIME_SLOTS = [
  '09:00 AM',
  '11:00 AM',
  '01:00 PM',
  '03:00 PM',
  '05:00 PM',
  '07:00 PM',
]

// =====================================================
// DYNAMIC DATES
// =====================================================

const DATES = Array.from({ length: 7 }, (_, index) => {
  const date = new Date()

  date.setDate(date.getDate() + index)

  return {
    label:
      index === 0
        ? 'Today'
        : index === 1
          ? 'Tomorrow'
          : date.toLocaleDateString('en-US', {
              weekday: 'short',
            }),

    date: date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
    }),

    value: `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(2, '0')}`,
  }
})

// =====================================================
// SCREEN
// =====================================================

export default function Booking() {
  const { technicianId, serviceCategoryId } =
    useLocalSearchParams()

  const router = useRouter()

  const { getToken } = useAuth()

  // =====================================================
  // STATES
  // =====================================================

  const [selectedDate, setSelectedDate] =
    useState(DATES[0])

  const [selectedTime, setSelectedTime] =
    useState<string | null>(null)

  const fullAddress = useLocationStore(
    (state) => state.fullAddress
  )

  const [address, setAddress] =
    useState(fullAddress)

  const [description, setDescription] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  // =====================================================
  // DATE SCROLL REF
  // =====================================================

  const dateScrollRef =
    useRef<ScrollView>(null)

  // =====================================================
  // ANIMATIONS
  // =====================================================

  const headerAnim = useRef(
    new Animated.Value(0)
  ).current

  const dateAnim = useRef(
    new Animated.Value(0)
  ).current

  const timeAnim = useRef(
    new Animated.Value(0)
  ).current

  const formAnim = useRef(
    new Animated.Value(0)
  ).current

  useEffect(() => {
    Animated.stagger(100, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),

      Animated.timing(dateAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),

      Animated.timing(timeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),

      Animated.timing(formAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  // =====================================================
  // SLIDE ANIMATION
  // =====================================================

  const slideUp = (
    animation: Animated.Value
  ) => ({
    opacity: animation,

    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  })

  // =====================================================
  // SELECT DATE + AUTO SCROLL
  // =====================================================

  const handleDateSelect = (
    date: typeof DATES[0],
    index: number
  ) => {
    setSelectedDate(date)

    dateScrollRef.current?.scrollTo({
      x: Math.max(0, index * 68 - 24),
      animated: true,
    })
  }

  // =====================================================
  // CONFIRM BOOKING
  // =====================================================

  const onConfirmBooking = async () => {
    if (!selectedTime) {
      Alert.alert(
        'Error',
        'Please select a time slot'
      )

      return
    }

    if (!address.trim()) {
      Alert.alert(
        'Error',
        'Please enter your address'
      )

      return
    }

    setLoading(true)

    try {
      const token = await getToken()

      const booking =
        await bookingService.create(token, {
          technician_profile_id:
            Number(technicianId),

          service_category_id:
            Number(serviceCategoryId) || 1,

          booking_date:
            selectedDate.value,

          booking_time:
            selectedTime,

          address,

          description,
        })

      router.push(
        `/(customer)/booking/confirmation?bookingId=${booking.booking.id}`
      )
    } catch (err: any) {
      console.log(
        'Booking error:',
        err.message
      )

      Alert.alert(
        'Error',
        err.message ||
          'Booking failed, please try again'
      )
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <SafeAreaView
      edges={['top']}
      className="flex-1 bg-[#FFF8E8]"
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <Animated.View
        style={slideUp(headerAnim)}
        className="flex-row items-center px-6 pt-4 pb-3"
      >

        {/* Back Button */}

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className="w-11 h-11 rounded-full bg-white items-center justify-center mr-4"
          style={{
            elevation: 2,
            shadowColor: '#000',
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

        {/* Title */}

        <View className="flex-1">

          <Text className="text-2xl font-extrabold text-gray-950">
            Book Service
          </Text>

          <Text className="text-xs text-gray-500 mt-0.5">
            Choose your preferred date and time
          </Text>

        </View>

        {/* Calendar Icon */}

        <View className="w-11 h-11 rounded-full bg-[#FFC342] items-center justify-center">

          <Ionicons
            name="calendar-outline"
            size={20}
            color="#111827"
          />

        </View>

      </Animated.View>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 30,
        }}
        className="flex-1"
      >

        {/* =================================================
            SELECT DATE
        ================================================= */}

        <Animated.View
          style={slideUp(dateAnim)}
          className="mt-6"
        >

          {/* Date Heading */}

          <View className="px-6 mb-4">

            <View className="flex-row items-center">

              <View className="w-9 h-9 rounded-full bg-[#FFF0C7] items-center justify-center mr-3">

                <Ionicons
                  name="calendar-outline"
                  size={17}
                  color="#B77900"
                />

              </View>

              <View>

                <Text className="text-base font-extrabold text-gray-950">
                  Select Date
                </Text>

                <Text className="text-xs text-gray-400 mt-0.5">
                  When do you need the service?
                </Text>

              </View>

            </View>

          </View>

          {/* Date Horizontal Scroll */}

          <ScrollView
            ref={dateScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 24,
              gap: 8,
            }}
          >

            {DATES.map((d, index) => {
              const isSelected =
                selectedDate.value === d.value

              return (
                <TouchableOpacity
                  key={d.value}
                  activeOpacity={0.75}
                  onPress={() =>
                    handleDateSelect(d, index)
                  }
                  style={{
                    width: 60,
                    height: 72,
                    elevation: isSelected
                      ? 3
                      : 0,
                  }}
                  className={`items-center justify-center rounded-[18px] border ${
                    isSelected
                      ? 'bg-[#FFC342] border-[#FFC342]'
                      : 'bg-white border-gray-100'
                  }`}
                >

                  {/* Today / Tomorrow / Day */}

                  <Text
                    className={`text-[10px] ${
                      isSelected
                        ? 'font-bold text-gray-900'
                        : 'font-medium text-gray-400'
                    }`}
                  >
                    {d.label}
                  </Text>

                  {/* Date */}

                  <Text
                    className={`text-xs font-extrabold mt-1.5 ${
                      isSelected
                        ? 'text-gray-950'
                        : 'text-gray-800'
                    }`}
                  >
                    {d.date}
                  </Text>

                  {/* Selected Dot */}

                  {isSelected && (
                    <View className="w-1.5 h-1.5 rounded-full bg-gray-900 mt-1.5" />
                  )}

                </TouchableOpacity>
              )
            })}

          </ScrollView>

        </Animated.View>

        {/* =================================================
            SELECT TIME
        ================================================= */}

        <Animated.View
          style={slideUp(timeAnim)}
          className="px-6 mt-8"
        >

          {/* Time Heading */}

          <View className="flex-row items-center mb-4">

            <View className="w-9 h-9 rounded-full bg-[#FFF0C7] items-center justify-center mr-3">

              <Ionicons
                name="time-outline"
                size={18}
                color="#B77900"
              />

            </View>

            <View>

              <Text className="text-base font-extrabold text-gray-950">
                Select Time
              </Text>

              <Text className="text-xs text-gray-400 mt-0.5">
                Pick an available time slot
              </Text>

            </View>

          </View>

          {/* Time Slots - 3 PER ROW */}

          <View className="flex-row flex-wrap justify-between">

            {TIME_SLOTS.map((time) => {
              const isSelected =
                selectedTime === time

              return (
                <TouchableOpacity
                  key={time}
                  activeOpacity={0.75}
                  onPress={() =>
                    setSelectedTime(time)
                  }
                  style={{
                    width: '31.5%',
                    marginBottom: 10,
                  }}
                  className={`flex-row items-center justify-center py-3 rounded-[16px] border ${
                    isSelected
                      ? 'bg-[#FFC342] border-[#FFC342]'
                      : 'bg-white border-gray-100'
                  }`}
                >

                  <Ionicons
                    name={
                      isSelected
                        ? 'checkmark-circle'
                        : 'time-outline'
                    }
                    size={14}
                    color={
                      isSelected
                        ? '#111827'
                        : '#9CA3AF'
                    }
                  />

                  <Text
                    className={`text-[11px] ml-1 ${
                      isSelected
                        ? 'font-bold text-gray-950'
                        : 'font-semibold text-gray-600'
                    }`}
                    numberOfLines={1}
                  >
                    {time}
                  </Text>

                </TouchableOpacity>
              )
            })}

          </View>

        </Animated.View>

        {/* =================================================
            SERVICE DETAILS
        ================================================= */}

        <Animated.View
          style={slideUp(formAnim)}
          className="px-6 mt-7"
        >

          <Text className="text-lg font-extrabold text-gray-950 mb-4">
            Service Details
          </Text>

          <View
            className="bg-white rounded-[26px] p-5"
            style={{
              elevation: 3,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.05,
              shadowRadius: 7,
            }}
          >

            {/* =============================================
                ADDRESS
            ============================================= */}

            <View className="flex-row items-center mb-2">

              <View className="w-8 h-8 rounded-full bg-[#FFF3D2] items-center justify-center mr-2">

                <Ionicons
                  name="location-outline"
                  size={16}
                  color="#B77900"
                />

              </View>

              <Text className="text-sm font-bold text-gray-900">
                Service Address
              </Text>

            </View>

            <View className="flex-row items-start bg-[#FFF8E8] border border-[#F8E8BF] rounded-[18px] px-4 py-3">

              <Ionicons
                name="location-outline"
                size={19}
                color="#D99A00"
                style={{
                  marginTop: 3,
                }}
              />

              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="House #, Street, Area..."
                placeholderTextColor="#9CA3AF"
                multiline
                className="flex-1 ml-2 text-sm text-gray-900"
              />

            </View>

            {/* Divider */}

            <View className="h-[1px] bg-gray-100 my-5" />

            {/* =============================================
                DESCRIPTION
            ============================================= */}

            <View className="flex-row items-center mb-2">

              <View className="w-8 h-8 rounded-full bg-[#FFF3D2] items-center justify-center mr-2">

                <Ionicons
                  name="document-text-outline"
                  size={16}
                  color="#B77900"
                />

              </View>

              <Text className="text-sm font-bold text-gray-900">
                Describe the Problem
              </Text>

              <Text className="text-xs text-gray-400 ml-1">
                (optional)
              </Text>

            </View>

            <View className="bg-[#FFF8E8] border border-[#F8E8BF] rounded-[18px]">

              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="e.g. Fan not working in bedroom..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                style={{
                  height: 110,
                  textAlignVertical: 'top',
                }}
                className="px-4 py-4 text-sm text-gray-900"
              />

            </View>

          </View>

        </Animated.View>

        {/* =================================================
            INFORMATION MESSAGE
        ================================================= */}

        <Animated.View
          style={slideUp(formAnim)}
          className="mx-6 mt-4 flex-row items-start bg-[#FFF0C7] rounded-[18px] p-4"
        >

          <View className="w-8 h-8 rounded-full bg-[#FFC342] items-center justify-center mr-3">

            <Ionicons
              name="information-circle-outline"
              size={17}
              color="#111827"
            />

          </View>

          <Text className="flex-1 text-xs text-gray-600 leading-5">
            Your booking request will be sent to the technician for confirmation.
          </Text>

        </Animated.View>

      </ScrollView>

      {/* =================================================
          BOTTOM CONFIRM BUTTON
      ================================================= */}

      <View className="px-6 pt-3 pb-4 bg-[#FFF8E8]">

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onConfirmBooking}
          disabled={loading}
          className={`w-full rounded-full py-4 items-center ${
            loading
              ? 'bg-[#FFE09A]'
              : 'bg-[#FFC342]'
          }`}
          style={{
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 3,
            },
            shadowOpacity: 0.08,
            shadowRadius: 6,
          }}
        >

          <View className="flex-row items-center">

            <Ionicons
              name={
                loading
                  ? 'hourglass-outline'
                  : 'checkmark-circle-outline'
              }
              size={20}
              color="#111827"
            />

            <Text className="text-gray-950 font-extrabold text-base ml-2">
              {loading
                ? 'Confirming...'
                : 'Confirm Booking'}
            </Text>

          </View>

        </TouchableOpacity>

      </View>

    </SafeAreaView>
  )
}