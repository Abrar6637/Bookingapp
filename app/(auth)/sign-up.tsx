import { useAuth, useClerk, useSignUp } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function SignUp() {
  const { signUp } = useSignUp()
  const { isLoaded, isSignedIn } = useAuth()
  const { setActive } = useClerk()
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [isEmail, setIsEmail] = useState(true)

  useEffect(() => {
    if (isSignedIn) {
      router.replace('/(onboarding)/role-selection')
    }
  }, [isSignedIn])

  // Step 1: Create account + send OTP
  const onSignUpPress = async () => {
    if (!isLoaded || !signUp) return

    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name')
      return
    }

    if (!identifier.trim()) {
      Alert.alert('Error', 'Please enter your email or phone number')
      return
    }

    setLoading(true)
    try {
      const [firstName, ...rest] = fullName.trim().split(' ')
      const lastName = rest.join(' ')

      const inputIsEmail = identifier.includes('@')
      setIsEmail(inputIsEmail)

      if (inputIsEmail) {
        await signUp.create({
          emailAddress: identifier.trim(),
          password,
          firstName,
          lastName: lastName || undefined,
        })
        await signUp.verifications.sendEmailCode()
      } else {
        await signUp.create({
          phoneNumber: identifier.trim(),
          password,
          firstName,
          lastName: lastName || undefined,
        })
        await signUp.verifications.sendPhoneCode()
      }

      setPendingVerification(true)
    } catch (err: any) {
      Alert.alert('Error', err.errors?.[0]?.message || err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP code
  const onVerifyPress = async () => {
    if (!isLoaded || !signUp || loading) return
    setLoading(true)
    try {
      if (isEmail) {
        await signUp.verifications.verifyEmailCode({ code })
      } else {
        await signUp.verifications.verifyPhoneCode({ code })
      }

      if (signUp.createdSessionId) {
        await setActive({ session: signUp.createdSessionId })
        router.replace('/(onboarding)/role-selection')
      }
    } catch (err: any) {
      Alert.alert('Error', err.errors?.[0]?.message || err.message || 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  // OTP screen
  if (pendingVerification) {
    return (
      <View style={{ backgroundColor: '#6EC4C4' }} className="flex-1 items-center justify-center px-6">
        <Text className="text-2xl font-bold mb-4 text-gray-900">Verify {isEmail ? 'Email' : 'Phone'}</Text>
        <Text className="text-gray-800 mb-6 text-center">
          We sent a code to {identifier}
        </Text>

        <Text className="w-full text-sm font-semibold text-gray-900 mb-1">OTP Code</Text>
        <TextInput
          value={code}
          placeholder="Enter 6-digit code"
          keyboardType="number-pad"
          onChangeText={setCode}
          className="w-full border border-gray-700 bg-white/80 rounded-lg p-3 mb-6 text-center text-lg text-gray-900"
        />

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onVerifyPress}
          disabled={loading}
          className="w-full bg-black rounded-lg p-4 items-center"
        >
          <Text className="text-white font-bold">{loading ? 'Verifying...' : 'Verify'}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Sign-up form
  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      style={{ backgroundColor: '#4863A0' }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1 items-center justify-center px-6 py-10">
        <Image
          source={require('../../assets/images/bookingap.png')}
          className="w-100 h-36 mb-4"
          resizeMode="contain"
        />
        <Text className="text-2xl font-bold mb-6 text-gray-900">Sign Up</Text>

        {/* Full Name */}
        <Text className="w-full text-sm font-semibold text-gray-900 mb-1">Full Name</Text>
        <TextInput
          value={fullName}
          placeholder="Enter full name"
          onChangeText={setFullName}
          className="w-full border border-gray-700 bg-white/80 rounded-lg p-3 mb-4 text-gray-900"
        />

        {/* Combined Email / Phone Input */}
        <Text className="w-full text-sm font-semibold text-gray-900 mb-1">Email / Phone Number</Text>
        <TextInput
          autoCapitalize="none"
          placeholder="Enter email or phone (+923...)"
          value={identifier}
          onChangeText={setIdentifier}
          className="w-full border border-gray-700 bg-white/80 rounded-lg p-3 mb-4 text-gray-900"
        />

        {/* Password with eye icon */}
        <Text className="w-full text-sm font-semibold text-gray-900 mb-1">Password</Text>
        <View className="w-full flex-row items-center border border-gray-700 bg-white/80 rounded-lg mb-6 px-2">
          <TextInput
            value={password}
            placeholder="Enter password"
            secureTextEntry={!showPassword}
            onChangeText={setPassword}
            className="flex-1 p-3 text-gray-900"
          />
          <TouchableOpacity activeOpacity={0.7} onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={22}
              color="#444"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onSignUpPress}
          disabled={loading}
          className="w-full bg-black rounded-lg p-4 items-center mb-4"
        >
          <Text className="text-white font-bold">{loading ? 'Creating...' : 'Sign Up'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}