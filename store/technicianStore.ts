import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import {
  createJSONStorage,
  persist,
} from 'zustand/middleware'

import { Technician } from '../types/technician'

interface TechnicianState {
  techniciansByService: Record<string, Technician[]>

  setTechnicians: (
    service: string,
    technicians: Technician[]
  ) => void

  clearTechnicians: () => void
}

export const useTechnicianStore =
  create<TechnicianState>()(
    persist(
      (set) => ({
        techniciansByService: {},

        setTechnicians: (
          service,
          technicians
        ) =>
          set((state) => ({
            techniciansByService: {
              ...state.techniciansByService,
              [service]: technicians,
            },
          })),

        clearTechnicians: () =>
          set({
            techniciansByService: {},
          }),
      }),
      {
        name: 'technician-storage',

        storage: createJSONStorage(
          () => AsyncStorage
        ),
      }
    )
  )