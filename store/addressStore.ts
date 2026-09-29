import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface SavedAddress {
  id: string
  label: string
  address: string
}

interface AddressState {
  addresses: SavedAddress[]
  addAddress: (label: string, address: string) => void
  removeAddress: (id: string) => void
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set) => ({
      addresses: [],
      addAddress: (label, address) =>
        set((state) => ({
          addresses: [...state.addresses, { id: Date.now().toString(), label, address }],
        })),
      removeAddress: (id) =>
        set((state) => ({
          addresses: state.addresses.filter((a) => a.id !== id),
        })),
    }),
    {
      name: 'address-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)