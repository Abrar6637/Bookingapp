import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface LocationState {
  city: string
  area: string
  fullAddress: string

  latitude: number | null
  longitude: number | null

  setLocation: (
    city: string,
    area: string,
    latitude?: number | null,
    longitude?: number | null
  ) => void
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      city: 'Lahore',
      area: 'DHA, Lahore',
      fullAddress: 'DHA, Lahore',

      latitude: null,
      longitude: null,

      setLocation: (
        city,
        area,
        latitude = null,
        longitude = null
      ) =>
        set({
          city,
          area,
          fullAddress: `${area}, ${city}`,
          latitude,
          longitude,
        }),
    }),
    {
      name: 'location-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)