import { useAuth } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import BookingCard from '../../../components/BookingCard'
import ErrorState from '../../../components/ErrorState'
import LoadingState from '../../../components/LoadingState'
import { bookingService } from '../../../services/bookingService'
import { Booking } from '../../../types/booking'

const TABS = ['Ongoing', 'Completed'] as const

type JobTab = (typeof TABS)[number]

export default function TechnicianJobs() {
  const router = useRouter()
  const { getToken } = useAuth()

  const [activeTab, setActiveTab] =
    useState<JobTab>('Ongoing')

  const [jobs, setJobs] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useFocusEffect(
    useCallback(() => {
      loadJobs()
    }, [])
  )

  const loadJobs = async () => {
    try {
      setError(null)

      const token = await getToken()
      const data = await bookingService.getAll(token)

      setJobs(data)
    } catch (err: any) {
      console.log('Error loading jobs:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)

    await loadJobs()

    setRefreshing(false)
  }

  const onRetry = () => {
    setLoading(true)
    loadJobs()
  }

  const filteredJobs = jobs.filter(
    (job) => job.status === activeTab
  )

  const ongoingCount = jobs.filter(
    (job) => job.status === 'Ongoing'
  ).length

  const completedCount = jobs.filter(
    (job) => job.status === 'Completed'
  ).length

  const getTabCount = (tab: JobTab) => {
    return tab === 'Ongoing'
      ? ongoingCount
      : completedCount
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FFF8E8]">

      {/* HEADER */}
      <View className="px-5 pt-4 pb-2">
        <Text className="text-[28px] font-bold text-gray-900">
          My Jobs
        </Text>

        <Text className="text-sm text-gray-500 mt-1">
          Manage your ongoing and completed work
        </Text>
      </View>

      {/* SUMMARY */}
      {!loading && !error && (
        <View className="flex-row px-5 mt-4">
          {/* ONGOING */}
          <View
            className="flex-1 bg-white rounded-[22px] p-4 border border-[#F5EBD5]"
            style={{
              marginRight: 8,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.04,
              shadowRadius: 6,
              elevation: 1,
            }}
          >
            <View className="w-10 h-10 rounded-xl bg-[#FFF3D2] items-center justify-center">
              <Ionicons
                name="briefcase-outline"
                size={20}
                color="#D99A00"
              />
            </View>

            <Text className="text-2xl font-bold text-gray-900 mt-3">
              {ongoingCount}
            </Text>

            <Text className="text-xs text-gray-500 mt-1">
              Ongoing Jobs
            </Text>
          </View>

          {/* COMPLETED */}
          <View
            className="flex-1 bg-white rounded-[22px] p-4 border border-[#F5EBD5]"
            style={{
              marginLeft: 8,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.04,
              shadowRadius: 6,
              elevation: 1,
            }}
          >
            <View className="w-10 h-10 rounded-xl bg-green-50 items-center justify-center">
              <Ionicons
                name="checkmark-done-outline"
                size={21}
                color="#16A34A"
              />
            </View>

            <Text className="text-2xl font-bold text-gray-900 mt-3">
              {completedCount}
            </Text>

            <Text className="text-xs text-gray-500 mt-1">
              Completed Jobs
            </Text>
          </View>
        </View>
      )}

      {/* TABS */}
      <View className="px-5 mt-5">
        <View className="flex-row bg-[#FFF0C7] rounded-2xl p-1">
          {TABS.map((tab) => {
            const selected = activeTab === tab
            const count = getTabCount(tab)

            return (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.8}
                onPress={() => setActiveTab(tab)}
                className={`flex-1 rounded-xl py-3 items-center justify-center ${
                  selected
                    ? 'bg-white'
                    : 'bg-transparent'
                }`}
                style={
                  selected
                    ? {
                        shadowColor: '#000',
                        shadowOffset: {
                          width: 0,
                          height: 1,
                        },
                        shadowOpacity: 0.06,
                        shadowRadius: 4,
                        elevation: 2,
                      }
                    : undefined
                }
              >
                <View className="flex-row items-center">
                  <Text
                    className={`text-sm font-bold ${
                      selected
                        ? 'text-gray-900'
                        : 'text-[#9A7B36]'
                    }`}
                  >
                    {tab}
                  </Text>

                  {count > 0 && (
                    <View
                      className={`ml-2 min-w-[22px] h-[22px] px-1.5 rounded-full items-center justify-center ${
                        selected
                          ? 'bg-[#FFC342]'
                          : 'bg-white/70'
                      }`}
                    >
                      <Text className="text-[11px] font-bold text-gray-900">
                        {count > 99 ? '99+' : count}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      {/* JOB LIST */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 18,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#D99A00"
          />
        }
      >
        {loading ? (
          <LoadingState message="Loading jobs..." />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={onRetry}
          />
        ) : filteredJobs.length === 0 ? (
          /* EMPTY STATE */
          <View className="bg-white rounded-[28px] px-6 py-12 items-center mt-3">
            <View className="w-20 h-20 rounded-full bg-[#FFF3D2] items-center justify-center">
              <Ionicons
                name={
                  activeTab === 'Ongoing'
                    ? 'briefcase-outline'
                    : 'checkmark-done-outline'
                }
                size={36}
                color="#D99A00"
              />
            </View>

            <Text className="text-lg font-bold text-gray-900 mt-5">
              {activeTab === 'Ongoing'
                ? 'No Ongoing Jobs'
                : 'No Completed Jobs'}
            </Text>

            <Text className="text-sm text-gray-500 text-center mt-2 leading-5">
              {activeTab === 'Ongoing'
                ? 'Accepted service requests will appear here.'
                : 'Jobs you complete will appear here.'}
            </Text>
          </View>
        ) : (
          filteredJobs.map((job) => (
            <View
              key={job.id}
              className="mb-4"
            >
              <BookingCard
                booking={job}
                name={job.customer_name}
                showAddress
                onPress={() =>
                  router.push(
                    `/(technician)/bookings/${job.id}`
                  )
                }
              >
                {job.status === 'Ongoing' && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                      router.push(
                        `/(technician)/bookings/${job.id}`
                      )
                    }
                    className="mt-4 bg-[#FFC342] rounded-2xl py-3.5 items-center justify-center"
                  >
                    <View className="flex-row items-center">
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={19}
                        color="#111827"
                      />

                      <Text className="text-sm font-bold text-gray-900 ml-2">
                        Mark as Completed
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </BookingCard>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}