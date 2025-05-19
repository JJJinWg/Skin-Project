//비밀번호 찾기 화면
// 컨트롤-f 테스트 검색

import { useState, useRef } from "react"
import { type NavigationProp, useNavigation } from "@react-navigation/native"
import type { RootStackParamList } from "../types/navigation"
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
  ScrollView,
} from "react-native"
import { Svg, Path } from "react-native-svg"

const { width } = Dimensions.get("window")

// 비밀번호 찾기 단계
enum FindPasswordStep {
  ENTER_INFO = 0,
  VERIFY_CODE = 1,
  RESET_PASSWORD = 2,
  COMPLETE = 3,
}

const FindPasswordScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [currentStep, setCurrentStep] = useState<FindPasswordStep>(FindPasswordStep.ENTER_INFO)
  const [isLoading, setIsLoading] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [phoneFocused, setPhoneFocused] = useState(false)
  const [codeFocused, setCodeFocused] = useState(false)
  const [newPasswordFocused, setNewPasswordFocused] = useState(false)
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [timeLeft, setTimeLeft] = useState(180) // 3분 타이머
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const colorScheme = useColorScheme()
  const isDarkMode = colorScheme === "dark"

  // Animated values for input labels
  const emailLabelPosition = useRef(new Animated.Value(email ? -25 : 0)).current
  const emailLabelSize = useRef(new Animated.Value(email ? 12 : 16)).current
  const phoneLabelPosition = useRef(new Animated.Value(phone ? -25 : 0)).current
  const phoneLabelSize = useRef(new Animated.Value(phone ? 12 : 16)).current
  const codeLabelPosition = useRef(new Animated.Value(verificationCode ? -25 : 0)).current
  const codeLabelSize = useRef(new Animated.Value(verificationCode ? 12 : 16)).current
  const newPasswordLabelPosition = useRef(new Animated.Value(newPassword ? -25 : 0)).current
  const newPasswordLabelSize = useRef(new Animated.Value(newPassword ? 12 : 16)).current
  const confirmPasswordLabelPosition = useRef(new Animated.Value(confirmPassword ? -25 : 0)).current
  const confirmPasswordLabelSize = useRef(new Animated.Value(confirmPassword ? 12 : 16)).current

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

  const animatePhoneLabel = (focused: boolean) => {
    Animated.parallel([
      Animated.timing(phoneLabelPosition, {
        toValue: focused || phone ? -25 : 0,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(phoneLabelSize, {
        toValue: focused || phone ? 12 : 16,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start()
    setPhoneFocused(focused)
  }

  const animateCodeLabel = (focused: boolean) => {
    Animated.parallel([
      Animated.timing(codeLabelPosition, {
        toValue: focused || verificationCode ? -25 : 0,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(codeLabelSize, {
        toValue: focused || verificationCode ? 12 : 16,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start()
    setCodeFocused(focused)
  }

  const animateNewPasswordLabel = (focused: boolean) => {
    Animated.parallel([
      Animated.timing(newPasswordLabelPosition, {
        toValue: focused || newPassword ? -25 : 0,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(newPasswordLabelSize, {
        toValue: focused || newPassword ? 12 : 16,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start()
    setNewPasswordFocused(focused)
  }

  const animateConfirmPasswordLabel = (focused: boolean) => {
    Animated.parallel([
      Animated.timing(confirmPasswordLabelPosition, {
        toValue: focused || confirmPassword ? -25 : 0,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(confirmPasswordLabelSize, {
        toValue: focused || confirmPassword ? 12 : 16,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start()
    setConfirmPasswordFocused(focused)
  }

  // 전화번호 포맷팅 함수
  const formatPhoneNumber = (text: string) => {
    // 숫자만 추출
    const cleaned = text.replace(/\D/g, "")

    // 포맷팅 적용
    let formatted = ""
    if (cleaned.length <= 3) {
      formatted = cleaned
    } else if (cleaned.length <= 7) {
      formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
    } else {
      formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`
    }

    return formatted
  }

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text)
    setPhone(formatted)
  }

  // 타이머 시작 함수
  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    setTimeLeft(180) // 3분 = 180초

    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current)
          }
          return 0
        }
        return prevTime - 1
      })
    }, 1000)
  }

  // 타이머 포맷팅 함수
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // 인증 코드 요청 함수
  const handleRequestCode = async () => {
    if (!email || !phone) {
      Alert.alert("알림", "이메일과 전화번호를 모두 입력해주세요.")
      return
    }

    setIsLoading(true)

    // 인증 코드 요청 API 호출 시뮬레이션
    setTimeout(() => {
      setIsLoading(false)

      // 테스트용 조건: 이메일이 'hong@example.com'이고 전화번호가 '010-1234-5678'인 경우
      if (email === "hong@example.com" && phone === "010-1234-5678") {
        setCurrentStep(FindPasswordStep.VERIFY_CODE)
        startTimer()
        Alert.alert("알림", "인증 코드가 전송되었습니다. 3분 내에 입력해주세요.")
      } else {
        Alert.alert("알림", "입력하신 정보와 일치하는 계정을 찾을 수 없습니다.")
      }
    }, 1500)
  }

  // 인증 코드 확인 함수
  const handleVerifyCode = async () => {
    if (!verificationCode) {
      Alert.alert("알림", "인증 코드를 입력해주세요.")
      return
    }

    if (timeLeft === 0) {
      Alert.alert("알림", "인증 시간이 만료되었습니다. 다시 시도해주세요.")
      setCurrentStep(FindPasswordStep.ENTER_INFO)
      return
    }

    setIsLoading(true)

    // 인증 코드 확인 API 호출 시뮬레이션
    setTimeout(() => {
      setIsLoading(false)

      // 테스트용 조건: 인증 코드가 '123456'인 경우
      if (verificationCode === "123456") {
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
        setCurrentStep(FindPasswordStep.RESET_PASSWORD)
      } else {
        Alert.alert("알림", "인증 코드가 일치하지 않습니다. 다시 확인해주세요.")
      }
    }, 1000)
  }

  // 비밀번호 재설정 함수
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("알림", "새 비밀번호와 비밀번호 확인을 모두 입력해주세요.")
      return
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("알림", "새 비밀번호와 비밀번호 확인이 일치하지 않습니다.")
      return
    }

    // 비밀번호 유효성 검사 (8자 이상, 영문자, 숫자, 특수문자 포함)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
    if (!passwordRegex.test(newPassword)) {
      Alert.alert("알림", "비밀번호는 8자 이상이어야 하며, 영문자, 숫자, 특수문자를 각각 하나 이상 포함해야 합니다.")
      return
    }

    setIsLoading(true)

    // 비밀번호 재설정 API 호출 시뮬레이션
    setTimeout(() => {
      setIsLoading(false)
      setCurrentStep(FindPasswordStep.COMPLETE)
    }, 1500)
  }

  // 색상 테마 설정
  const colors = {
    background: isDarkMode ? "#121212" : "#FFFFFF",
    card: isDarkMode ? "#1E1E1E" : "#FFFFFF",
    primary: "#FF5A5F",
    text: isDarkMode ? "#FFFFFF" : "#333333",
    textSecondary: isDarkMode ? "#AAAAAA" : "#666666",
    border: isDarkMode ? "#333333" : "#EEEEEE",
    inputBg: isDarkMode ? "#2A2A2A" : "#F8F8F8",
    placeholder: isDarkMode ? "#777777" : "#999999",
    success: "#4CAF50",
    warning: "#FFC107",
    error: "#F44336",
  }

  // 단계별 진행 상태 표시
  const renderProgressSteps = () => {
    return (
      <View style={styles.progressContainer}>
        {[0, 1, 2].map((step) => (
          <View key={step} style={styles.progressStepContainer}>
            <View
              style={[
                styles.progressStep,
                {
                  backgroundColor: step <= currentStep ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={styles.progressStepText}>{step + 1}</Text>
            </View>
            {step < 2 && (
              <View
                style={[
                  styles.progressLine,
                  {
                    backgroundColor: step < currentStep ? colors.primary : colors.border,
                  },
                ]}
              />
            )}
          </View>
        ))}
      </View>
    )
  }

  // 단계별 화면 렌더링
  const renderStepContent = () => {
    switch (currentStep) {
      case FindPasswordStep.ENTER_INFO:
        return (
          <>
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

            {/* 전화번호 입력 필드 */}
            <View style={styles.inputWrapper}>
              <Animated.Text
                style={[
                  styles.floatingLabel,
                  {
                    top: phoneLabelPosition,
                    fontSize: phoneLabelSize,
                    color: phoneFocused ? colors.primary : colors.textSecondary,
                  },
                ]}
              >
                전화번호
              </Animated.Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: phoneFocused ? colors.primary : colors.border,
                    backgroundColor: colors.inputBg,
                    color: colors.text,
                  },
                ]}
                value={phone}
                onChangeText={handlePhoneChange}
                onFocus={() => animatePhoneLabel(true)}
                onBlur={() => animatePhoneLabel(false)}
                keyboardType="phone-pad"
                placeholderTextColor={colors.placeholder}
                maxLength={13} // 010-1234-5678 형식으로 최대 13자
              />
            </View>

            {/* 인증 코드 요청 버튼 */}
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={handleRequestCode}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.actionButtonText}>인증 코드 요청</Text>
              )}
            </TouchableOpacity>
          </>
        )

      case FindPasswordStep.VERIFY_CODE:
        return (
          <>
            {/* 인증 코드 입력 필드 */}
            <View style={styles.inputWrapper}>
              <Animated.Text
                style={[
                  styles.floatingLabel,
                  {
                    top: codeLabelPosition,
                    fontSize: codeLabelSize,
                    color: codeFocused ? colors.primary : colors.textSecondary,
                  },
                ]}
              >
                인증 코드
              </Animated.Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: codeFocused ? colors.primary : colors.border,
                    backgroundColor: colors.inputBg,
                    color: colors.text,
                  },
                ]}
                value={verificationCode}
                onChangeText={setVerificationCode}
                onFocus={() => animateCodeLabel(true)}
                onBlur={() => animateCodeLabel(false)}
                keyboardType="number-pad"
                placeholderTextColor={colors.placeholder}
                maxLength={6}
              />
              <View style={styles.timerContainer}>
                <Text
                  style={[
                    styles.timerText,
                    {
                      color: timeLeft < 60 ? colors.error : colors.primary,
                    },
                  ]}
                >
                  {formatTime(timeLeft)}
                </Text>
              </View>
            </View>

            <View style={styles.codeInfoContainer}>
              <Text style={[styles.codeInfoText, { color: colors.textSecondary }]}>
                {email}로 전송된 6자리 인증 코드를 입력해주세요.
              </Text>
            </View>

            {/* 인증 코드 확인 버튼 */}
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={handleVerifyCode}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.actionButtonText}>인증 코드 확인</Text>
              )}
            </TouchableOpacity>

            {/* 인증 코드 재요청 버튼 */}
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.border,
                  borderWidth: 1,
                },
              ]}
              onPress={handleRequestCode}
              disabled={isLoading}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>인증 코드 재요청</Text>
            </TouchableOpacity>
          </>
        )

      case FindPasswordStep.RESET_PASSWORD:
        return (
          <>
            {/* 새 비밀번호 입력 필드 */}
            <View style={styles.inputWrapper}>
              <Animated.Text
                style={[
                  styles.floatingLabel,
                  {
                    top: newPasswordLabelPosition,
                    fontSize: newPasswordLabelSize,
                    color: newPasswordFocused ? colors.primary : colors.textSecondary,
                  },
                ]}
              >
                새 비밀번호
              </Animated.Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: newPasswordFocused ? colors.primary : colors.border,
                    backgroundColor: colors.inputBg,
                    color: colors.text,
                  },
                ]}
                value={newPassword}
                onChangeText={setNewPassword}
                onFocus={() => animateNewPasswordLabel(true)}
                onBlur={() => animateNewPasswordLabel(false)}
                secureTextEntry={!showNewPassword}
                placeholderTextColor={colors.placeholder}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowNewPassword(!showNewPassword)}>
                <Text style={{ color: colors.textSecondary }}>{showNewPassword ? "숨김" : "표시"}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.passwordInfoContainer}>
              <Text style={[styles.passwordInfoText, { color: colors.textSecondary }]}>
                비밀번호는 8자 이상이어야 하며, 영문자, 숫자, 특수문자를 각각 하나 이상 포함해야 합니다.
              </Text>
            </View>

            {/* 비밀번호 확인 입력 필드 */}
            <View style={styles.inputWrapper}>
              <Animated.Text
                style={[
                  styles.floatingLabel,
                  {
                    top: confirmPasswordLabelPosition,
                    fontSize: confirmPasswordLabelSize,
                    color: confirmPasswordFocused ? colors.primary : colors.textSecondary,
                  },
                ]}
              >
                비밀번호 확인
              </Animated.Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: confirmPasswordFocused ? colors.primary : colors.border,
                    backgroundColor: colors.inputBg,
                    color: colors.text,
                  },
                ]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => animateConfirmPasswordLabel(true)}
                onBlur={() => animateConfirmPasswordLabel(false)}
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor={colors.placeholder}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Text style={{ color: colors.textSecondary }}>{showConfirmPassword ? "숨김" : "표시"}</Text>
              </TouchableOpacity>
            </View>

            {/* 비밀번호 재설정 버튼 */}
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.actionButtonText}>비밀번호 재설정</Text>
              )}
            </TouchableOpacity>
          </>
        )

      case FindPasswordStep.COMPLETE:
        return (
          <View style={styles.completeContainer}>
            <View style={[styles.completeIconContainer, { backgroundColor: colors.success }]}>
              <Text style={styles.completeIcon}>✓</Text>
            </View>
            <Text style={[styles.completeTitle, { color: colors.text }]}>비밀번호 재설정 완료</Text>
            <Text style={[styles.completeMessage, { color: colors.textSecondary }]}>
              비밀번호가 성공적으로 변경되었습니다. 새로운 비밀번호로 로그인해주세요.
            </Text>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate("LoginForm")}
            >
              <Text style={styles.actionButtonText}>로그인 화면으로 이동</Text>
            </TouchableOpacity>
          </View>
        )

      default:
        return null
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* 상단 웨이브 디자인 */}
          <View style={styles.waveContainer}>
            <Svg height="150" width={width} viewBox={`0 0 ${width} 150`}>
              <Path
                d={`M0 0L${width} 0L${width} 100C${width * 0.75} 130 ${width * 0.25} 80 0 100L0 0Z`}
                fill={colors.primary}
              />
            </Svg>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (currentStep === FindPasswordStep.ENTER_INFO) {
                  navigation.goBack()
                } else if (currentStep === FindPasswordStep.VERIFY_CODE) {
                  if (timerRef.current) {
                    clearInterval(timerRef.current)
                  }
                  setCurrentStep(FindPasswordStep.ENTER_INFO)
                } else if (currentStep === FindPasswordStep.RESET_PASSWORD) {
                  setCurrentStep(FindPasswordStep.VERIFY_CODE)
                  startTimer()
                }
              }}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.formContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.title, { color: colors.text }]}>비밀번호 찾기</Text>

            {currentStep < FindPasswordStep.COMPLETE && renderProgressSteps()}

            {renderStepContent()}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  waveContainer: {
    height: 150,
    width: "100%",
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
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
    marginBottom: 24,
    textAlign: "center",
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  progressStepContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressStep: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  progressStepText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  progressLine: {
    width: 40,
    height: 2,
    marginHorizontal: 8,
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
  timerContainer: {
    position: "absolute",
    right: 16,
    top: 18,
  },
  timerText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  codeInfoContainer: {
    marginBottom: 24,
  },
  codeInfoText: {
    fontSize: 14,
    textAlign: "center",
  },
  passwordInfoContainer: {
    marginBottom: 24,
  },
  passwordInfoText: {
    fontSize: 12,
    lineHeight: 18,
  },
  actionButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  completeContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  completeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  completeIcon: {
    fontSize: 40,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  completeMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
})

export default FindPasswordScreen
