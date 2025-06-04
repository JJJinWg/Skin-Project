// 로그인 화면

import { useState, useRef } from "react"
import { type NavigationProp, useNavigation } from "@react-navigation/native"
import type { RootStackParamList } from "../types/navigation"
import { useLoginMutation } from '../store/api'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  useColorScheme,
  ActivityIndicator,
} from "react-native"
import { Svg, Path } from "react-native-svg"

const { width } = Dimensions.get("window")

const LoginForm = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Login'>>()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  // RTK Query 로그인 훅 사용
  const [login, { isLoading }] = useLoginMutation()

  const colorScheme = useColorScheme()
  const isDarkMode = colorScheme === "dark"

  // Animated values for input labels
  const emailLabelPosition = useRef(new Animated.Value(email ? -25 : 0)).current
  const emailLabelSize = useRef(new Animated.Value(email ? 12 : 16)).current
  const passwordLabelPosition = useRef(new Animated.Value(password ? -25 : 0)).current
  const passwordLabelSize = useRef(new Animated.Value(password ? 12 : 16)).current

  // Animation functions
  const animateEmailLabel = (focused: boolean) => {
    Animated.parallel([
      Animated.timing(emailLabelPosition, {
        toValue: focused || email ? -25 : 0,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(emailLabelSize, {
        toValue: focused || email ? 12 : 16,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start()
    setEmailFocused(focused)
  }

  const animatePasswordLabel = (focused: boolean) => {
    Animated.parallel([
      Animated.timing(passwordLabelPosition, {
        toValue: focused || password ? -25 : 0,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(passwordLabelSize, {
        toValue: focused || password ? 12 : 16,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start()
    setPasswordFocused(focused)
  }

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("알림", "이메일과 비밀번호를 입력해주세요.")
      return
    }
    
    try {
      await login({ email, password }).unwrap()
      // 로그인 성공 시 자동으로 네비게이션됨 (StackNavigator에서 인증 상태 확인)
    } catch (error) {
      console.error('Login error:', error)
      Alert.alert("로그인 실패", "이메일과 비밀번호를 확인해주세요.")
    }
  }

  const handleBiometricLogin = () => {
    // 생체 인증 로직 구현
    console.log("생체 인증 시도")
  }

  const handleFindId = () => {
    navigation.navigate('FindIdScreen');
  }

  const handleFindPassword = () => {
    navigation.navigate('FindPasswordScreen');
  }

  // 색상 테마 설정
  const colors = {
    background: isDarkMode ? "#121212" : "#FFFFFF",
    card: isDarkMode ? "#1E1E1E" : "#FFFFFF",
    primary: "#FF5A5F", // 로그인 버튼 색상
    text: isDarkMode ? "#FFFFFF" : "#333333",
    textSecondary: isDarkMode ? "#AAAAAA" : "#666666",
    border: isDarkMode ? "#333333" : "#EEEEEE",
    inputBg: isDarkMode ? "#2A2A2A" : "#F8F8F8",
    placeholder: isDarkMode ? "#777777" : "#999999",
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          {/* 상단 웨이브 디자인 */}
          <View style={styles.waveContainer}>
            <Svg height="150" width={width} viewBox={`0 0 ${width} 150`}>
              <Path
                d={`M0 0L${width} 0L${width} 100C${width * 0.75} 130 ${width * 0.25} 80 0 100L0 0Z`}
                fill={colors.primary}
              />
            </Svg>
            <View style={styles.logoContainer}>
              <View style={[styles.logo, { backgroundColor: "#FFFFFF" }]}>
                <Text style={styles.logoText}>A</Text>
              </View>
            </View>
          </View>

          <View style={[styles.formContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.title, { color: colors.text }]}>로그인</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>계정에 로그인하여 시작하세요</Text>

            {/* 이메일 입력 필드 */}
            <View style={styles.inputWrapper}>
              <Animated.Text
                style={[
                  styles.floatingLabel,
                  {
                    top: emailLabelPosition,
                    fontSize: emailLabelSize,
                    color: emailFocused ? colors.primary : colors.textSecondary,
                  },
                ]}
              >
                이메일
              </Animated.Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: emailFocused ? colors.primary : colors.border,
                    backgroundColor: colors.inputBg,
                    color: colors.text,
                  },
                ]}
                value={email}
                onChangeText={setEmail}
                onFocus={() => animateEmailLabel(true)}
                onBlur={() => animateEmailLabel(false)}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.placeholder}
              />
            </View>

            {/* 비밀번호 입력 필드 */}
            <View style={styles.inputWrapper}>
              <Animated.Text
                style={[
                  styles.floatingLabel,
                  {
                    top: passwordLabelPosition,
                    fontSize: passwordLabelSize,
                    color: passwordFocused ? colors.primary : colors.textSecondary,
                  },
                ]}
              >
                비밀번호
              </Animated.Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: passwordFocused ? colors.primary : colors.border,
                    backgroundColor: colors.inputBg,
                    color: colors.text,
                  },
                ]}
                value={password}
                onChangeText={setPassword}
                onFocus={() => animatePasswordLabel(true)}
                onBlur={() => animatePasswordLabel(false)}
                secureTextEntry={!isPasswordVisible}
                placeholderTextColor={colors.placeholder}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                <Text style={{ color: colors.textSecondary }}>{isPasswordVisible ? "숨김" : "표시"}</Text>
              </TouchableOpacity>
            </View>

            {/* 계정 찾기 링크 */}
            <View style={styles.accountRecoveryContainer}>
              <TouchableOpacity onPress={handleFindId}>
                <Text style={[styles.accountRecoveryText, { color: colors.primary }]}>아이디 찾기</Text>
              </TouchableOpacity>
              <Text style={[styles.accountRecoverySeparator, { color: colors.textSecondary }]}>|</Text>
              <TouchableOpacity onPress={handleFindPassword}>
                <Text style={[styles.accountRecoveryText, { color: colors.primary }]}>비밀번호 찾기</Text>
              </TouchableOpacity>
            </View>

            {/* 로그인 버튼 */}
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: colors.primary }]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>로그인</Text>
              )}
            </TouchableOpacity>

            {/* 생체 인증 버튼 */}
            <TouchableOpacity
              style={[styles.biometricButton, { borderColor: colors.border }]}
              onPress={handleBiometricLogin}
            >
              <Text style={[styles.biometricButtonText, { color: colors.text }]}>생체 인증으로 로그인</Text>
            </TouchableOpacity>

            {/* 소셜 로그인 섹션 */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textSecondary }]}>소셜 계정으로 로그인</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* <View style={styles.socialButtonsContainer}>
              <TouchableOpacity style={[styles.socialButton, { backgroundColor: "#4285F4" }]}>
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialButton, { backgroundColor: "#000000" }]}>
                <Text style={styles.socialButtonText}>Apple</Text>
              </TouchableOpacity>
            </View> */}

            {/* 회원가입 링크 */}
            <View style={styles.signupContainer}>
              <Text style={[styles.signupText, { color: colors.textSecondary }]}>계정이 없으신가요?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={[styles.signupLink, { color: colors.primary }]}> 회원가입</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
  waveContainer: {
    height: 150,
    width: "100%",
    position: "relative",
  },
  logoContainer: {
    position: "absolute",
    top: 70,
    alignSelf: "center",
    zIndex: 10,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  logoText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FF5A5F",
  },
  formContainer: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: "center",
  },
  inputWrapper: {
    marginBottom: 24,
    position: "relative",
  },
  floatingLabel: {
    position: "absolute",
    left: 16,
    zIndex: 1,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    paddingTop: 16,
  },
  eyeButton: {
    position: "absolute",
    right: 16,
    top: 18,
  },
  accountRecoveryContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 24,
  },
  accountRecoveryText: {
    fontSize: 14,
  },
  accountRecoverySeparator: {
    marginHorizontal: 8,
    fontSize: 14,
  },
  loginButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  biometricButton: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  biometricButtonText: {
    fontSize: 16,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  socialButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },
  socialButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  signupText: {
    fontSize: 14,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: "600",
  },
})

export default LoginForm