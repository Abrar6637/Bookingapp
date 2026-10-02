import { useAuth, useUser } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Animated,
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
    label: 'My Bookings',
    subtitle: 'View and manage your bookings',
    icon: 'calendar-outline',
    route: '/(customer)/(tabs)/bookings',
  },
  {
    id: '2',
    label: 'Saved Addresses',
    subtitle: 'Manage your service locations',
    icon: 'location-outline',
    route: '/(customer)/saved-addresses',
  },
  {
    id: '3',
    label: 'Payment Methods',
    subtitle: 'Manage your payment options',
    icon: 'card-outline',
    route: null,
  },
  {
    id: '4',
    label: 'Notifications',
    subtitle: 'View booking updates',
    icon: 'notifications-outline',
    route: '/(customer)/(tabs)/bookings',
  },
  {
    id: '5',
    label: 'Help & Support',
    subtitle: 'Get help with BookingApp',
    icon: 'help-circle-outline',
    route: '/(customer)/help-support',
  },
  {
    id: '6',
    label: 'About BookingApp',
    subtitle: 'Learn more about our app',
    icon: 'information-circle-outline',
    route: '/(customer)/about',
  },
]

export default function Profile() {
  const { user } = useUser()
  const { signOut, getToken } = useAuth()
  const router = useRouter()
  const [editVisible, setEditVisible] = useState(false)
  const [editFirstName, setEditFirstName] = useState('')
  const [editLastName, setEditLastName] = useState('')
  const [updatingProfile, setUpdatingProfile] = useState(false)

  const [stats, setStats] = useState({
    total_bookings: 0,
    avg_rating_given: 0,
  })

  // =====================================================
  // ANIMATIONS
  // =====================================================

  const headerAnim = useRef(new Animated.Value(0)).current
  const profileAnim = useRef(new Animated.Value(0)).current
  const statsAnim = useRef(new Animated.Value(0)).current
  const menuAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    loadStats()

    Animated.stagger(100, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),

      Animated.timing(profileAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),

      Animated.timing(statsAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),

      Animated.timing(menuAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const slideUp = (animation: Animated.Value) => ({
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
  // LOAD STATS
  // =====================================================

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
    setEditFirstName(user?.firstName || '')
    setEditLastName(user?.lastName || '')
    setEditVisible(true)
  }

  const updateProfile = async () => {
    if (!user) return

    if (!editFirstName.trim()) {
      Alert.alert('Error', 'Please enter your first name')
      return
    }

    try {
      setUpdatingProfile(true)

      await user.update({
        firstName: editFirstName.trim(),
        lastName: editLastName.trim() || undefined,
      })

      setEditVisible(false)

      Alert.alert(
        'Success',
        'Profile updated successfully.'
      )
    } catch (err: any) {
      console.log('Profile update error:', err)

      Alert.alert(
        'Error',
        err.errors?.[0]?.message ||
        err.message ||
        'Unable to update profile'
      )
    } finally {
      setUpdatingProfile(false)
    }
  }

  // =====================================================
  // SIGN OUT
  // =====================================================

  const onSignOutPress = () => {
    Alert.alert(
      'Sign Out',
      'You want to signout?',
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

              router.replace('/(auth)/sign-in')
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

  // =====================================================
  // USER INFORMATION
  // =====================================================

  const firstName = user?.firstName || 'User'
  const lastName = user?.lastName || ''

  const userName = `${firstName} ${lastName}`.trim()

  const userContact =
    user?.emailAddresses[0]?.emailAddress ||
    user?.phoneNumbers[0]?.phoneNumber ||
    ''

  const userInitial =
    user?.firstName?.[0]?.toUpperCase() || 'U'





    

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
        contentContainerStyle={{
          paddingBottom: 35,
        }}
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <Animated.View
          style={slideUp(headerAnim)}
          className="px-6 pt-5"
        >
          <View className="flex-row items-center justify-between">

            <View>
              <Text className="text-3xl font-extrabold text-gray-950">
                Profile
              </Text>

              <Text className="text-sm text-gray-500 mt-1">
                Manage your account
              </Text>
            </View>

            {/* Profile Icon */}
            <View
              className="w-12 h-12 rounded-full bg-[#FFC342] items-center justify-center"
              style={{
                elevation: 3,
                shadowColor: '#000',
                shadowOpacity: 0.08,
                shadowRadius: 5,
              }}
            >
              <Ionicons
                name="person-outline"
                size={23}
                color="#111827"
              />
            </View>

          </View>
        </Animated.View>

        {/* =================================================
            USER PROFILE CARD
        ================================================= */}

        <Animated.View
          style={slideUp(profileAnim)}
          className="mx-6 mt-7"
        >
          <View
            className="bg-white rounded-[28px] p-5"
            style={{
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 3,
              },
              shadowOpacity: 0.07,
              shadowRadius: 8,
            }}
          >

            <View className="flex-row items-center">

              {/* Avatar */}
              <View className="relative">

                <View className="w-[72px] h-[72px] rounded-full bg-[#FFF3D2] items-center justify-center">

                  <View className="w-[58px] h-[58px] rounded-full bg-[#FFC342] items-center justify-center">

                    <Text className="text-2xl font-extrabold text-gray-950">
                      {userInitial}
                    </Text>

                  </View>

                </View>

                {/* Small Active Indicator */}
                <View className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 border-[3px] border-white" />

              </View>

              {/* User Info */}
              <View className="flex-1 ml-4">

                <Text
                  className="text-lg font-extrabold text-gray-950"
                  numberOfLines={1}
                >
                  {userName}
                </Text>

                <View className="flex-row items-center mt-1.5">

                  <Ionicons
                    name={
                      user?.emailAddresses[0]
                        ? 'mail-outline'
                        : 'call-outline'
                    }
                    size={14}
                    color="#9CA3AF"
                  />

                  <Text
                    className="text-sm text-gray-500 ml-1.5 flex-1"
                    numberOfLines={1}
                  >
                    {userContact}
                  </Text>

                </View>

              </View>

              {/* Edit Button */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={openEditProfile}
                className="w-10 h-10 rounded-full bg-[#FFF3D2] items-center justify-center"
              >
                <Ionicons
                  name="pencil-outline"
                  size={17}
                  color="#B77900"
                />
              </TouchableOpacity>

            </View>

          </View>
        </Animated.View>

        {/* =================================================
            STATS
        ================================================= */}

        <Animated.View
          style={slideUp(statsAnim)}
          className="flex-row mx-6 mt-4"
        >

          {/* Total Bookings */}
          <View
            className="flex-1 bg-white rounded-[22px] p-4 mr-2"
            style={{
              elevation: 2,
              shadowColor: '#000',
              shadowOpacity: 0.05,
              shadowRadius: 5,
            }}
          >
            <View className="flex-row items-center">

              <View className="w-10 h-10 rounded-full bg-[#FFF3D2] items-center justify-center">

                <Ionicons
                  name="calendar-outline"
                  size={19}
                  color="#D99A00"
                />

              </View>

              <View className="ml-3">

                <Text className="text-xl font-extrabold text-gray-950">
                  {stats.total_bookings}
                </Text>

                <Text className="text-[11px] text-gray-400 mt-0.5">
                  Total Bookings
                </Text>

              </View>

            </View>
          </View>

          {/* Average Rating */}
          <View
            className="flex-1 bg-white rounded-[22px] p-4 ml-2"
            style={{
              elevation: 2,
              shadowColor: '#000',
              shadowOpacity: 0.05,
              shadowRadius: 5,
            }}
          >
            <View className="flex-row items-center">

              <View className="w-10 h-10 rounded-full bg-[#FFF3D2] items-center justify-center">

                <Ionicons
                  name="star"
                  size={19}
                  color="#D99A00"
                />

              </View>

              <View className="ml-3">

                <Text className="text-xl font-extrabold text-gray-950">
                  {stats.avg_rating_given || 'N/A'}
                </Text>

                <Text className="text-[11px] text-gray-400 mt-0.5">
                  Avg Rating
                </Text>

              </View>

            </View>
          </View>

        </Animated.View>

        {/* =================================================
            ACCOUNT HEADING
        ================================================= */}

        <Animated.View
          style={slideUp(menuAnim)}
          className="px-6 mt-8 mb-3"
        >
          <Text className="text-lg font-extrabold text-gray-950">
            Account
          </Text>

          <Text className="text-xs text-gray-400 mt-1">
            Manage your BookingApp preferences
          </Text>
        </Animated.View>

        {/* =================================================
            MENU
        ================================================= */}

        <Animated.View
          style={slideUp(menuAnim)}
          className="mx-6"
        >
          <View
            className="bg-white rounded-[26px] px-4"
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

            {MENU_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                onPress={() =>
                  item.route
                    ? router.push(item.route as any)
                    : Alert.alert(
                      'Coming Soon',
                      'This feature will be coming soon.'
                    )
                }
                className={`flex-row items-center py-4 ${index !== MENU_ITEMS.length - 1
                    ? 'border-b border-gray-100'
                    : ''
                  }`}
              >

                {/* Icon */}
                <View className="w-11 h-11 rounded-full bg-[#FFF3D2] items-center justify-center mr-3">

                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color="#B77900"
                  />

                </View>

                {/* Text */}
                <View className="flex-1">

                  <Text className="text-[15px] font-bold text-gray-900">
                    {item.label}
                  </Text>

                  <Text className="text-[11px] text-gray-400 mt-0.5">
                    {item.subtitle}
                  </Text>

                </View>

                {/* Arrow */}
                <View className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center">

                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="#9CA3AF"
                  />

                </View>

              </TouchableOpacity>
            ))}

          </View>
        </Animated.View>

        {/* =================================================
            SIGN OUT
        ================================================= */}

        <Animated.View
          style={slideUp(menuAnim)}
          className="px-6 mt-6"
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onSignOutPress}
            className="w-full bg-red-50 border border-red-100 rounded-[20px] py-4 items-center justify-center"
          >
            <View className="flex-row items-center">

              <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center">

                <Ionicons
                  name="log-out-outline"
                  size={18}
                  color="#DC2626"
                />

              </View>

              <Text className="text-red-600 font-extrabold text-base ml-2">
                Sign Out
              </Text>

            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* App Version */}
        <Animated.View
          style={slideUp(menuAnim)}
          className="items-center mt-5"
        >
          <Text className="text-[11px] text-gray-400">
            BookingApp
          </Text>

          <Text className="text-[10px] text-gray-300 mt-1">
            Version 1.0.0
          </Text>
        </Animated.View>

      </ScrollView>

      {/* =================================================
    EDIT PROFILE MODAL
================================================= */}

<Modal
  visible={editVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setEditVisible(false)}
>
  <View className="flex-1 bg-black/40 justify-end">

    <View className="bg-[#FFF8E8] rounded-t-[32px] px-6 pt-5 pb-10">

      {/* Handle */}
      <View className="items-center mb-5">
        <View className="w-12 h-1.5 rounded-full bg-gray-300" />
      </View>

      {/* Header */}
      <View className="flex-row items-center justify-between mb-7">

        <View>
          <Text className="text-2xl font-extrabold text-gray-950">
            Edit Profile
          </Text>

          <Text className="text-sm text-gray-500 mt-1">
            Update your personal information
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setEditVisible(false)}
          disabled={updatingProfile}
          className="w-10 h-10 rounded-full bg-white items-center justify-center"
        >
          <Ionicons
            name="close"
            size={21}
            color="#111827"
          />
        </TouchableOpacity>

      </View>

      {/* White Form Card */}
      <View
        className="bg-white rounded-[26px] p-5"
        style={{
          elevation: 3,
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 7,
        }}
      >

        {/* Avatar */}
        <View className="items-center mb-6">

          <View className="w-20 h-20 rounded-full bg-[#FFF3D2] items-center justify-center">

            <View className="w-16 h-16 rounded-full bg-[#FFC342] items-center justify-center">

              <Text className="text-2xl font-extrabold text-gray-950">
                {editFirstName?.[0]?.toUpperCase() || 'U'}
              </Text>

            </View>

          </View>

        </View>

        {/* First Name */}
        <Text className="text-sm font-bold text-gray-900 mb-2">
          First Name
        </Text>

        <View className="flex-row items-center border border-gray-200 rounded-full px-4 mb-5">

          <Ionicons
            name="person-outline"
            size={18}
            color="#9CA3AF"
          />

          <TextInput
            value={editFirstName}
            onChangeText={setEditFirstName}
            placeholder="Enter first name"
            placeholderTextColor="#9CA3AF"
            className="flex-1 py-4 ml-2 text-gray-900"
          />

        </View>

        {/* Last Name */}
        <Text className="text-sm font-bold text-gray-900 mb-2">
          Last Name
        </Text>

        <View className="flex-row items-center border border-gray-200 rounded-full px-4 mb-6">

          <Ionicons
            name="person-outline"
            size={18}
            color="#9CA3AF"
          />

          <TextInput
            value={editLastName}
            onChangeText={setEditLastName}
            placeholder="Enter last name"
            placeholderTextColor="#9CA3AF"
            className="flex-1 py-4 ml-2 text-gray-900"
          />

        </View>

        {/* Save Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={updateProfile}
          disabled={updatingProfile}
          className={`rounded-full py-4 items-center ${
            updatingProfile
              ? 'bg-[#FFE09A]'
              : 'bg-[#FFC342]'
          }`}
        >
          <View className="flex-row items-center">

            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color="#111827"
            />

            <Text className="text-gray-950 font-extrabold text-base ml-2">
              {updatingProfile
                ? 'Saving...'
                : 'Save Changes'}
            </Text>

          </View>
        </TouchableOpacity>

      </View>

    </View>

  </View>
</Modal>
    </SafeAreaView>
  )
}