import { create } from 'zustand'

interface TechnicianRequestState {
  pendingCount: number
  setPendingCount: (count: number) => void
}

export const useTechnicianRequestStore =
  create<TechnicianRequestState>((set) => ({
    pendingCount: 0,

    setPendingCount: (count) =>
      set({
        pendingCount: Math.max(0, count),
      }),
  }))