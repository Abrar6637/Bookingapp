import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import {
  createJSONStorage,
  persist,
} from 'zustand/middleware'

import { Booking } from '../types/booking'

interface BookingState {
  bookings: Booking[]

  setBookings: (bookings: Booking[]) => void

  addBooking: (booking: Booking) => void

  updateBookingStatus: (
    bookingId: number | string,
    status: string
  ) => void

  removeBooking: (
    bookingId: number | string
  ) => void

  clearBookings: () => void
}

export const useBookingStore =
  create<BookingState>()(
    persist(
      (set) => ({
        bookings: [],

        // Set all bookings
        setBookings: (bookings) =>
          set({
            bookings,
          }),

        // Add a new booking to the top
        // Also prevents duplicate booking IDs
        addBooking: (booking) =>
          set((state) => ({
            bookings: [
              booking,
              ...state.bookings.filter(
                (item) =>
                  String(item.id) !==
                  String(booking.id)
              ),
            ],
          })),

        // Update booking status
        updateBookingStatus: (
          bookingId,
          status
        ) =>
          set((state) => ({
            bookings: state.bookings.map(
              (booking) =>
                String(booking.id) ===
                String(bookingId)
                  ? {
                      ...booking,
                      status:
                        status as Booking['status'],
                    }
                  : booking
            ),
          })),

        // Remove booking
        removeBooking: (bookingId) =>
          set((state) => ({
            bookings:
              state.bookings.filter(
                (booking) =>
                  String(booking.id) !==
                  String(bookingId)
              ),
          })),

        // Clear all bookings
        clearBookings: () =>
          set({
            bookings: [],
          }),
      }),
      {
        name: 'booking-storage',

        storage: createJSONStorage(
          () => AsyncStorage
        ),
      }
    )
  )