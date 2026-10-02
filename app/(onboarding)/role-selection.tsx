import { useUser } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function RoleSelection() {
  const router = useRouter()
  const { user } = useUser()

  const [selectedRole, setSelectedRole] =
    useState<'customer' | 'technician' | null>(null)

  const [loading, setLoading] = useState(false)

  // =====================================================
  // CONTINUE
  // =====================================================

  const onContinue = async () => {
    if (!selectedRole || !user) return

    setLoading(true)

    try {
      console.log('Saving role:', selectedRole)

      // Save role in Clerk metadata
      await user.updateMetadata({
        unsafeMetadata: {
          role: selectedRole,
        },
      })

      // Reload user so metadata is updated locally
      await user.reload()

      console.log(
        'Role after save:',
        user.unsafeMetadata?.role
      )

      // Navigate according to selected role
      if (selectedRole === 'customer') {
        router.replace('/(customer)/(tabs)')
      } else {
        router.replace('/(technician)/setup')
      }
    } catch (err) {
      console.log(
        'Error saving role:',
        err
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
      <View className="flex-1 px-6">

        {/* ===============================================
            TOP BRAND
        =============================================== */}

        <View className="items-center pt-8">

          <View
            className="w-20 h-20 rounded-[26px] bg-[#FFC342] items-center justify-center"
            style={{
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 3,
              },
              shadowOpacity: 0.08,
              shadowRadius: 7,
            }}
          >
            <View className="w-14 h-14 rounded-[20px] bg-white/70 items-center justify-center">

              <Ionicons
                name="construct"
                size={28}
                color="#111827"
              />

            </View>
          </View>

          <Text className="text-[26px] font-extrabold text-gray-950 mt-5">
            Welcome to BookingApp
          </Text>

          <Text className="text-sm text-gray-500 text-center mt-2 px-5 leading-5">
            Choose how you want to use BookingApp
          </Text>

        </View>

        {/* ===============================================
            ROLE HEADING
        =============================================== */}

        <View className="flex-row items-center mt-9 mb-4">

          <View className="w-9 h-9 rounded-full bg-[#FFF3D2] items-center justify-center">

            <Ionicons
              name="people-outline"
              size={18}
              color="#B77900"
            />

          </View>

          <View className="ml-3">

            <Text className="text-base font-extrabold text-gray-950">
              Select your role
            </Text>

            <Text className="text-[11px] text-gray-400 mt-0.5">
              Choose the option that describes you
            </Text>

          </View>

        </View>

        {/* ===============================================
            CUSTOMER
        =============================================== */}

        <TouchableOpacity
          activeOpacity={0.75}
          disabled={loading}
          onPress={() =>
            setSelectedRole('customer')
          }
          className={`rounded-[26px] p-5 border-2 ${
            selectedRole === 'customer'
              ? 'bg-white border-[#FFC342]'
              : 'bg-white border-white'
          }`}
          style={{
            elevation:
              selectedRole === 'customer'
                ? 4
                : 2,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 3,
            },
            shadowOpacity:
              selectedRole === 'customer'
                ? 0.08
                : 0.04,
            shadowRadius: 7,
          }}
        >

          <View className="flex-row items-center">

            {/* ICON */}

            <View
              className={`w-16 h-16 rounded-[20px] items-center justify-center ${
                selectedRole === 'customer'
                  ? 'bg-[#FFC342]'
                  : 'bg-[#FFF3D2]'
              }`}
            >
              <Ionicons
                name="person"
                size={27}
                color="#111827"
              />
            </View>

            {/* TEXT */}

            <View className="flex-1 ml-4">

              <View className="flex-row items-center">

                <Text className="text-lg font-extrabold text-gray-950">
                  I'm a Customer
                </Text>

                {selectedRole ===
                  'customer' && (
                  <View className="bg-[#FFF3D2] rounded-full px-2.5 py-1 ml-2">

                    <Text className="text-[9px] font-extrabold text-[#B77900]">
                      SELECTED
                    </Text>

                  </View>
                )}

              </View>

              <Text className="text-xs text-gray-500 leading-5 mt-1">
                Find trusted professionals and book
                services near you.
              </Text>

            </View>

            {/* CHECK */}

            <View
              className={`w-8 h-8 rounded-full items-center justify-center ml-2 ${
                selectedRole === 'customer'
                  ? 'bg-[#FFC342]'
                  : 'bg-gray-100'
              }`}
            >
              {selectedRole ===
              'customer' ? (
                <Ionicons
                  name="checkmark"
                  size={18}
                  color="#111827"
                />
              ) : (
                <View className="w-3 h-3 rounded-full border-2 border-gray-300" />
              )}
            </View>

          </View>

          {/* CUSTOMER FEATURES */}

          {selectedRole === 'customer' && (
            <View className="flex-row items-center mt-4 pt-4 border-t border-gray-100">

              <View className="flex-row items-center flex-1">

                <Ionicons
                  name="search-outline"
                  size={14}
                  color="#B77900"
                />

                <Text className="text-[10px] text-gray-500 ml-1.5">
                  Find Experts
                </Text>

              </View>

              <View className="flex-row items-center flex-1">

                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color="#B77900"
                />

                <Text className="text-[10px] text-gray-500 ml-1.5">
                  Book Services
                </Text>

              </View>

              <View className="flex-row items-center">

                <Ionicons
                  name="star-outline"
                  size={14}
                  color="#B77900"
                />

                <Text className="text-[10px] text-gray-500 ml-1.5">
                  Reviews
                </Text>

              </View>

            </View>
          )}

        </TouchableOpacity>

        {/* ===============================================
            TECHNICIAN
        =============================================== */}

        <TouchableOpacity
          activeOpacity={0.75}
          disabled={loading}
          onPress={() =>
            setSelectedRole('technician')
          }
          className={`rounded-[26px] p-5 border-2 mt-4 ${
            selectedRole === 'technician'
              ? 'bg-white border-[#FFC342]'
              : 'bg-white border-white'
          }`}
          style={{
            elevation:
              selectedRole === 'technician'
                ? 4
                : 2,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 3,
            },
            shadowOpacity:
              selectedRole === 'technician'
                ? 0.08
                : 0.04,
            shadowRadius: 7,
          }}
        >

          <View className="flex-row items-center">

            {/* ICON */}

            <View
              className={`w-16 h-16 rounded-[20px] items-center justify-center ${
                selectedRole === 'technician'
                  ? 'bg-[#FFC342]'
                  : 'bg-[#FFF3D2]'
              }`}
            >
              <Ionicons
                name="construct"
                size={27}
                color="#111827"
              />
            </View>

            {/* TEXT */}

            <View className="flex-1 ml-4">

              <View className="flex-row items-center">

                <Text className="text-lg font-extrabold text-gray-950">
                  I'm a Technician
                </Text>

                {selectedRole ===
                  'technician' && (
                  <View className="bg-[#FFF3D2] rounded-full px-2.5 py-1 ml-2">

                    <Text className="text-[9px] font-extrabold text-[#B77900]">
                      SELECTED
                    </Text>

                  </View>
                )}

              </View>

              <Text className="text-xs text-gray-500 leading-5 mt-1">
                Offer your skills, receive bookings
                and earn from your services.
              </Text>

            </View>

            {/* CHECK */}

            <View
              className={`w-8 h-8 rounded-full items-center justify-center ml-2 ${
                selectedRole === 'technician'
                  ? 'bg-[#FFC342]'
                  : 'bg-gray-100'
              }`}
            >
              {selectedRole ===
              'technician' ? (
                <Ionicons
                  name="checkmark"
                  size={18}
                  color="#111827"
                />
              ) : (
                <View className="w-3 h-3 rounded-full border-2 border-gray-300" />
              )}
            </View>

          </View>

          {/* TECHNICIAN FEATURES */}

          {selectedRole ===
            'technician' && (
            <View className="flex-row items-center mt-4 pt-4 border-t border-gray-100">

              <View className="flex-row items-center flex-1">

                <Ionicons
                  name="briefcase-outline"
                  size={14}
                  color="#B77900"
                />

                <Text className="text-[10px] text-gray-500 ml-1.5">
                  Get Jobs
                </Text>

              </View>

              <View className="flex-row items-center flex-1">

                <Ionicons
                  name="cash-outline"
                  size={14}
                  color="#B77900"
                />

                <Text className="text-[10px] text-gray-500 ml-1.5">
                  Earn Money
                </Text>

              </View>

              <View className="flex-row items-center">

                <Ionicons
                  name="people-outline"
                  size={14}
                  color="#B77900"
                />

                <Text className="text-[10px] text-gray-500 ml-1.5">
                  Customers
                </Text>

              </View>

            </View>
          )}

        </TouchableOpacity>

        {/* INFO */}

        <View className="flex-row items-start bg-[#FFF0C7] rounded-[18px] px-4 py-3 mt-5">

          <Ionicons
            name="information-circle-outline"
            size={17}
            color="#B77900"
          />

          <Text className="flex-1 text-[11px] text-[#8A6200] leading-4 ml-2">
            Your selected role determines which
            BookingApp dashboard you'll use.
          </Text>

        </View>

      </View>

      {/* ===============================================
          CONTINUE BUTTON
      =============================================== */}

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
          onPress={onContinue}
          disabled={!selectedRole || loading}
          className={`w-full rounded-full py-4 items-center ${
            selectedRole && !loading
              ? 'bg-[#FFC342]'
              : 'bg-gray-200'
          }`}
        >

          {loading ? (
            <View className="flex-row items-center">

              <ActivityIndicator
                size="small"
                color="#111827"
              />

              <Text className="text-base font-extrabold text-gray-700 ml-2">
                Setting up...
              </Text>

            </View>
          ) : (
            <View className="flex-row items-center">

              <Text
                className={`text-base font-extrabold ${
                  selectedRole
                    ? 'text-gray-950'
                    : 'text-gray-400'
                }`}
              >
                Continue
              </Text>

              {selectedRole && (
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#111827"
                  style={{
                    marginLeft: 8,
                  }}
                />
              )}

            </View>
          )}

        </TouchableOpacity>

        <Text className="text-[10px] text-gray-400 text-center mt-3">
          Select a role to continue
        </Text>

      </View>

    </SafeAreaView>
  )
}