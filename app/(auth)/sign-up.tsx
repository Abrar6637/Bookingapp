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

  const [authMode, setAuthMode] = useState<'email' | 'phone'>('email')
  const [fullName, setFullName] = useState('')
  const [emailAddress, setEmailAddress] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isSignedIn) {
      router.replace('/(root)/tabs')
    }
  }, [isSignedIn])

  // Step 1: Create account + send OTP
  const onSignUpPress = async () => {
    console.log('1. Sign up button pressed, isLoaded =', isLoaded)
    if (!isLoaded || !signUp) return

    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name')
      return
    }

    setLoading(true)
    try {
      const [firstName, ...rest] = fullName.trim().split(' ')
      const lastName = rest.join(' ')

      if (authMode === 'email') {
        console.log('2. Calling signUp.create with email')
        await signUp.create({
          emailAddress,
          password,
          firstName,
          lastName: lastName || undefined,
        })

        console.log('3. Sending email code')
        await signUp.verifications.sendEmailCode()
      } else {
        console.log('2. Calling signUp.create with phone')
        await signUp.create({
          phoneNumber,
          password,
          firstName,
          lastName: lastName || undefined,
        })

        console.log('3. Sending phone code')
        await signUp.verifications.sendPhoneCode()
      }

      console.log('4. OTP sent, showing verification screen')
      setPendingVerification(true)
    } catch (err: any) {
      console.log('ERROR (signup) message:', err?.message)
      Alert.alert('Error', err.errors?.[0]?.message || err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP code
  const onVerifyPress = async () => {
    console.log('Verify button pressed, isLoaded =', isLoaded)
    if (!isLoaded || !signUp || loading) return
    setLoading(true)
    try {
      if (authMode === 'email') {
        await signUp.verifications.verifyEmailCode({ code })
      } else {
        await signUp.verifications.verifyPhoneCode({ code })
      }

      console.log('After verify, signUp.createdSessionId:', signUp.createdSessionId)
      console.log('After verify, signUp.status:', signUp.status)

      if (signUp.createdSessionId) {
        await setActive({ session: signUp.createdSessionId })
        router.replace('/(root)/tabs')
      }
    } catch (err: any) {
      console.log('ERROR (verify) message:', err?.message)
      Alert.alert('Error', err.errors?.[0]?.message || err.message || 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  // OTP screen
  if (pendingVerification) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-2xl font-bold mb-4">Verify {authMode === 'email' ? 'Email' : 'Phone'}</Text>
        <Text className="text-gray-500 mb-6 text-center">
         we sent a code to {authMode === 'email' ? emailAddress : phoneNumber} 
        </Text>

        <Text className="w-full text-sm font-semibold text-gray-700 mb-1">OTP Code</Text>
        <TextInput
          value={code}
          placeholder="Enter 6-digit code"
          keyboardType="number-pad"
          onChangeText={setCode}
          className="w-full border border-gray-300 rounded-lg p-3 mb-6 text-center text-lg"
        />

        <TouchableOpacity
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
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-white" keyboardShouldPersistTaps="handled">
      <View className="flex-1 items-center justify-center bg-white px-6 py-10">
        <Image
          source={require('../../assets/images/buttr.png')}
          className="w-40 h-40 mb-6"
          resizeMode="contain"
        />
        <Text className="text-2xl font-bold mb-6">Sign Up</Text>

        {/* Full Name */}
        <Text className="w-full text-sm font-semibold text-gray-700 mb-1">Full Name</Text>
        <TextInput
          value={fullName}
          placeholder="Enter full name"
          onChangeText={setFullName}
          className="w-full border border-gray-300 rounded-lg p-3 mb-4"
        />

        {/* Email / Phone heading + toggle */}
        <Text className="w-full text-sm font-semibold text-gray-700 mb-1">Sign up using</Text>
        <View className="flex-row w-full mb-4 border border-gray-300 rounded-lg overflow-hidden">
          <TouchableOpacity
            onPress={() => setAuthMode('email')}
            className={`flex-1 p-3 items-center ${authMode === 'email' ? 'bg-black' : 'bg-white'}`}
          >
            <Text className={authMode === 'email' ? 'text-white font-bold' : 'text-black'}>Email</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setAuthMode('phone')}
            className={`flex-1 p-3 items-center ${authMode === 'phone' ? 'bg-black' : 'bg-white'}`}
          >
            <Text className={authMode === 'phone' ? 'text-white font-bold' : 'text-black'}>Phone</Text>
          </TouchableOpacity>
        </View>

        {/* Email or Phone input */}
        {authMode === 'email' ? (
          <>
            <Text className="w-full text-sm font-semibold text-gray-700 mb-1">Email Address</Text>
            <TextInput
              autoCapitalize="none"
              placeholder="Enter email"
              keyboardType="email-address"
              value={emailAddress}
              onChangeText={setEmailAddress}
              className="w-full border border-gray-300 rounded-lg p-3 mb-4"
            />
          </>
        ) : (
          <>
            <Text className="w-full text-sm font-semibold text-gray-700 mb-1 ">Phone Number</Text>
            <TextInput
              keyboardType="phone-pad"
              placeholder="Enter phone number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              className="w-full border border-gray-300 rounded-lg p-3 px-5 mb-4"
            />
          </>
        )}

        {/* Password with eye icon */}
        <Text className="w-full text-sm font-semibold text-gray-700 mb-1">Password</Text>
        <View className="w-full flex-row items-center border border-gray-300 rounded-lg mb-6 px-2">
          <TextInput
            value={password}
            placeholder="Enter password"
            secureTextEntry={!showPassword}
            onChangeText={setPassword}
            className="flex-1 p-3"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={22}
              color="#666"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
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