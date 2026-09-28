import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface LocationState {
  city: string
  area: string
  fullAddress: string
  setLocation: (city: string, area: string) => void
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      city: 'Lahore',
      area: 'DHA, Lahore',
      fullAddress: 'DHA, Lahore',
      setLocation: (city, area) =>
        set({ city, area, fullAddress: `${area}, ${city}` }),
    }),
    {
      name: 'location-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)