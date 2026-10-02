import { useAuth } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import ErrorState from '../../../components/ErrorState'
import LoadingState from '../../../components/LoadingState'
import { technicianService } from '../../../services/technicianService'

export default function TechnicianEarnings() {
  const { getToken } = useAuth()

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // =====================================================
  // LOAD EARNINGS
  // =====================================================

  useFocusEffect(
    useCallback(() => {
      loadEarnings()
    }, [])
  )

  const loadEarnings = async () => {
    try {
      setError(null)

      const token = await getToken()

      const result =
        await technicianService.getEarnings(token)

      setData(result)
    } catch (err: any) {
      console.log(
        'Error loading earnings:',
        err.message
      )

      setError(
        err.message || 'Failed to load earnings'
      )
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // REFRESH
  // =====================================================

  const onRefresh = async () => {
    setRefreshing(true)

    await loadEarnings()

    setRefreshing(false)
  }

  // =====================================================
  // RETRY
  // =====================================================

  const onRetry = () => {
    setLoading(true)
    loadEarnings()
  }

  // =====================================================
  // NUMBER FORMAT
  // =====================================================

  const formatAmount = (
    amount: number | string | null | undefined
  ) => {
    const value = Number(amount || 0)

    return value.toLocaleString()
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#FFF8E8] items-center justify-center">
        <LoadingState message="Loading earnings..." />
      </SafeAreaView>
    )
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !data) {
    return (
      <SafeAreaView className="flex-1 bg-[#FFF8E8]">

        <View className="px-6 pt-4 pb-2">

          <Text className="text-[26px] font-extrabold text-gray-950">
            Earnings
          </Text>

          <Text className="text-xs text-gray-500 mt-1">
            Track your income and completed jobs
          </Text>

        </View>

        <ErrorState
          message={error || undefined}
          onRetry={onRetry}
        />

      </SafeAreaView>
    )
  }

  // =====================================================
  // VALUES
  // =====================================================

  const totalEarnings =
    Number(data.total_earnings || 0)

  const thisMonth =
    Number(data.this_month || 0)

  const pendingPayout =
    Number(data.pending_payout || 0)

  const completedJobs =
    Number(data.completed_jobs || 0)

  const averagePerJob =
    completedJobs > 0
      ? Math.round(
          totalEarnings / completedJobs
        )
      : 0

  const transactions =
    Array.isArray(data.transactions)
      ? data.transactions
      : []

  // =====================================================
  // UI
  // =====================================================

  return (
    <SafeAreaView
      edges={['top']}
      className="flex-1 bg-[#FFF8E8]"
    >

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#D99A00"
            colors={['#D99A00']}
          />
        }
        contentContainerStyle={{
          paddingBottom: 35,
        }}
      >

        {/* ===============================================
            HEADER
        =============================================== */}

        <View className="px-6 pt-4 pb-2">

          <View className="flex-row items-center justify-between">

            <View>

              <Text className="text-[26px] font-extrabold text-gray-950">
                Earnings
              </Text>

              <Text className="text-xs text-gray-500 mt-1">
                Track your income and payouts
              </Text>

            </View>

            <View className="w-12 h-12 rounded-full bg-[#FFC342] items-center justify-center">

              <Ionicons
                name="wallet-outline"
                size={22}
                color="#111827"
              />

            </View>

          </View>

        </View>

        {/* ===============================================
            TOTAL EARNINGS CARD
        =============================================== */}

        <View
          className="mx-6 mt-5 bg-[#FFC342] rounded-[28px] p-6"
          style={{
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 3,
            },
            shadowOpacity: 0.08,
            shadowRadius: 8,
          }}
        >

          <View className="flex-row items-center justify-between">

            <View>

              <Text className="text-xs font-bold text-[#8A6200]">
                TOTAL EARNINGS
              </Text>

              <Text className="text-[32px] font-extrabold text-gray-950 mt-1">
                Rs. {formatAmount(totalEarnings)}
              </Text>

            </View>

            <View className="w-14 h-14 rounded-[18px] bg-white/70 items-center justify-center">

              <Ionicons
                name="cash-outline"
                size={26}
                color="#111827"
              />

            </View>

          </View>

          {/* DIVIDER */}

          <View className="h-[1px] bg-black/10 my-5" />

          {/* MONTH + PENDING */}

          <View className="flex-row">

            <View className="flex-1">

              <View className="flex-row items-center">

                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color="#8A6200"
                />

                <Text className="text-[10px] font-semibold text-[#8A6200] ml-1.5">
                  THIS MONTH
                </Text>

              </View>

              <Text className="text-lg font-extrabold text-gray-950 mt-2">
                Rs. {formatAmount(thisMonth)}
              </Text>

            </View>

            <View className="w-[1px] bg-black/10 mx-4" />

            <View className="flex-1">

              <View className="flex-row items-center">

                <Ionicons
                  name="time-outline"
                  size={14}
                  color="#8A6200"
                />

                <Text className="text-[10px] font-semibold text-[#8A6200] ml-1.5">
                  PENDING PAYOUT
                </Text>

              </View>

              <Text className="text-lg font-extrabold text-gray-950 mt-2">
                Rs. {formatAmount(pendingPayout)}
              </Text>

            </View>

          </View>

        </View>

        {/* ===============================================
            STATS
        =============================================== */}

        <View
          className="flex-row mx-6 mt-4"
          style={{ gap: 12 }}
        >

          {/* COMPLETED */}

          <View
            className="flex-1 bg-white rounded-[22px] p-4"
            style={{
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.04,
              shadowRadius: 6,
            }}
          >

            <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center">

              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#16A34A"
              />

            </View>

            <Text className="text-xl font-extrabold text-gray-950 mt-3">
              {completedJobs}
            </Text>

            <Text className="text-[11px] text-gray-500 mt-1">
              Completed Jobs
            </Text>

          </View>

          {/* AVERAGE */}

          <View
            className="flex-1 bg-white rounded-[22px] p-4"
            style={{
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.04,
              shadowRadius: 6,
            }}
          >

            <View className="w-10 h-10 rounded-full bg-[#FFF3D2] items-center justify-center">

              <Ionicons
                name="trending-up-outline"
                size={20}
                color="#B77900"
              />

            </View>

            <Text
              className="text-xl font-extrabold text-gray-950 mt-3"
              numberOfLines={1}
            >
              Rs. {formatAmount(averagePerJob)}
            </Text>

            <Text className="text-[11px] text-gray-500 mt-1">
              Avg per Job
            </Text>

          </View>

        </View>

        {/* ===============================================
            WITHDRAW
        =============================================== */}

        <View className="px-6 mt-5">

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              Alert.alert(
                'Coming Soon',
                'Withdraw feature is currently under development. JazzCash and EasyPaisa withdrawals will be available soon.'
              )
            }
            className="bg-white rounded-full py-4 flex-row items-center justify-center"
            style={{
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.04,
              shadowRadius: 6,
            }}
          >

            <View className="w-8 h-8 rounded-full bg-[#FFF3D2] items-center justify-center">

              <Ionicons
                name="wallet-outline"
                size={16}
                color="#B77900"
              />

            </View>

            <Text className="text-sm font-extrabold text-gray-900 ml-2">
              Withdraw Funds
            </Text>

            <View className="bg-[#FFF3D2] rounded-full px-2.5 py-1 ml-2">

              <Text className="text-[9px] font-bold text-[#B77900]">
                SOON
              </Text>

            </View>

          </TouchableOpacity>

        </View>

        {/* ===============================================
            TRANSACTION HEADER
        =============================================== */}

        <View className="px-6 mt-8">

          <View className="flex-row items-center justify-between mb-4">

            <View>

              <Text className="text-lg font-extrabold text-gray-950">
                Transaction History
              </Text>

              <Text className="text-[11px] text-gray-400 mt-1">
                Earnings from completed services
              </Text>

            </View>

            {transactions.length > 0 && (
              <View className="bg-[#FFF3D2] rounded-full px-3 py-1.5">

                <Text className="text-[10px] font-bold text-[#B77900]">
                  {transactions.length}{' '}
                  {transactions.length === 1
                    ? 'Transaction'
                    : 'Transactions'}
                </Text>

              </View>
            )}

          </View>

          {/* =============================================
              EMPTY TRANSACTIONS
          ============================================= */}

          {transactions.length === 0 ? (

            <View
              className="bg-white rounded-[24px] py-12 px-6 items-center"
              style={{
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.04,
                shadowRadius: 6,
              }}
            >

              <View className="w-20 h-20 rounded-full bg-[#FFF3D2] items-center justify-center">

                <Ionicons
                  name="receipt-outline"
                  size={29}
                  color="#B77900"
                />

              </View>

              <Text className="text-base font-extrabold text-gray-900 mt-4">
                No transactions yet
              </Text>

              <Text className="text-xs text-gray-400 text-center leading-5 mt-2">
                Once you complete jobs, your earnings
                will appear here.
              </Text>

            </View>

          ) : (

            /* ===========================================
                TRANSACTIONS
            =========================================== */

            <View
              className="bg-white rounded-[24px] px-4"
              style={{
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.04,
                shadowRadius: 6,
              }}
            >

              {transactions.map(
                (tx: any, index: number) => (

                  <View
                    key={tx.id}
                    className={`flex-row items-center py-4 ${
                      index !== transactions.length - 1
                        ? 'border-b border-gray-100'
                        : ''
                    }`}
                  >

                    {/* ICON */}

                    <View className="w-11 h-11 rounded-full bg-[#FFF3D2] items-center justify-center mr-3">

                      <Ionicons
                        name="cash-outline"
                        size={19}
                        color="#B77900"
                      />

                    </View>

                    {/* INFO */}

                    <View className="flex-1">

                      <Text
                        className="text-sm font-extrabold text-gray-900"
                        numberOfLines={1}
                      >
                        {tx.customer_name}
                      </Text>

                      <View className="flex-row items-center mt-1">

                        <Ionicons
                          name="calendar-outline"
                          size={11}
                          color="#9CA3AF"
                        />

                        <Text className="text-[11px] text-gray-400 ml-1">
                          {tx.date}
                        </Text>

                      </View>

                    </View>

                    {/* AMOUNT */}

                    <View className="items-end ml-3">

                      <Text className="text-sm font-extrabold text-green-600">
                        + Rs. {formatAmount(tx.amount)}
                      </Text>

                      <View className="flex-row items-center bg-green-100 rounded-full px-2.5 py-1 mt-1.5">

                        <View className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />

                        <Text className="text-[9px] font-bold text-green-700">
                          {tx.status}
                        </Text>

                      </View>

                    </View>

                  </View>

                )
              )}

            </View>

          )}

        </View>

      </ScrollView>

    </SafeAreaView>
  )
}