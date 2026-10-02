import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useAddressStore } from '../../store/addressStore'

export default function SavedAddresses() {
  const router = useRouter()

  const {
    addresses,
    addAddress,
    removeAddress,
  } = useAddressStore()

  const [showForm, setShowForm] =
    useState(false)

  const [label, setLabel] =
    useState('')

  const [address, setAddress] =
    useState('')

  // =====================================================
  // SAVE
  // =====================================================

  const onSave = () => {
    if (
      !label.trim() ||
      !address.trim()
    ) {
      Alert.alert(
        'Error',
        'Write both label and address'
      )

      return
    }

    addAddress(
      label.trim(),
      address.trim()
    )

    setLabel('')
    setAddress('')
    setShowForm(false)
  }

  // =====================================================
  // DELETE
  // =====================================================

  const onDelete = (id: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            removeAddress(id),
        },
      ]
    )
  }

  return (
    <SafeAreaView
      edges={['top']}
      className="flex-1 bg-[#FFF8E8]"
    >
      {/* HEADER */}

      <View className="flex-row items-center justify-between px-6 pt-4 pb-3">

        <View className="flex-row items-center flex-1">

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            className="w-11 h-11 rounded-full bg-white items-center justify-center mr-4"
            style={{
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
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
              Saved Addresses
            </Text>

            <Text className="text-xs text-gray-500 mt-1">
              Manage your service locations
            </Text>
          </View>

        </View>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() =>
            setShowForm(!showForm)
          }
          className={`w-11 h-11 rounded-full items-center justify-center ${
            showForm
              ? 'bg-white'
              : 'bg-[#FFC342]'
          }`}
        >
          <Ionicons
            name={
              showForm
                ? 'close'
                : 'add'
            }
            size={23}
            color="#111827"
          />
        </TouchableOpacity>

      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 15,
          paddingBottom: 30,
        }}
      >

        {/* ADD FORM */}

        {showForm && (
          <View
            className="bg-white rounded-[26px] p-5 mb-6"
            style={{
              elevation: 3,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 3,
              },
              shadowOpacity: 0.05,
              shadowRadius: 7,
            }}
          >

            <View className="flex-row items-center mb-5">

              <View className="w-11 h-11 rounded-full bg-[#FFF3D2] items-center justify-center">
                <Ionicons
                  name="location"
                  size={20}
                  color="#B77900"
                />
              </View>

              <View className="ml-3">

                <Text className="text-base font-extrabold text-gray-950">
                  Add New Address
                </Text>

                <Text className="text-[11px] text-gray-400 mt-0.5">
                  Save a location for future bookings
                </Text>

              </View>

            </View>

            {/* LABEL */}

            <Text className="text-xs font-bold text-gray-700 mb-2">
              Address Label
            </Text>

            <View className="flex-row items-center bg-[#FFF8E8] rounded-[16px] px-4 mb-4">

              <Ionicons
                name="bookmark-outline"
                size={17}
                color="#B77900"
              />

              <TextInput
                value={label}
                onChangeText={setLabel}
                placeholder="e.g. Home, Office"
                placeholderTextColor="#9CA3AF"
                className="flex-1 ml-3 py-4 text-sm text-gray-900"
              />

            </View>

            {/* ADDRESS */}

            <Text className="text-xs font-bold text-gray-700 mb-2">
              Full Address
            </Text>

            <View className="bg-[#FFF8E8] rounded-[16px] px-4 py-2">

              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="House #, Street, Area..."
                placeholderTextColor="#9CA3AF"
                multiline
                style={{
                  minHeight: 75,
                  textAlignVertical: 'top',
                }}
                className="text-sm text-gray-900 py-3"
              />

            </View>

            {/* SAVE */}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onSave}
              className="bg-[#FFC342] rounded-full py-4 items-center mt-5"
            >

              <View className="flex-row items-center">

                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color="#111827"
                />

                <Text className="text-sm font-extrabold text-gray-950 ml-2">
                  Save Address
                </Text>

              </View>

            </TouchableOpacity>

          </View>
        )}

        {/* HEADING */}

        <View className="flex-row items-center justify-between mb-3">

          <Text className="text-lg font-extrabold text-gray-950">
            Your Addresses
          </Text>

          {addresses.length > 0 && (
            <View className="bg-[#FFF3D2] rounded-full px-3 py-1.5">
              <Text className="text-[11px] font-bold text-[#B77900]">
                {addresses.length}{' '}
                {addresses.length === 1
                  ? 'address'
                  : 'addresses'}
              </Text>
            </View>
          )}

        </View>

        {/* EMPTY STATE */}

        {addresses.length === 0 ? (
          <View className="items-center justify-center py-16">

            <View className="w-24 h-24 rounded-full bg-white items-center justify-center">

              <View className="w-16 h-16 rounded-full bg-[#FFF3D2] items-center justify-center">

                <Ionicons
                  name="location-outline"
                  size={29}
                  color="#B77900"
                />

              </View>

            </View>

            <Text className="text-base font-extrabold text-gray-800 mt-5">
              No saved addresses
            </Text>

            <Text className="text-xs text-gray-400 text-center leading-5 mt-2 px-10">
              Save your home or office address to make
              future bookings faster.
            </Text>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() =>
                setShowForm(true)
              }
              className="flex-row items-center bg-[#FFC342] rounded-full px-5 py-3 mt-5"
            >
              <Ionicons
                name="add"
                size={17}
                color="#111827"
              />

              <Text className="text-xs font-extrabold text-gray-950 ml-1">
                Add Address
              </Text>
            </TouchableOpacity>

          </View>
        ) : (
          addresses.map(
            (addr, index) => (
              <View
                key={addr.id}
                className="bg-white rounded-[22px] p-4 mb-3"
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

                <View className="flex-row items-start">

                  {/* ICON */}

                  <View className="w-12 h-12 rounded-full bg-[#FFF3D2] items-center justify-center">

                    <Ionicons
                      name={
                        addr.label
                          .toLowerCase()
                          .includes('home')
                          ? 'home'
                          : addr.label
                              .toLowerCase()
                              .includes('office')
                          ? 'business'
                          : 'location'
                      }
                      size={20}
                      color="#B77900"
                    />

                  </View>

                  {/* DETAILS */}

                  <View className="flex-1 ml-3">

                    <View className="flex-row items-center">

                      <Text
                        className="text-base font-extrabold text-gray-900 flex-1"
                        numberOfLines={1}
                      >
                        {addr.label}
                      </Text>

                      {index === 0 && (
                        <View className="bg-[#FFF3D2] rounded-full px-2.5 py-1">
                          <Text className="text-[9px] font-bold text-[#B77900]">
                            SAVED
                          </Text>
                        </View>
                      )}

                    </View>

                    <Text className="text-xs text-gray-500 mt-1.5 leading-5">
                      {addr.address}
                    </Text>

                  </View>

                </View>

                {/* BOTTOM */}

                <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-gray-100">

                  <View className="flex-row items-center">

                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color="#16A34A"
                    />

                    <Text className="text-[10px] text-gray-400 ml-1.5">
                      Ready to use for booking
                    </Text>

                  </View>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      onDelete(addr.id)
                    }
                    className="w-9 h-9 rounded-full bg-red-50 items-center justify-center"
                  >
                    <Ionicons
                      name="trash-outline"
                      size={17}
                      color="#DC2626"
                    />
                  </TouchableOpacity>

                </View>

              </View>
            )
          )
        )}

      </ScrollView>
    </SafeAreaView>
  )
}