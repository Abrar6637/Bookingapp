import { useSignIn } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import { Link, useRouter } from 'expo-router'
import React, { useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

type Step = 'signIn' | 'clientTrust' | 'forgotEmail' | 'forgotReset'

// ---------- Components defined OUTSIDE SignIn (keyboard fix) ----------

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
    <View className="w-full flex-row items-center border border-gray-300 rounded-lg mb-4 px-2">
      <TextInput
        value={value}
        placeholder={placeholder}
        secureTextEntry={!show}
        autoCapitalize="none"
        onChangeText={onChange}
        className="flex-1 p-3"
      />
      <TouchableOpacity onPress={onToggle}>
        <Ionicons name={show ? 'eye-off' : 'eye'} size={22} color="#666" />
      </TouchableOpacity>
    </View>
  )
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
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

// ---------- Main screen ----------

export default function SignIn() {
  const { signIn } = useSignIn()
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

  const finish = async () => {
    await signIn.finalize({
      navigate: ({ session }) => {
        if (session?.currentTask) {
          console.log('Pending task:', session.currentTask)
          return
        }
        router.replace('/(root)/tabs')
      },
    })
  }

  // ---------- Normal sign in ----------
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
        // New device: Clerk asks for an email code
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

  // ---------- Forgot password ----------
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

  // ---------- Screens ----------

  // Client trust: email code on a new device
  if (step === 'clientTrust') {
    return (
      <Screen>
        <Text className="text-2xl font-bold mb-4">Verify Email</Text>
        <Text className="text-gray-500 mb-6 text-center">We sent a code to {emailAddress}</Text>

        <Text className="w-full text-sm font-semibold text-gray-700 mb-1">OTP Code</Text>
        <TextInput
          value={code}
          placeholder="Enter 6-digit code"
          keyboardType="number-pad"
          onChangeText={setCode}
          className="w-full border border-gray-300 rounded-lg p-3 mb-6 text-center text-lg"
        />
        <TouchableOpacity
          onPress={onClientTrustVerify}
          disabled={loading}
          className="w-full bg-black rounded-lg p-4 items-center"
        >
          <Text className="text-white font-bold">{loading ? 'Verifying...' : 'Verify'}</Text>
        </TouchableOpacity>
      </Screen>
    )
  }

  // Forgot password - step 1: email
  if (step === 'forgotEmail') {
    return (
      <Screen>
        <Text className="text-2xl font-bold mb-2">Forgot Password</Text>
        <Text className="text-gray-500 mb-6 text-center">
          Enter your email and we'll send you a reset code.
        </Text>

        <Text className="w-full text-sm font-semibold text-gray-700 mb-1">Email Address</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          value={emailAddress}
          placeholder="Enter email"
          onChangeText={setEmailAddress}
          className="w-full border border-gray-300 rounded-lg p-3 mb-6"
        />

        <TouchableOpacity
          onPress={onSendResetCode}
          disabled={loading}
          className="w-full bg-black rounded-lg p-4 items-center mb-4"
        >
          <Text className="text-white font-bold">{loading ? 'Sending...' : 'Send Code'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setStep('signIn')}>
          <Text className="text-blue-600 font-bold">Back to Sign In</Text>
        </TouchableOpacity>
      </Screen>
    )
  }

  // Forgot password - step 2: code + new password
  if (step === 'forgotReset') {
    return (
      <Screen>
        <Text className="text-2xl font-bold mb-2">Reset Password</Text>
        <Text className="text-gray-500 mb-6 text-center">We sent a code to {emailAddress}</Text>

        <Text className="w-full text-sm font-semibold text-gray-700 mb-1">OTP Code</Text>
        <TextInput
          value={code}
          placeholder="Enter 6-digit code"
          keyboardType="number-pad"
          onChangeText={setCode}
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 text-center text-lg"
        />

        <Text className="w-full text-sm font-semibold text-gray-700 mb-1">New Password</Text>
        <PasswordInput
          value={newPassword}
          onChange={setNewPassword}
          placeholder="Enter new password"
          show={showPassword}
          onToggle={() => setShowPassword(!showPassword)}
        />

        <TouchableOpacity
          onPress={onResetPassword}
          disabled={loading}
          className="w-full bg-black rounded-lg p-4 items-center mb-4"
        >
          <Text className="text-white font-bold">
            {loading ? 'Resetting...' : 'Reset Password'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setStep('signIn')}>
          <Text className="text-blue-600 font-bold">Back to Sign In</Text>
        </TouchableOpacity>
      </Screen>
    )
  }

  // Main sign-in form
  return (
    <Screen>
      <Text className="text-2xl font-bold mb-8">Sign In</Text>

      <Text className="w-full text-sm font-semibold text-gray-700 mb-1">Email Address</Text>
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        value={emailAddress}
        placeholder="Enter email"
        onChangeText={setEmailAddress}
        className="w-full border border-gray-300 rounded-lg p-3 mb-4"
      />

      <Text className="w-full text-sm font-semibold text-gray-700 mb-1">Password</Text>
      <PasswordInput
        value={password}
        onChange={setPassword}
        placeholder="Enter password"
        show={showPassword}
        onToggle={() => setShowPassword(!showPassword)}
      />

      <TouchableOpacity className="self-end mb-6" onPress={() => setStep('forgotEmail')}>
        <Text className="text-blue-600 font-semibold">Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onSignInPress}
        disabled={loading}
        className="w-full bg-black rounded-lg p-4 items-center mb-4"
      >
        <Text className="text-white font-bold">{loading ? 'Signing in...' : 'Sign In'}</Text>
      </TouchableOpacity>

      <View className="flex-row">
        <Text>Don't have an account? </Text>
        <Link href="/sign-up">
          <Text className="text-blue-600 font-bold">Sign Up</Text>
        </Link>
      </View>
    </Screen>
  )
}