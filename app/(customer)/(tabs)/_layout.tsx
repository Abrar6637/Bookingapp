import { NativeTabs } from 'expo-router/unstable-native-tabs'

export default function TabLayout() {
  return (
    <NativeTabs
      tintColor="#D99A00"
      backgroundColor="#000000"
      labelStyle={{
        fontSize: 11,
        fontWeight: '600',
      }}
    >
      {/* HOME */}
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon
          sf={{
            default: 'house',
            selected: 'house.fill',
          }}
          md="home"
        />

        <NativeTabs.Trigger.Label>
          Home
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      {/* BOOKINGS */}
      <NativeTabs.Trigger name="bookings">
        <NativeTabs.Trigger.Icon
          sf={{
            default: 'calendar',
            selected: 'calendar.circle.fill',
          }}
          md="event"
        />

        <NativeTabs.Trigger.Label>
          Bookings
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