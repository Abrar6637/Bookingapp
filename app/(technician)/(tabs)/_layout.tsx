import { useAuth } from '@clerk/expo'
import { NativeTabs } from 'expo-router/unstable-native-tabs'
import { useEffect } from 'react'

import { bookingService } from '../../../services/bookingService'
import { useTechnicianRequestStore } from '../../../store/technicianRequestStore'

export default function TechnicianTabLayout() {
  const { getToken } = useAuth()

  const pendingCount = useTechnicianRequestStore(
    (state) => state.pendingCount
  )

  const setPendingCount = useTechnicianRequestStore(
    (state) => state.setPendingCount
  )

  // Load real pending request count when technician tabs open
  useEffect(() => {
    const loadPendingCount = async () => {
      try {
        const token = await getToken()

        const bookings = await bookingService.getAll(token)

        const pendingRequests = bookings.filter(
          (booking) => booking.status === 'Pending'
        )

        setPendingCount(pendingRequests.length)
      } catch (error: any) {
        console.log(
          'Error loading pending request count:',
          error.message
        )
      }
    }

    loadPendingCount()
  }, [getToken, setPendingCount])

  return (
    <NativeTabs
      labelVisibilityMode="labeled"
      tintColor="#D99A00"
      backgroundColor="#000000"
      labelStyle={{
        fontSize: 11,
        fontWeight: '600',
      }}
    >
      {/* REQUESTS */}
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon
          sf={{
            default: 'bell',
            selected: 'bell.fill',
          }}
          md="notifications"
        />

        <NativeTabs.Trigger.Label>
          Requests
        </NativeTabs.Trigger.Label>

        {pendingCount > 0 && (
          <NativeTabs.Trigger.Badge>
            {pendingCount > 99
              ? '99+'
              : String(pendingCount)}
          </NativeTabs.Trigger.Badge>
        )}
      </NativeTabs.Trigger>

      {/* JOBS */}
      <NativeTabs.Trigger name="jobs">
        <NativeTabs.Trigger.Icon
          sf={{
            default: 'briefcase',
            selected: 'briefcase.fill',
          }}
          md="work"
        />

        <NativeTabs.Trigger.Label>
          Jobs
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      {/* EARNINGS */}
      <NativeTabs.Trigger name="earnings">
        <NativeTabs.Trigger.Icon
          sf={{
            default: 'creditcard',
            selected: 'creditcard.fill',
          }}
          md="account_balance_wallet"
        />

        <NativeTabs.Trigger.Label>
          Earnings
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      {/* PROFILE */}
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon
          sf={{
            default: 'person',
            selected: 'person.fill',
          }}
          md="person"
        />

        <NativeTabs.Trigger.Label>
          Profile
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}