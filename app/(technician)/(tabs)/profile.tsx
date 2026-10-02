import { useAuth, useUser } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { authService } from '../../../services/authService'

const MENU_ITEMS = [
  {
    id: '1',
    label: 'Edit Services & Pricing',
    subtitle: 'Update services, price and profile',
    icon: 'construct-outline',
    route: '/(technician)/setup',
  },
  {
    id: '2',
    label: 'My Jobs',
    subtitle: 'Manage ongoing and completed jobs',
    icon: 'briefcase-outline',
    route: '/(technician)/(tabs)/jobs',
  },
  {
    id: '3',
    label: 'Earnings',
    subtitle: 'View earnings and transactions',
    icon: 'wallet-outline',
    route: '/(technician)/(tabs)/earnings',
  },
  {
    id: '4',
    label: 'Notifications',
    subtitle: 'Manage your notifications',
    icon: 'notifications-outline',
    route: null,
  },
  {
    id: '5',
    label: 'Help & Support',
    subtitle: 'Get help with BookingApp',
    icon: 'help-circle-outline',
    route: null,
  },
  {
    id: '6',
    label: 'About BookingApp',
    subtitle: 'App information and details',
    icon: 'information-circle-outline',
    route: null,
  },
]

export default function TechnicianProfile() {
  const { user } = useUser()
  const { signOut, getToken } = useAuth()
  const router = useRouter()

  const [stats, setStats] = useState({
    total_bookings: 0,
    completed_jobs: 0,
    rating: 0,
    total_earned: 0,
  })

  const [editModalVisible, setEditModalVisible] =
    useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const token = await getToken()
      const data = await authService.getStats(token)

      setStats(data)
    } catch (err: any) {
      console.log(
        'Error loading stats:',
        err.message
      )
    }
  }

  const openEditProfile = () => {
    setFirstName(user?.firstName || '')
    setLastName(user?.lastName || '')
    setEditModalVisible(true)
  }

  const saveProfile = async () => {
    if (!firstName.trim()) {
      Alert.alert(
        'Name Required',
        'Please enter your first name.'
      )
      return
    }

    try {
      setSaving(true)

      await user?.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      })

      await user?.reload()

      setEditModalVisible(false)

      Alert.alert(
        'Updated',
        'Your profile has been updated successfully.'
      )
    } catch (err: any) {
      console.log(
        'Profile update error:',
        err.message
      )

      Alert.alert(
        'Error',
        err.message || 'Profile could not be updated.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleMenuPress = (
    item: (typeof MENU_ITEMS)[number]
  ) => {
    if (item.route) {
      router.push(item.route as any)
      return
    }

    Alert.alert(
      item.label,
      'This feature is coming soon.'
    )
  }

  const onSignOutPress = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut()

              router.replace(
                '/(auth)/sign-in'
              )
            } catch (err: any) {
              Alert.alert(
                'Error',
                'Sign out failed'
              )
            }
          },
        },
      ]
    )
  }

  const email =
    user?.emailAddresses?.[0]?.emailAddress

  const phone =
    user?.phoneNumbers?.[0]?.phoneNumber

  const displayName =
    `${user?.firstName || 'Technician'} ${
      user?.lastName || ''
    }`.trim()

  const initial =
    user?.firstName?.[0]?.toUpperCase() || 'T'

  return (
    <SafeAreaView className="flex-1 bg-[#FFF8E8]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        {/* HEADER */}
        <View className="px-5 pt-4 pb-4">
          <Text className="text-[28px] font-bold text-gray-900">
            Profile
          </Text>

          <Text className="text-sm text-gray-500 mt-1">
            Manage your technician account
          </Text>
        </View>

        {/* PROFILE CARD */}
        <View
          className="mx-5 bg-white rounded-[28px] p-5 border border-[#F5EBD5]"
          style={{
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 3,
            },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View className="flex-row items-center">
            {/* AVATAR */}
            <View className="w-[70px] h-[70px] rounded-[22px] bg-[#FFC342] items-center justify-center mr-4">
              <Text className="text-[28px] font-bold text-gray-900">
                {initial}
              </Text>
            </View>

            {/* USER INFO */}
            <View className="flex-1">
              <Text
                className="text-lg font-bold text-gray-900"
                numberOfLines={1}
              >
                {displayName}
              </Text>

              <Text
                className="text-sm text-gray-500 mt-1"
                numberOfLines={1}
              >
                {email || phone || 'Technician account'}
              </Text>

              <View className="flex-row items-center mt-2">
                <View className="bg-green-50 border border-green-100 px-2.5 py-1 rounded-full flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />

                  <Text className="text-[11px] text-green-700 font-bold">
                    Verified Technician
                  </Text>
                </View>
              </View>
            </View>

            {/* EDIT */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={openEditProfile}
              className="w-11 h-11 rounded-2xl bg-[#FFF3D2] items-center justify-center ml-2"
            >
              <Ionicons
                name="pencil-outline"
                size={19}
                color="#D99A00"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* STATS */}
        <View className="px-5 mt-5">
          <Text className="text-base font-bold text-gray-900 mb-3">
            Performance
          </Text>

          <View
            className="flex-row"
            style={{ gap: 10 }}
          >
            {/* RATING */}
            <View className="flex-1 bg-white rounded-[20px] py-4 px-2 items-center border border-[#F5EBD5]">
              <View className="w-9 h-9 rounded-xl bg-[#FFF3D2] items-center justify-center">
                <Ionicons
                  name="star"
                  size={18}
                  color="#D99A00"
                />
              </View>

              <Text className="text-lg font-bold text-gray-900 mt-2">
                {stats.rating || 0}
              </Text>

              <Text className="text-[11px] text-gray-500 mt-0.5">
                Rating
              </Text>
            </View>

            {/* JOBS */}
            <View className="flex-1 bg-white rounded-[20px] py-4 px-2 items-center border border-[#F5EBD5]">
              <View className="w-9 h-9 rounded-xl bg-[#FFF3D2] items-center justify-center">
                <Ionicons
                  name="checkmark-done-outline"
                  size={19}
                  color="#D99A00"
                />
              </View>

              <Text className="text-lg font-bold text-gray-900 mt-2">
                {stats.completed_jobs || 0}
              </Text>

              <Text className="text-[11px] text-gray-500 mt-0.5">
                Jobs Done
              </Text>
            </View>

            {/* EARNINGS */}
            <View className="flex-1 bg-white rounded-[20px] py-4 px-2 items-center border border-[#F5EBD5]">
              <View className="w-9 h-9 rounded-xl bg-[#FFF3D2] items-center justify-center">
                <Ionicons
                  name="wallet-outline"
                  size={18}
                  color="#D99A00"
                />
              </View>

              <Text
                className="text-sm font-bold text-gray-900 mt-2"
                numberOfLines={1}
              >
                Rs.{' '}
                {Number(
                  stats.total_earned || 0
                ).toLocaleString()}
              </Text>

              <Text className="text-[11px] text-gray-500 mt-0.5">
                Total Earned
              </Text>
            </View>
          </View>
        </View>

        {/* ACCOUNT MENU */}
        <View className="px-5 mt-7">
          <Text className="text-base font-bold text-gray-900 mb-3">
            Account
          </Text>

          <View className="bg-white rounded-[24px] px-4 border border-[#F5EBD5]">
            {MENU_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                onPress={() =>
                  handleMenuPress(item)
                }
                className={`flex-row items-center py-4 ${
                  index !==
                  MENU_ITEMS.length - 1
                    ? 'border-b border-[#F3EEE4]'
                    : ''
                }`}
              >
                <View className="w-11 h-11 rounded-2xl bg-[#FFF8E8] items-center justify-center mr-3">
                  <Ionicons
                    name={item.icon as any}
                    size={21}
                    color="#D99A00"
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-sm font-bold text-gray-900">
                    {item.label}
                  </Text>

                  <Text
                    className="text-xs text-gray-400 mt-1"
                    numberOfLines={1}
                  >
                    {item.subtitle}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color="#C4BBAA"
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* SIGN OUT */}
        <View className="px-5 mt-6">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onSignOutPress}
            className="w-full bg-red-50 border border-red-100 rounded-2xl py-4 items-center justify-center flex-row"
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color="#DC2626"
            />

            <Text className="text-red-600 font-bold text-sm ml-2">
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-center text-xs text-gray-400 mt-5">
          BookingApp Technician
        </Text>
      </ScrollView>

      {/* EDIT PROFILE MODAL */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setEditModalVisible(false)
        }
      >
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-[#FFF8E8] rounded-t-[32px] px-5 pt-5 pb-8">

            {/* MODAL HEADER */}
            <View className="flex-row items-center justify-between mb-5">
              <View>
                <Text className="text-xl font-bold text-gray-900">
                  Edit Profile
                </Text>

                <Text className="text-xs text-gray-500 mt-1">
                  Update your personal information
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  setEditModalVisible(false)
                }
                className="w-10 h-10 bg-white rounded-full items-center justify-center"
              >
                <Ionicons
                  name="close"
                  size={21}
                  color="#111827"
                />
              </TouchableOpacity>
            </View>

            {/* FIRST NAME */}
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              First Name
            </Text>

            <View className="bg-white border border-[#EFE5D2] rounded-2xl px-4 flex-row items-center">
              <Ionicons
                name="person-outline"
                size={19}
                color="#D99A00"
              />

              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First name"
                placeholderTextColor="#9CA3AF"
                className="flex-1 py-4 ml-3 text-gray-900"
              />
            </View>

            {/* LAST NAME */}
            <Text className="text-sm font-semibold text-gray-700 mb-2 mt-4">
              Last Name
            </Text>

            <View className="bg-white border border-[#EFE5D2] rounded-2xl px-4 flex-row items-center">
              <Ionicons
                name="person-outline"
                size={19}
                color="#D99A00"
              />

              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last name"
                placeholderTextColor="#9CA3AF"
                className="flex-1 py-4 ml-3 text-gray-900"
              />
            </View>

            {/* SAVE */}
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={saving}
              onPress={saveProfile}
              className={`rounded-2xl py-4 items-center justify-center mt-6 ${
                saving
                  ? 'bg-[#E5C77A]'
                  : 'bg-[#FFC342]'
              }`}
            >
              <Text className="text-gray-900 font-bold">
                {saving
                  ? 'Saving...'
                  : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}