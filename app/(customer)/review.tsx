import { useAuth } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router'
import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { apiFetch } from '../../services/api'

const RATING_LABELS = [
  '',
  'Poor',
  'Fair',
  'Good',
  'Very Good',
  'Excellent',
]

export default function Review() {
  const { bookingId } = useLocalSearchParams()

  const router = useRouter()

  const { getToken } = useAuth()

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert(
        'Error',
        'Please select a rating'
      )

      return
    }

    setLoading(true)

    try {
      const token = await getToken()

      await apiFetch('/reviews', {
        method: 'POST',
        token,
        body: {
          booking_id: Number(bookingId),
          rating,
          comment,
        },
      })

      Alert.alert(
        'Thank You!',
        'Successfully submitted your review.',
        [
          {
            text: 'OK',
            onPress: () =>
              router.replace(
                '/(customer)/(tabs)/bookings'
              ),
          },
        ]
      )
    } catch (err: any) {
      console.log(
        'Error submitting review:',
        err.message
      )

      Alert.alert(
        'Error',
        err.message ||
          'Failed to submit review, please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

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
            Leave a Review
          </Text>

          <Text className="text-xs text-gray-500 mt-1">
            Share your service experience
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 30,
        }}
      >
        {/* RATING CARD */}

        <View
          className="bg-white rounded-[28px] px-5 py-7 items-center"
          style={{
            elevation: 3,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.05,
            shadowRadius: 7,
          }}
        >
          <View className="w-16 h-16 rounded-full bg-[#FFF3D2] items-center justify-center">
            <Ionicons
              name="star"
              size={30}
              color="#D99A00"
            />
          </View>

          <Text className="text-lg font-extrabold text-gray-950 mt-4">
            How was your experience?
          </Text>

          <Text className="text-xs text-gray-400 text-center mt-1">
            Your feedback helps improve the service
          </Text>

          {/* STARS */}

          <View
            className="flex-row justify-center mt-6"
            style={{ gap: 8 }}
          >
            {[1, 2, 3, 4, 5].map(
              (star) => (
                <TouchableOpacity
                  key={star}
                  activeOpacity={0.7}
                  onPress={() =>
                    setRating(star)
                  }
                  className={`w-12 h-12 rounded-full items-center justify-center ${
                    star <= rating
                      ? 'bg-[#FFF3D2]'
                      : 'bg-gray-50'
                  }`}
                >
                  <Ionicons
                    name={
                      star <= rating
                        ? 'star'
                        : 'star-outline'
                    }
                    size={27}
                    color={
                      star <= rating
                        ? '#D99A00'
                        : '#D1D5DB'
                    }
                  />
                </TouchableOpacity>
              )
            )}
          </View>

          {rating > 0 && (
            <View className="bg-[#FFC342] rounded-full px-5 py-2 mt-5">
              <Text className="text-xs font-extrabold text-gray-950">
                {RATING_LABELS[rating]}
              </Text>
            </View>
          )}
        </View>

        {/* COMMENT */}

        <View className="mt-7">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-base font-extrabold text-gray-950">
                Write a Review
              </Text>

              <Text className="text-[11px] text-gray-400 mt-1">
                Tell us more about the service
              </Text>
            </View>

            <View className="bg-white rounded-full px-3 py-1.5">
              <Text className="text-[10px] font-semibold text-gray-400">
                Optional
              </Text>
            </View>
          </View>

          <View
            className="bg-white rounded-[22px] p-4"
            style={{
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 6,
            }}
          >
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="How was the service? What did you like?"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={5}
              maxLength={500}
              style={{
                height: 120,
                textAlignVertical: 'top',
              }}
              className="text-sm text-gray-900"
            />

            <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
              <View className="flex-row items-center">
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={14}
                  color="#B77900"
                />

                <Text className="text-[10px] text-gray-400 ml-1.5">
                  Be honest and helpful
                </Text>
              </View>

              <Text className="text-[10px] text-gray-400">
                {comment.length}/500
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* SUBMIT */}

      <View
        className="bg-white px-6 pt-4 pb-5 border-t border-gray-100"
        style={{
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -3,
          },
          shadowOpacity: 0.05,
          shadowRadius: 6,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onSubmitReview}
          disabled={loading}
          className={`w-full rounded-full py-4 items-center ${
            loading
              ? 'bg-[#FFD978]'
              : 'bg-[#FFC342]'
          }`}
        >
          {loading ? (
            <View className="flex-row items-center">
              <ActivityIndicator
                size="small"
                color="#111827"
              />

              <Text className="text-base font-extrabold text-gray-950 ml-2">
                Submitting...
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center">
              <Text className="text-base font-extrabold text-gray-950">
                Submit Review
              </Text>

              <Ionicons
                name="arrow-forward"
                size={18}
                color="#111827"
                style={{ marginLeft: 8 }}
              />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}