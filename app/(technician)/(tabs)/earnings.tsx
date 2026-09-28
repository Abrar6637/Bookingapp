import { useAuth } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import ErrorState from '../../../components/ErrorState'
import { technicianService } from '../../../services/technicianService'

export default function TechnicianEarnings() {
  const { getToken } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useFocusEffect(
    useCallback(() => {
      loadEarnings()
    }, [])
  )

  const loadEarnings = async () => {
    try {
      setError(null)
      const token = await getToken()
      const result = await technicianService.getEarnings(token)
      setData(result)
    } catch (err: any) {
      console.log('Error loading earnings:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadEarnings()
    setRefreshing(false)
  }

  const onRetry = () => {
    setLoading(true)
    loadEarnings()
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-400">Loading earnings...</Text>
      </SafeAreaView>
    )
  }

  if (error || !data) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-6 pt-4 pb-2">
          <Text className="text-2xl font-bold text-gray-900">Earnings</Text>
        </View>
        <ErrorState message={error || undefined} onRetry={onRetry} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-2">
          <Text className="text-2xl font-bold text-gray-900">Earnings</Text>
        </View>

        {/* Total Earnings Card */}
        <View className="mx-6 mt-4 bg-black rounded-2xl p-6">
          <Text className="text-gray-400 text-sm">Total Earnings</Text>
          <Text className="text-white text-3xl font-bold mt-1">
            Rs. {data.total_earnings.toLocaleString()}
          </Text>

          <View className="flex-row mt-5">
            <View className="flex-1">
              <Text className="text-gray-400 text-xs">This Month</Text>
              <Text className="text-white text-lg font-bold mt-1">
                Rs. {data.this_month.toLocaleString()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-400 text-xs">Pending Payout</Text>
              <Text className="text-white text-lg font-bold mt-1">
                Rs. {data.pending_payout.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Row */}
        <View className="flex-row mx-6 mt-4">
          <View className="flex-1 items-center bg-gray-50 rounded-xl py-4 mr-2">
            <Text className="text-lg font-bold text-gray-900">{data.completed_jobs}</Text>
            <Text className="text-xs text-gray-500 mt-1">Completed Jobs</Text>
          </View>
          <View className="flex-1 items-center bg-gray-50 rounded-xl py-4 ml-2">
            <Text className="text-lg font-bold text-gray-900">
              Rs.{' '}
              {data.completed_jobs > 0 ? Math.round(data.total_earnings / data.completed_jobs) : 0}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">Avg per Job</Text>
          </View>
        </View>

        {/* Withdraw Button */}
        <View className="px-6 mt-6">
          <TouchableOpacity className="w-full bg-gray-100 rounded-xl p-4 flex-row items-center justify-center">
            <Ionicons name="wallet-outline" size={20} color="black" />
            <Text className="text-black font-bold text-base ml-2">Withdraw Funds</Text>
          </TouchableOpacity>
        </View>

        {/* Transaction History */}
        <View className="px-6 mt-8 mb-8">
          <Text className="text-lg font-bold text-gray-900 mb-4">Transaction History</Text>

          {data.transactions.length === 0 ? (
            <Text className="text-sm text-gray-400 text-center py-8">
              Abhi tak koi completed transaction nahi hai
            </Text>
          ) : (
            data.transactions.map((tx: any) => (
              <View
                key={tx.id}
                className="flex-row items-center justify-between py-3 border-b border-gray-100"
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
                    <Ionicons name="cash-outline" size={18} color="#374151" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-gray-900">{tx.customer_name}</Text>
                    <Text className="text-xs text-gray-500 mt-1">{tx.date}</Text>
                  </View>
                </View>

                <View className="items-end">
                  <Text className="text-sm font-bold text-gray-900">+ Rs. {tx.amount}</Text>
                  <View className="px-2 py-0.5 rounded-full mt-1 bg-green-100">
                    <Text className="text-[10px] font-semibold text-green-700">{tx.status}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}