import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import {
  createJSONStorage,
  persist,
} from 'zustand/middleware'

export interface SavedAddress {
  id: string
  label: string
  address: string

  // Optional location coordinates
  latitude?: number | null
  longitude?: number | null
}

interface AddressState {
  addresses: SavedAddress[]

  addAddress: (
    label: string,
    address: string,
    latitude?: number | null,
    longitude?: number | null
  ) => void

  updateAddress: (
    id: string,
    label: string,
    address: string,
    latitude?: number | null,
    longitude?: number | null
  ) => void

  removeAddress: (id: string) => void
}

export const useAddressStore =
  create<AddressState>()(
    persist(
      (set) => ({
        addresses: [],

        // ADD ADDRESS
        addAddress: (
          label,
          address,
          latitude = null,
          longitude = null
        ) => {
          const cleanLabel = label.trim()
          const cleanAddress = address.trim()

          if (!cleanLabel || !cleanAddress) {
            return
          }

          set((state) => ({
            addresses: [
              ...state.addresses,
              {
                id: Date.now().toString(),
                label: cleanLabel,
                address: cleanAddress,
                latitude,
                longitude,
              },
            ],
          }))
        },

        // UPDATE ADDRESS
        updateAddress: (
          id,
          label,
          address,
          latitude = null,
          longitude = null
        ) => {
          const cleanLabel = label.trim()
          const cleanAddress = address.trim()

          if (!cleanLabel || !cleanAddress) {
            return
          }

          set((state) => ({
            addresses: state.addresses.map(
              (savedAddress) =>
                savedAddress.id === id
                  ? {
                      ...savedAddress,
                      label: cleanLabel,
                      address: cleanAddress,
                      latitude,
                      longitude,
                    }
                  : savedAddress
            ),
          }))
        },

        // REMOVE ADDRESS
        removeAddress: (id) =>
          set((state) => ({
            addresses: state.addresses.filter(
              (savedAddress) =>
                savedAddress.id !== id
            ),
          })),
      }),

      {
        name: 'address-storage',

        storage: createJSONStorage(
          () => AsyncStorage
        ),
      }
    )
  )