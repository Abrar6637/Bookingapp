import { useSignIn, useUser } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import { Link, useRouter } from 'expo-router'
import React, { useState } from 'react'
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

type Step = 'signIn' | 'clientTrust' | 'forgotEmail' | 'forgotReset'

function PasswordInput({
  value,
  onChange,
  placeholder,
  show,
  onToggle,
}: {
  value: string
  onChange: (t: string) => void
  placeholder: string
  show: boolean
  onToggle: () => void
}) {
  return (
    <View className="w-full flex-row items-center border border-gray-700 bg-white/80 rounded-lg mb-4 px-2">
      <TextInput
        value={value}
        placeholder={placeholder}
        secureTextEntry={!show}
        autoCapitalize="none"
        onChangeText={onChange}
        className="flex-1 p-3 text-gray-900"
      />
      <TouchableOpacity activeOpacity={0.7} onPress={onToggle}>
        <Ionicons name={show ? 'eye-off' : 'eye'} size={22} color="#444" />
      </TouchableOpacity>
    </View>
  )
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ backgroundColor: '#4863A0' }}
      className="flex-1"
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingVertical: 40,
        }}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default function SignIn() {
  const { signIn } = useSignIn()
  const { user } = useUser()
  const router = useRouter()

  const [step, setStep] = useState<Step>('signIn')
  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const showError = (error: any) =>
    Alert.alert('Error', error?.longMessage ?? error?.message ?? 'Something went wrong')

  // Role check karke sahi jagah redirect karta hai
  const redirectByRole = async () => {
    await user?.reload()
    const role = user?.unsafeMetadata?.role as string | undefined

    console.log('Role fetched after reload:', role)

    if (!role) {
      router.replace('/(onboarding)/role-selection')
    } else if (role === 'technician') {
      router.replace('/(technician)/(tabs)')
    } else {
      router.replace('/(customer)/(tabs)')
    }
  }

 const finish = async () => {
  await signIn.finalize({
    navigate: async ({ session }) => {
      if (session?.currentTask) {
        console.log('Pending task:', session.currentTask)
        return
      }

      const role = session?.user?.unsafeMetadata?.role as string | undefined
      console.log('Role from session.user:', role)

      if (!role) {
        router.replace('/(onboarding)/role-selection')
      } else if (role === 'technician') {
        router.replace('/(technician)/(tabs)')
      } else {
        router.replace('/(customer)/(tabs)')
      }
    },
  })
}

  const onSignInPress = async () => {
    if (!signIn) return
    setLoading(true)
    try {
      const { error } = await signIn.password({ emailAddress, password })
      if (error) return showError(error)

      console.log('Sign-in status:', signIn.status)

      if (signIn.status === 'complete') {
        await finish()
      } else if (signIn.status === 'needs_client_trust') {
        await signIn.mfa.sendEmailCode()
        setCode('')
        setStep('clientTrust')
      } else {
        Alert.alert('Error', `Sign-in incomplete (${signIn.status})`)
      }
    } catch (err: any) {
      showError(err)
    } finally {
      setLoading(false)
    }
  }

  const onClientTrustVerify = async () => {
    setLoading(true)
    try {
      const { error } = await signIn.mfa.verifyEmailCode({ code })
      if (error) return showError(error)
      if (signIn.status === 'complete') await finish()
    } catch (err: any) {
      showError(err)
    } finally {
      setLoading(false)
    }
  }

  const onSendResetCode = async () => {
    if (!signIn) return
    if (!emailAddress.trim()) {
      Alert.alert('Error', 'Please enter your email')
      return
    }
    setLoading(true)
    try {
      const { error: createError } = await signIn.create({ identifier: emailAddress })
      if (createError) return showError(createError)

      const { error } = await signIn.resetPasswordEmailCode.sendCode()
      if (error) return showError(error)

      setCode('')
      setNewPassword('')
      setStep('forgotReset')
    } catch (err: any) {
      showError(err)
    } finally {
      setLoading(false)
    }
  }

  const onResetPassword = async () => {
    if (!signIn) return
    setLoading(true)
    try {
      const { error: verifyError } = await signIn.resetPasswordEmailCode.verifyCode({ code })
      if (verifyError) return showError(verifyError)

      const { error } = await signIn.resetPasswordEmailCode.submitPassword({
        password: newPassword,
      })
      if (error) return showError(error)

      if (signIn.status === 'complete') {
        await finish()
      } else {
        Alert.alert('Error', `Reset incomplete (${signIn.status})`)
      }
    } catch (err: any) {
      showError(err)
    } finally {
      setLoading(false)
    }
  }

  if (step === 'clientTrust') {
    return (
      <Screen>
        <Image
          source={require('../../assets/images/bookingap.png')}
          className="w-100 h-32 mb-4"
          resizeMode="contain"
        />
        <Text className="text-2xl font-bold mb-4 text-gray-900">Verify Email</Text>
        <Text className="text-gray-800 mb-6 text-center">We sent a code to {emailAddress}</Text>

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
          onPress={onClientTrustVerify}
          disabled={loading}
          className="w-full bg-black rounded-lg p-4 items-center"
        >
          <Text className="text-white font-bold">{loading ? 'Verifying...' : 'Verify'}</Text>
        </TouchableOpacity>
      </Screen>
    )
  }

  if (step === 'forgotEmail') {
    return (
      <Screen>
        <Image
          source={require('../../assets/images/bookingap.png')}
          className="w-32 h-32 mb-4"
          resizeMode="contain"
        />
        <Text className="text-2xl font-bold mb-2 text-gray-900">Forgot Password</Text>
        <Text className="text-gray-800 mb-6 text-center">
          Enter your email and we'll send you a reset code.
        </Text>

        <Text className="w-full text-sm font-semibold text-gray-900 mb-1">Email Address</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          value={emailAddress}
          placeholder="Enter email"
          onChangeText={setEmailAddress}
          className="w-full border border-gray-700 bg-white/80 rounded-lg p-3 mb-6 text-gray-900"
        />

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onSendResetCode}
          disabled={loading}
          className="w-full bg-black rounded-lg p-4 items-center mb-4"
        >
          <Text className="text-white font-bold">{loading ? 'Sending...' : 'Send Code'}</Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7} onPress={() => setStep('signIn')}>
          <Text className="text-black font-bold underline">Back to Sign In</Text>
        </TouchableOpacity>
      </Screen>
    )
  }

  if (step === 'forgotReset') {
    return (
      <Screen>
        <Image
          source={require('../../assets/images/bookingap.png')}
          className="w-32 h-32 mb-4"
          resizeMode="contain"
        />
        <Text className="text-2xl font-bold mb-2 text-gray-900">Reset Password</Text>
        <Text className="text-gray-800 mb-6 text-center">We sent a code to {emailAddress}</Text>

        <Text className="w-full text-sm font-semibold text-gray-900 mb-1">OTP Code</Text>
        <TextInput
          value={code}
          placeholder="Enter 6-digit code"
          keyboardType="number-pad"
          onChangeText={setCode}
          className="w-full border border-gray-700 bg-white/80 rounded-lg p-3 mb-4 text-center text-lg text-gray-900"
        />

        <Text className="w-full text-sm font-semibold text-gray-900 mb-1">New Password</Text>
        <PasswordInput
          value={newPassword}
          onChange={setNewPassword}
          placeholder="Enter new password"
          show={showPassword}
          onToggle={() => setShowPassword(!showPassword)}
        />

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onResetPassword}
          disabled={loading}
          className="w-full bg-black rounded-lg p-4 items-center mb-4"
        >
          <Text className="text-white font-bold">
            {loading ? 'Resetting...' : 'Reset Password'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7} onPress={() => setStep('signIn')}>
          <Text className="text-black font-bold underline">Back to Sign In</Text>
        </TouchableOpacity>
      </Screen>
    )
  }

  return (
    <Screen>
      <Image
        source={require('../../assets/images/bookingap.png')}
        className="w-36 h-36 mb-4"
        resizeMode="contain"
      />

      <Text className="text-2xl font-bold mb-6 text-gray-900">Sign In</Text>

      <Text className="w-full text-sm font-semibold text-gray-900 mb-1">Email Address</Text>
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        value={emailAddress}
        placeholder="Enter email"
        onChangeText={setEmailAddress}
        className="w-full border border-gray-700 bg-white/80 rounded-lg p-3 mb-4 text-gray-900"
      />

      <Text className="w-full text-sm font-semibold text-gray-900 mb-1">Password</Text>
      <PasswordInput
        value={password}
        onChange={setPassword}
        placeholder="Enter password"
        show={showPassword}
        onToggle={() => setShowPassword(!showPassword)}
      />

      <TouchableOpacity activeOpacity={0.7} className="self-end mb-6" onPress={() => setStep('forgotEmail')}>
        <Text className="text-black font-semibold underline">Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onSignInPress}
        disabled={loading}
        className="w-full bg-black rounded-lg p-4 items-center mb-4"
      >
        <Text className="text-white font-bold">{loading ? 'Signing in...' : 'Sign In'}</Text>
      </TouchableOpacity>

      <View className="flex-row">
        <Text className="text-gray-900">Don't have an account? </Text>
        <Link href="/sign-up">
          <Text className="text-black font-bold underline">Sign Up</Text>
        </Link>
      </View>
    </Screen>
  )
}