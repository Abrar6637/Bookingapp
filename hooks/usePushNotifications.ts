import { useAuth } from '@clerk/expo'
import Constants from 'expo-constants'
import { useEffect } from 'react'
import { Platform } from 'react-native'
import { apiFetch } from '../services/api'

async function registerForPushToken(): Promise<string | null> {
  // Expo Go me expo-notifications import karna bhi crash karta hai, isliye
  // ise yahan sirf tab require karte hain jab Expo Go na ho
  if (Constants.executionEnvironment === 'storeClient') return null

  const Device = require('expo-device')
  const Notifications = require('expo-notifications')

  if (!Device.isDevice) return null

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  })

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    })
  }

  const { status: existing } = await Notifications.getPermissionsAsync()
  let finalStatus = existing
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }
  if (finalStatus !== 'granted') return null

  const projectId = Constants.expoConfig?.extra?.eas?.projectId
  const token = await Notifications.getExpoPushTokenAsync({ projectId })
  return token.data
}

export function usePushNotifications() {
  const { getToken, isSignedIn } = useAuth()

  useEffect(() => {
    if (!isSignedIn) return

    ;(async () => {
      try {
        const pushToken = await registerForPushToken()
        if (!pushToken) return
        const authToken = await getToken()
        await apiFetch('/user/push-token', {
          method: 'POST',
          token: authToken,
          body: { token: pushToken },
        })
      } catch (err: any) {
        console.log('Push registration skipped:', err.message)
      }
    })()
  }, [isSignedIn])
}