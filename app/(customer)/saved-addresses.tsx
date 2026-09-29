import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAddressStore } from '../../store/addressStore'

export default function SavedAddresses() {
  const router = useRouter()
  const { addresses, addAddress, removeAddress } = useAddressStore()
  const [showForm, setShowForm] = useState(false)
  const [label, setLabel] = useState('')
  const [address, setAddress] = useState('')

  const onSave = () => {
    if (!label.trim() || !address.trim()) {
      Alert.alert('Error', 'Write both lable and address')
      return
    }
    addAddress(label.trim(), address.trim())
    setLabel('')
    setAddress('')
    setShowForm(false)
  }

  const onDelete = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeAddress(id) },
    ])
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Saved Addresses</Text>
        </View>
        <TouchableOpacity onPress={() => setShowForm(!showForm)}>
          <Ionicons name={showForm ? 'close' : 'add'} size={26} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 mt-2" showsVerticalScrollIndicator={false}>
        {/* Add Form */}
        {showForm && (
          <View className="bg-gray-50 rounded-2xl p-4 mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-1">Label</Text>
            <TextInput
              value={label}
              onChangeText={setLabel}
              placeholder="e.g. Home, Office"
              placeholderTextColor="#9ca3af"
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 mb-3"
            />
            <Text className="text-sm font-semibold text-gray-700 mb-1">Address</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="House #, Street, Area..."
              placeholderTextColor="#9ca3af"
              multiline
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 mb-4"
            />
            <TouchableOpacity onPress={onSave} className="bg-black rounded-lg py-3 items-center">
              <Text className="text-white font-bold">Save Address</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* List */}
        {addresses.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Ionicons name="location-outline" size={40} color="#d1d5db" />
            <Text className="text-gray-400 text-sm mt-3 text-center">
              Not save any address.{'\n'}above + add address from button.
            </Text>
          </View>
        ) : (
          addresses.map((addr) => (
            <View
              key={addr.id}
              className="flex-row items-start bg-white border border-gray-200 rounded-2xl p-4 mb-3"
            >
              <Ionicons name="location" size={20} color="#000" style={{ marginTop: 2 }} />
              <View className="flex-1 ml-3">
                <Text className="text-base font-bold text-gray-900">{addr.label}</Text>
                <Text className="text-sm text-gray-500 mt-1">{addr.address}</Text>
              </View>
              <TouchableOpacity onPress={() => onDelete(addr.id)}>
                <Ionicons name="trash-outline" size={20} color="#dc2626" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}