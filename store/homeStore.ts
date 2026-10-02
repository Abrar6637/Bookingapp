import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import {
    createJSONStorage,
    persist,
} from 'zustand/middleware'

import { ServiceCategory } from '../types/service'
import { Technician } from '../types/technician'

interface HomeState {
  services: ServiceCategory[]
  topTechnicians: Technician[]

  setServices: (services: ServiceCategory[]) => void

  setTopTechnicians: (
    technicians: Technician[]
  ) => void
}

export const useHomeStore = create<HomeState>()(
  persist(
    (set) => ({
      services: [],
      topTechnicians: [],

      setServices: (services) =>
        set({
          services,
        }),

      setTopTechnicians: (technicians) =>
        set({
          topTechnicians: technicians,
        }),
    }),

    {
      name: 'home-storage',
      storage: createJSONStorage(
        () => AsyncStorage
      ),
    }
  )
)