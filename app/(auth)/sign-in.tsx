import { useSignIn, useUser } from '@clerk/expo'
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

/* -------------------------------------------------------
   Reusable Password Input
------------------------------------------------------- */
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
    <View className="w-full flex-row items-center border border-gray-200 bg-white rounded-full px-4 mb-5">
      <Ionicons
        name="lock-closed-outline"
        size={18}
        color="#9CA3AF"
      />

      <TextInput
        value={value}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        secureTextEntry={!show}
        autoCapitalize="none"
        onChangeText={onChange}
        className="flex-1 py-4 ml-2 text-gray-900"
      />

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onToggle}
      >
        <Ionicons
          name={show ? 'eye-off-outline' : 'eye-outline'}
          size={20}
          color="#6B7280"
        />
      </TouchableOpacity>
    </View>
  )
}

/* -------------------------------------------------------
   Shared Auth Screen Design
------------------------------------------------------- */
function AuthScreen({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#FFF8E8]"
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1">

          {/* Yellow Header */}
          <View className="bg-[#FFC342] h-72 rounded-b-[40px] px-6 pt-16">
            <View className="items-center">
              <Text className="text-4xl font-extrabold text-gray-950">
                {title}
              </Text>

              <Text className="text-base text-gray-900 mt-1">
                {subtitle}
              </Text>
            </View>
          </View>

          {/* Content overlaps yellow header */}
          <View className="px-6 -mt-32 pb-10">
            {children}
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

/* -------------------------------------------------------
   White Card
------------------------------------------------------- */
function Card({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <View
      className="bg-white rounded-[28px] px-5 py-7"
      style={{
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 5,
        },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 6,
      }}
    >
      {children}
    </View>
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
    Alert.alert(
      'Error',
      error?.longMessage ??
        error?.message ??
        'Something went wrong'
    )

  /* -------------------------------------------------------
     Role Redirect
  ------------------------------------------------------- */
  const redirectByRole = async () => {
    await user?.reload()

    const role =
      user?.unsafeMetadata?.role as string | undefined

    console.log('Role fetched after reload:', role)

    if (!role) {
      router.replace('/(onboarding)/role-selection')
    } else if (role === 'technician') {
      router.replace('/(technician)/(tabs)')
    } else {
      router.replace('/(customer)/(tabs)')
    }
  }

  /* -------------------------------------------------------
     Finish Clerk Sign In
  ------------------------------------------------------- */
  const finish = async () => {
    await signIn.finalize({
      navigate: async ({ session }) => {
        if (session?.currentTask) {
          console.log(
            'Pending task:',
            session.currentTask
          )
          return
        }

        const role =
          session?.user?.unsafeMetadata?.role as
            | string
            | undefined

        console.log(
          'Role from session.user:',
          role
        )

        if (!role) {
          router.replace(
            '/(onboarding)/role-selection'
          )
        } else if (role === 'technician') {
          router.replace(
            '/(technician)/(tabs)'
          )
        } else {
          router.replace(
            '/(customer)/(tabs)'
          )
        }
      },
    })
  }

  /* -------------------------------------------------------
     Sign In
  ------------------------------------------------------- */
  const onSignInPress = async () => {
    if (!signIn) return

    setLoading(true)

    try {
      const { error } = await signIn.password({
        emailAddress,
        password,
      })

      if (error) return showError(error)

      console.log(
        'Sign-in status:',
        signIn.status
      )

      if (signIn.status === 'complete') {
        await finish()
      } else if (
        signIn.status === 'needs_client_trust'
      ) {
        await signIn.mfa.sendEmailCode()

        setCode('')
        setStep('clientTrust')
      } else {
        Alert.alert(
          'Error',
          `Sign-in incomplete (${signIn.status})`
        )
      }
    } catch (err: any) {
      showError(err)
    } finally {
      setLoading(false)
    }
  }

  /* -------------------------------------------------------
     Client Trust OTP
  ------------------------------------------------------- */
  const onClientTrustVerify = async () => {
    setLoading(true)

    try {
      const { error } =
        await signIn.mfa.verifyEmailCode({
          code,
        })

      if (error) return showError(error)

      if (signIn.status === 'complete') {
        await finish()
      }
    } catch (err: any) {
      showError(err)
    } finally {
      setLoading(false)
    }
  }

  /* -------------------------------------------------------
     Send Forgot Password Code
  ------------------------------------------------------- */
  const onSendResetCode = async () => {
    if (!signIn) return

    if (!emailAddress.trim()) {
      Alert.alert(
        'Error',
        'Please enter your email'
      )
      return
    }

    setLoading(true)

    try {
      const { error: createError } =
        await signIn.create({
          identifier: emailAddress,
        })

      if (createError) {
        return showError(createError)
      }

      const { error } =
        await signIn.resetPasswordEmailCode.sendCode()

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

  /* -------------------------------------------------------
     Reset Password
  ------------------------------------------------------- */
  const onResetPassword = async () => {
    if (!signIn) return

    setLoading(true)

    try {
      const { error: verifyError } =
        await signIn.resetPasswordEmailCode.verifyCode({
          code,
        })

      if (verifyError) {
        return showError(verifyError)
      }

      const { error } =
        await signIn.resetPasswordEmailCode.submitPassword({
          password: newPassword,
        })

      if (error) return showError(error)

      if (signIn.status === 'complete') {
        await finish()
      } else {
        Alert.alert(
          'Error',
          `Reset incomplete (${signIn.status})`
        )
      }
    } catch (err: any) {
      showError(err)
    } finally {
      setLoading(false)
    }
  }

  /* =======================================================
     CLIENT TRUST / OTP SCREEN
  ======================================================= */
 if (step === 'clientTrust') {
  return (
    <AuthScreen
      title="Verification"
      subtitle="Secure Your Account"
    >
      <Card>
        {/* Icon */}
        <View className="items-center">
          <View className="w-20 h-20 rounded-full bg-[#FFF3D2] items-center justify-center mb-5">
            <View className="w-14 h-14 rounded-full bg-[#FFC342] items-center justify-center">
              <Ionicons
                name="shield-checkmark-outline"
                size={30}
                color="#111827"
              />
            </View>
          </View>

          {/* Heading */}
          <Text className="text-2xl font-extrabold text-gray-950">
            Verify Your Email
          </Text>

          <Text className="text-sm text-gray-400 text-center mt-2 px-3 leading-5">
            We've sent a 6-digit verification code to
          </Text>

          <Text
            className="text-sm font-bold text-gray-900 mt-1 mb-7"
            numberOfLines={1}
          >
            {emailAddress}
          </Text>
        </View>

        {/* OTP Label */}
        <Text className="text-sm font-bold text-gray-900 mb-2">
          Verification Code
        </Text>

        {/* OTP Input */}
        <View className="flex-row items-center border border-gray-200 rounded-full px-4 mb-3 bg-white">
          <Ionicons
            name="keypad-outline"
            size={20}
            color="#9CA3AF"
          />

          <TextInput
            value={code}
            placeholder="Enter 6-digit code"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            maxLength={6}
            onChangeText={setCode}
            className="flex-1 py-4 ml-2 text-center text-xl font-bold tracking-[6px] text-gray-950"
          />
        </View>

        {/* Helper */}
        <View className="flex-row justify-center items-center mb-7">
          <Ionicons
            name="time-outline"
            size={15}
            color="#9CA3AF"
          />

          <Text className="text-xs text-gray-400 ml-1">
            Enter the code sent to your email
          </Text>
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onClientTrustVerify}
          disabled={loading || code.length !== 6}
          className={`w-full rounded-full py-4 items-center ${
            loading || code.length !== 6
              ? 'bg-[#FFE09A]'
              : 'bg-[#FFC342]'
          }`}
        >
          <View className="flex-row items-center">
            <Text className="text-gray-950 font-extrabold text-base">
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </Text>

            {!loading && (
              <Ionicons
                name="arrow-forward"
                size={19}
                color="#111827"
                style={{ marginLeft: 8 }}
              />
            )}
          </View>
        </TouchableOpacity>

        {/* Back */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            setCode('')
            setStep('signIn')
          }}
          disabled={loading}
          className="mt-5 items-center"
        >
          <View className="flex-row items-center">
            <Ionicons
              name="arrow-back-outline"
              size={16}
              color="#374151"
            />

            <Text className="text-gray-700 font-semibold text-sm ml-1">
              Back to Sign In
            </Text>
          </View>
        </TouchableOpacity>
      </Card>
    </AuthScreen>
  )
}

  /* =======================================================
     FORGOT PASSWORD - EMAIL SCREEN
  ======================================================= */
  if (step === 'forgotEmail') {
    return (
      <AuthScreen
        title="Forgot?"
        subtitle="Reset Your Password"
      >
        <Card>

          <View className="items-center mb-7">
            <View className="w-16 h-16 rounded-full bg-[#FFF3D2] items-center justify-center mb-4">
              <Ionicons
                name="key-outline"
                size={30}
                color="#F5A800"
              />
            </View>

            <Text className="text-xl font-extrabold text-gray-950">
              Forgot Password
            </Text>

            <Text className="text-xs text-gray-400 text-center mt-2 px-4">
              Enter your email and we'll send you
              a reset code.
            </Text>
          </View>

          <Text className="text-sm font-bold text-gray-900 mb-2">
            Email Address
          </Text>

          <View className="flex-row items-center border border-gray-200 rounded-full px-4 mb-6">
            <Ionicons
              name="mail-outline"
              size={18}
              color="#9CA3AF"
            />

            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              value={emailAddress}
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              onChangeText={setEmailAddress}
              className="flex-1 py-4 ml-2 text-gray-900"
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onSendResetCode}
            disabled={loading}
            className={`w-full rounded-full py-4 items-center ${
              loading
                ? 'bg-[#FFD56A]'
                : 'bg-[#FFC342]'
            }`}
          >
            <Text className="text-gray-950 font-extrabold text-base">
              {loading
                ? 'Sending...'
                : 'Send Code'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setStep('signIn')}
            className="items-center mt-5"
          >
            <Text className="text-gray-700 text-sm">
              Back to{' '}
              <Text className="font-extrabold text-gray-950">
                Sign In
              </Text>
            </Text>
          </TouchableOpacity>

        </Card>
      </AuthScreen>
    )
  }

  /* =======================================================
     RESET PASSWORD SCREEN
  ======================================================= */
  if (step === 'forgotReset') {
    return (
      <AuthScreen
        title="Reset"
        subtitle="Create New Password"
      >
        <Card>

          <View className="items-center mb-7">
            <View className="w-16 h-16 rounded-full bg-[#FFF3D2] items-center justify-center mb-4">
              <Ionicons
                name="lock-closed-outline"
                size={30}
                color="#F5A800"
              />
            </View>

            <Text className="text-xl font-extrabold text-gray-950">
              Reset Password
            </Text>

            <Text className="text-xs text-gray-400 text-center mt-2 px-4">
              We sent a verification code to
            </Text>

            <Text className="text-sm font-bold text-gray-800 mt-1">
              {emailAddress}
            </Text>
          </View>

          <Text className="text-sm font-bold text-gray-900 mb-2">
            OTP Code
          </Text>

          <TextInput
            value={code}
            placeholder="Enter 6-digit code"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            onChangeText={setCode}
            className="w-full border border-gray-200 rounded-full px-4 py-4 mb-5 text-center text-lg text-gray-900"
          />

          <Text className="text-sm font-bold text-gray-900 mb-2">
            New Password
          </Text>

          <PasswordInput
            value={newPassword}
            onChange={setNewPassword}
            placeholder="Enter new password"
            show={showPassword}
            onToggle={() =>
              setShowPassword(!showPassword)
            }
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onResetPassword}
            disabled={loading}
            className={`w-full rounded-full py-4 items-center ${
              loading
                ? 'bg-[#FFD56A]'
                : 'bg-[#FFC342]'
            }`}
          >
            <Text className="text-gray-950 font-extrabold text-base">
              {loading
                ? 'Resetting...'
                : 'Reset Password'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setStep('signIn')}
            className="items-center mt-5"
          >
            <Text className="text-gray-700 text-sm">
              Back to{' '}
              <Text className="font-extrabold text-gray-950">
                Sign In
              </Text>
            </Text>
          </TouchableOpacity>

        </Card>
      </AuthScreen>
    )
  }

  /* =======================================================
     MAIN SIGN IN SCREEN
  ======================================================= */
  return (
    <AuthScreen
      title="Hello"
      subtitle="Welcome Back!"
    >
      <Card>

        <Text className="text-xl font-extrabold text-center text-gray-950">
          Login Account
        </Text>

        <Text className="text-xs text-gray-400 text-center mt-1 mb-7 px-4">
          Please enter your email and password to
          access your account
        </Text>

        {/* Email */}
        <Text className="text-sm font-bold text-gray-900 mb-2">
          Email Address
        </Text>

        <View className="flex-row items-center border border-gray-200 rounded-full px-4 mb-5">
          <Ionicons
            name="mail-outline"
            size={18}
            color="#9CA3AF"
          />

          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            value={emailAddress}
            placeholder="Enter your email"
            placeholderTextColor="#9CA3AF"
            onChangeText={setEmailAddress}
            className="flex-1 py-4 ml-2 text-gray-900"
          />
        </View>

        {/* Password */}
        <Text className="text-sm font-bold text-gray-900 mb-2">
          Password
        </Text>

        <PasswordInput
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          show={showPassword}
          onToggle={() =>
            setShowPassword(!showPassword)
          }
        />

        {/* Forgot Password */}
        <TouchableOpacity
          activeOpacity={0.7}
          className="self-end mb-6"
          onPress={() =>
            setStep('forgotEmail')
          }
        >
          <Text className="text-gray-700 text-sm font-semibold">
            Forgot Password?
          </Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onSignInPress}
          disabled={loading}
          className={`w-full rounded-full py-4 items-center ${
            loading
              ? 'bg-[#FFD56A]'
              : 'bg-[#FFC342]'
          }`}
        >
          <Text className="text-gray-950 font-extrabold text-base">
            {loading
              ? 'Signing in...'
              : 'Login Account'}
          </Text>
        </TouchableOpacity>

        {/* Create Account */}
        <View className="flex-row justify-center mt-5">
          <Text className="text-gray-600 text-sm">
            Don't have an account?{' '}
          </Text>

          <Link href="/sign-up">
            <Text className="text-gray-950 font-extrabold text-sm">
              Create Account
            </Text>
          </Link>
        </View>

      </Card>
    </AuthScreen>
  )
}