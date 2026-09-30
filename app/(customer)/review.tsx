import { useState } from 'react'
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAuth } from '@clerk/expo'
import { apiFetch } from '../../services/api'

export default function Review() {
  const { bookingId } = useLocalSearchParams()
  const router = useRouter()
  const { getToken } = useAuth()

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating')
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

      Alert.alert('Thank You!', 'Successfully submitted your review.', [
        { text: 'OK', onPress: () => router.replace('/(customer)/(tabs)/bookings') },
      ])
    } catch (err: any) {
      console.log('Error submitting review:', err.message)
      Alert.alert('Error', err.message || 'Failed to submit review, please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-6 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Leave a Review</Text>
      </View>

      <View className="flex-1 px-6 mt-6">
        {/* Star Rating */}
        <Text className="text-base font-bold text-gray-900 text-center mb-4">
          How was your experience?
        </Text>
        <View className="flex-row justify-center mb-2" style={{ gap: 8 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Ionicons
                name={star <= rating ? 'star' : 'star-outline'}
                size={40}
                color={star <= rating ? '#facc15' : '#d1d5db'}
              />
            </TouchableOpacity>
          ))}
        </View>
        {rating > 0 && (
          <Text className="text-sm text-gray-500 text-center mb-6">
            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
          </Text>
        )}

        {/* Comment */}
        <Text className="text-base font-bold text-gray-900 mb-2 mt-4">
          Write a Review <Text className="text-gray-400 font-normal">(optional)</Text>
        </Text>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="How was the service? What did you like?"
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={5}
          style={{ height: 120, textAlignVertical: 'top' }}
          className="bg-gray-100 rounded-xl px-4 py-3 text-base"
        />
      </View>

      {/* Submit Button */}
      <View className="px-6 py-4 border-t border-gray-100">
        <TouchableOpacity
          onPress={onSubmitReview}
          disabled={loading}
          className="w-full bg-black rounded-xl p-4 items-center"
        >
          <Text className="text-white font-bold text-base">
            {loading ? 'Submitting...' : 'Submit Review'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}