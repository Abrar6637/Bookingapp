import { useAuth, useClerk, useSignUp } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
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

  // =====================================================
  // STEP 1: CREATE ACCOUNT + SEND OTP
  // =====================================================

  const onSignUpPress = async () => {
    if (!isLoaded || !signUp) return

    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name')
      return
    }

    if (!identifier.trim()) {
      Alert.alert(
        'Error',
        'Please enter your email or phone number'
      )
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
      Alert.alert(
        'Error',
        err.errors?.[0]?.message ||
          err.message ||
          'Something went wrong'
      )
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // STEP 2: VERIFY OTP
  // =====================================================

  const onVerifyPress = async () => {
    if (!isLoaded || !signUp || loading) return

    setLoading(true)

    try {
      if (isEmail) {
        await signUp.verifications.verifyEmailCode({
          code,
        })
      } else {
        await signUp.verifications.verifyPhoneCode({
          code,
        })
      }

      if (signUp.createdSessionId) {
        await setActive({
          session: signUp.createdSessionId,
        })

        router.replace('/(onboarding)/role-selection')
      }
    } catch (err: any) {
      Alert.alert(
        'Error',
        err.errors?.[0]?.message ||
          err.message ||
          'Invalid code'
      )
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // OTP VERIFICATION SCREEN
  // =====================================================

  if (pendingVerification) {
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

            {/* Yellow Top Background */}
            <View className="bg-[#FFC342] h-72 rounded-b-[40px] px-6 pt-16">
              <View className="items-center">
                <Text className="text-4xl font-extrabold text-gray-950">
                  Verification
                </Text>

                <Text className="text-base text-gray-900 mt-1">
                  Secure Your Account
                </Text>
              </View>
            </View>

            {/* Floating Card Wrapper */}
            <View className="px-6 -mt-32 pb-10">

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

                {/* Verification Icon */}
                <View className="items-center">

                  <View className="w-20 h-20 rounded-full bg-[#FFF3D2] items-center justify-center mb-5">
                    <View className="w-14 h-14 rounded-full bg-[#FFC342] items-center justify-center">

                      <Ionicons
                        name={
                          isEmail
                            ? 'mail-outline'
                            : 'phone-portrait-outline'
                        }
                        size={29}
                        color="#111827"
                      />

                    </View>
                  </View>

                  {/* Heading */}
                  <Text className="text-2xl font-extrabold text-gray-950 text-center">
                    Verify Your {isEmail ? 'Email' : 'Phone'}
                  </Text>

                  <Text className="text-sm text-gray-400 text-center mt-2 px-3 leading-5">
                    We've sent a 6-digit verification code to
                  </Text>

                  {/* Email / Phone */}
                  <Text
                    className="text-sm font-bold text-gray-900 mt-1 mb-7"
                    numberOfLines={1}
                  >
                    {identifier}
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

                {/* Helper Text */}
                <View className="flex-row justify-center items-center mb-7">

                  <Ionicons
                    name="time-outline"
                    size={15}
                    color="#9CA3AF"
                  />

                  <Text className="text-xs text-gray-400 ml-1">
                    Enter the code sent to your{' '}
                    {isEmail ? 'email' : 'phone'}
                  </Text>

                </View>

                {/* Verify Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={onVerifyPress}
                  disabled={loading || code.length !== 6}
                  className={`w-full rounded-full py-4 items-center ${
                    loading || code.length !== 6
                      ? 'bg-[#FFE09A]'
                      : 'bg-[#FFC342]'
                  }`}
                >
                  <View className="flex-row items-center">

                    <Text className="text-gray-950 font-extrabold text-base">
                      {loading
                        ? 'Verifying...'
                        : 'Verify & Continue'}
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

                {/* Back to Sign Up */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  disabled={loading}
                  onPress={() => {
                    setCode('')
                    setPendingVerification(false)
                  }}
                  className="mt-5 items-center"
                >
                  <View className="flex-row items-center">

                    <Ionicons
                      name="arrow-back-outline"
                      size={16}
                      color="#374151"
                    />

                    <Text className="text-gray-700 font-semibold text-sm ml-1">
                      Back to Sign Up
                    </Text>

                  </View>
                </TouchableOpacity>

              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }

  // =====================================================
  // SIGN UP SCREEN
  // =====================================================

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#FFF8E8]"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        className="bg-[#FFF8E8]"
      >
        <View className="flex-1">

          {/* Yellow Top Background */}
          <View className="bg-[#FFC342] h-72 rounded-b-[40px] px-6 pt-16">

            <View className="items-center">

              <Text className="text-4xl font-extrabold text-gray-950">
                Join Us
              </Text>

              <Text className="text-base text-gray-900 mt-1">
                Create Free Account
              </Text>

            </View>
          </View>

          {/* Form Wrapper */}
          <View className="px-6 -mt-32 pb-10">

            {/* White Form Card */}
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

              {/* Heading */}
              <Text className="text-xl font-extrabold text-center text-gray-950">
                Personal Info
              </Text>

              <Text className="text-xs text-gray-400 text-center mt-1 mb-7 px-4">
                Please enter your personal information to
                create your account
              </Text>

              {/* Full Name */}
              <Text className="text-sm font-bold text-gray-900 mb-2">
                Your Name
              </Text>

              <View className="flex-row items-center border border-gray-200 rounded-full px-4 mb-5 bg-white">

                <Ionicons
                  name="person-outline"
                  size={18}
                  color="#9CA3AF"
                />

                <TextInput
                  value={fullName}
                  placeholder="Enter full name"
                  placeholderTextColor="#9CA3AF"
                  onChangeText={setFullName}
                  className="flex-1 py-4 ml-2 text-gray-900"
                />

              </View>

              {/* Email / Phone */}
              <Text className="text-sm font-bold text-gray-900 mb-2">
                Email Address / Phone
              </Text>

              <View className="flex-row items-center border border-gray-200 rounded-full px-4 mb-5 bg-white">

                <Ionicons
                  name="mail-outline"
                  size={18}
                  color="#9CA3AF"
                />

                <TextInput
                  autoCapitalize="none"
                  placeholder="Email or phone (+923...)"
                  placeholderTextColor="#9CA3AF"
                  value={identifier}
                  onChangeText={setIdentifier}
                  className="flex-1 py-4 ml-2 text-gray-900"
                />

              </View>

              {/* Password */}
              <Text className="text-sm font-bold text-gray-900 mb-2">
                Password
              </Text>

              <View className="flex-row items-center border border-gray-200 rounded-full px-4 mb-7 bg-white">

                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color="#9CA3AF"
                />

                <TextInput
                  value={password}
                  placeholder="Enter password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  onChangeText={setPassword}
                  className="flex-1 py-4 ml-2 text-gray-900"
                />

                {/* Show / Hide Password */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  <Ionicons
                    name={
                      showPassword
                        ? 'eye-off-outline'
                        : 'eye-outline'
                    }
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>

              </View>

              {/* Create Account Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onSignUpPress}
                disabled={loading}
                className={`w-full rounded-full py-4 items-center ${
                  loading
                    ? 'bg-[#FFD56A]'
                    : 'bg-[#FFC342]'
                }`}
              >
                <View className="flex-row items-center">

                  <Text className="text-gray-950 font-extrabold text-base">
                    {loading
                      ? 'Creating...'
                      : 'Save & Continue'}
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

              {/* Sign In Link */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  router.push('/sign-in')
                }
                className="items-center mt-5"
              >
                <Text className="text-gray-700 text-sm">
                  Already have an account?{' '}

                  <Text className="font-extrabold text-gray-950">
                    Sign In
                  </Text>
                </Text>
              </TouchableOpacity>

            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}