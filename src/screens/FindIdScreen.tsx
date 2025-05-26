// 아이디 찾기 화면 
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

const FindIdScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [nameFocused, setNameFocused] = useState(false)
  const [phoneFocused, setPhoneFocused] = useState(false)
  const [foundId, setFoundId] = useState<string | null>(null)

  const colorScheme = useColorScheme()
  const isDarkMode = colorScheme === "dark"

  // Animated values for input labels
  const nameLabelPosition = useRef(new Animated.Value(name ? -25 : 0)).current
  const nameLabelSize = useRef(new Animated.Value(name ? 12 : 16)).current
  const phoneLabelPosition = useRef(new Animated.Value(phone ? -25 : 0)).current
  const phoneLabelSize = useRef(new Animated.Value(phone ? 12 : 16)).current

  // Animation functions
  const animateNameLabel = (focused: boolean) => {
    Animated.parallel([
      Animated.timing(nameLabelPosition, {
        toValue: focused || name ? -25 : 0,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(nameLabelSize, {
        toValue: focused || name ? 12 : 16,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start()
    setNameFocused(focused)
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

  const handleFindId = async () => {
    if (!name || !phone) {
      Alert.alert("알림", "이름과 전화번호를 모두 입력해주세요.")
      return
    }

    setIsLoading(true)

    // 아이디 찾기 API 호출 시뮬레이션
    setTimeout(() => {
      setIsLoading(false)

      // 테스트용 조건: 이름이 '홍길동'이고 전화번호가 '010-1234-5678'인 경우
      if (name === "asdf" && phone === "010-1234-5678") {
        setFoundId("hong@example.com")
      } else {
        Alert.alert("알림", "입력하신 정보와 일치하는 계정을 찾을 수 없습니다.")
      }
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
            <TouchableOpacity style={styles.backButton} >
              
            </TouchableOpacity>
          </View>

          <View style={[styles.formContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.title, { color: colors.text }]}>아이디 찾기</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              가입 시 등록한 이름과 전화번호를 입력해주세요
            </Text>

            {foundId ? (
              // 아이디 찾기 결과 화면
              <View style={styles.resultContainer}>
                <View style={[styles.resultBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                  <Text style={[styles.resultTitle, { color: colors.text }]}>아이디 찾기 결과</Text>
                  <Text style={[styles.resultText, { color: colors.textSecondary }]}>회원님의 아이디는</Text>
                  <Text style={[styles.foundId, { color: colors.primary }]}>{foundId}</Text>
                  <Text style={[styles.resultDate, { color: colors.textSecondary }]}>가입일: 2023년 05월 15일</Text>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate("LoginForm")}
                  >
                    <Text style={styles.actionButtonText}>로그인</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: colors.inputBg, borderColor: colors.border, borderWidth: 1 },
                    ]}
                    onPress={() => navigation.navigate("FindPasswordScreen")}
                  >
                    <Text style={[styles.secondaryButtonText, { color: colors.text }]}>비밀번호 찾기</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              // 아이디 찾기 입력 폼
              <>
                {/* 이름 입력 필드 */}
                <View style={styles.inputWrapper}>
                  <Animated.Text
                    style={[
                      styles.floatingLabel,
                      {
                        top: nameLabelPosition,
                        fontSize: nameLabelSize,
                        color: nameFocused ? colors.primary : colors.textSecondary,
                      },
                    ]}
                  >
                    이름
                  </Animated.Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        borderColor: nameFocused ? colors.primary : colors.border,
                        backgroundColor: colors.inputBg,
                        color: colors.text,
                      },
                    ]}
                    value={name}
                    onChangeText={setName}
                    onFocus={() => animateNameLabel(true)}
                    onBlur={() => animateNameLabel(false)}
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

                {/* 아이디 찾기 버튼 */}
                <TouchableOpacity
                  style={[styles.findButton, { backgroundColor: colors.primary }]}
                  onPress={handleFindId}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.findButtonText}>아이디 찾기</Text>
                  )}
                </TouchableOpacity>

                {/* 비밀번호 찾기 링크 */}
                <TouchableOpacity
                  style={styles.linkContainer}
                  onPress={() => navigation.navigate("FindPasswordScreen")}
                >
                  <Text style={[styles.linkText, { color: colors.textSecondary }]}>비밀번호를 찾으시나요?</Text>
                  <Text style={[styles.linkHighlight, { color: colors.primary }]}> 비밀번호 찾기</Text>
                </TouchableOpacity>
              </>
            )}
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
  findButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  findButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  linkText: {
    fontSize: 14,
  },
  linkHighlight: {
    fontSize: 14,
    fontWeight: "600",
  },
  resultContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  resultBox: {
    width: "100%",
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  resultText: {
    fontSize: 14,
    marginBottom: 8,
  },
  foundId: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  resultDate: {
    fontSize: 12,
  },
  actionButtons: {
    width: "100%",
    marginTop: 8,
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
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
})

export default FindIdScreen
