import { useAuth } from '@clerk/expo'
import Constants from 'expo-constants'
import { useEffect } from 'react'
import { Platform } from 'react-native'

import { apiFetch } from '../services/api'

async function registerForPushToken(): Promise<string | null> {
  // Expo Go / Store Client mein push registration skip
  if (Constants.executionEnvironment === 'storeClient') {
    return null
  }

  try {
    // Native modules ko sirf development/production build mein load karo
    const Device =
      require('expo-device') as typeof import('expo-device')

    const Notifications =
      require('expo-notifications') as typeof import('expo-notifications')

    // Push notifications physical device par test karo
    if (!Device.isDevice) {
      console.log(
        'Push notifications require a physical device.'
      )

      return null
    }

    // Foreground notification behaviour
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    })

    // Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(
        'default',
        {
          name: 'BookingApp Notifications',
          importance:
            Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
        }
      )
    }

    // Check notification permission
    const permission =
      await Notifications.getPermissionsAsync()

    let finalStatus = permission.status

    // Ask permission only when required
    if (finalStatus !== 'granted') {
      const requestedPermission =
        await Notifications.requestPermissionsAsync()

      finalStatus = requestedPermission.status
    }

    if (finalStatus !== 'granted') {
      console.log(
        'Notification permission not granted.'
      )

      return null
    }

    // EAS Project ID
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId

    if (!projectId) {
      console.log(
        'EAS projectId not found. Push registration skipped.'
      )

      return null
    }

    // Generate Expo Push Token
    const pushToken =
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })

    return pushToken.data
  } catch (error: any) {
    console.log(
      'Push token generation failed:',
      error?.message || error
    )

    return null
  }
}

export function usePushNotifications() {
  const { getToken, isSignedIn } = useAuth()

  useEffect(() => {
    if (!isSignedIn) {
      return
    }

    const registerPushToken = async () => {
      try {
        const pushToken =
          await registerForPushToken()

        if (!pushToken) {
          return
        }

        const authToken = await getToken()

        if (!authToken) {
          return
        }

        // Save token in Laravel backend
        await apiFetch('/user/push-token', {
          method: 'POST',
          token: authToken,
          body: {
            token: pushToken,
          },
        })

        console.log(
          'Push token registered successfully.'
        )
      } catch (error: any) {
        console.log(
          'Push registration skipped:',
          error?.message || error
        )
      }
    }

    registerPushToken()
  }, [isSignedIn, getToken])
}