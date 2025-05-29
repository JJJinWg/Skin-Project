// 내정보 수정

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  ScrollView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { type NavigationProp, useNavigation, type RouteProp, useRoute } from "@react-navigation/native"
import type { RootStackParamList } from "../types/navigation"
import LinearGradient from "react-native-linear-gradient"
import { launchImageLibrary } from "react-native-image-picker"
import { StackNavigationProp } from "@react-navigation/stack";

type EditProfileScreenRouteProp = RouteProp<
  { params: { userInfo: { name: string; email: string; phone: string; birthdate: string; profileImage: any } } },
  "params"
>

const EditProfileScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<EditProfileScreenRouteProp>()
  const { userInfo } = route.params

  const [name, setName] = useState(userInfo.name)
  const [email, setEmail] = useState(userInfo.email)
  const [phone, setPhone] = useState(userInfo.phone)
  const [birthdate, setBirthdate] = useState(userInfo.birthdate)
  const [profileImage, setProfileImage] = useState(userInfo.profileImage)
  const [isLoading, setIsLoading] = useState(false)

  // 프로필 이미지 변경
  const handleChangeProfileImage = () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        includeBase64: false,
        maxHeight: 800,
        maxWidth: 800,
      },
      (response) => {
        if (response.didCancel) {
          console.log("User cancelled image picker")
        } else if (response.errorCode) {
          console.log("ImagePicker Error: ", response.errorMessage)
        } else if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0]
          if (asset.uri) {
            setProfileImage({ uri: asset.uri })
          }
        }
      },
    )
  }

  // 생년월일 형식 검증 (YYYY-MM-DD)
  const validateBirthdate = (date: string) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/
    if (!regex.test(date)) return false

    const parts = date.split("-")
    const year = Number.parseInt(parts[0], 10)
    const month = Number.parseInt(parts[1], 10)
    const day = Number.parseInt(parts[2], 10)

    if (year < 1900 || year > new Date().getFullYear()) return false
    if (month < 1 || month > 12) return false
    if (day < 1 || day > 31) return false

    return true
  }

  // 전화번호 형식 검증
  const validatePhone = (phoneNumber: string) => {
    const regex = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/
    return regex.test(phoneNumber)
  }

  // 이메일 형식 검증
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  // 저장 버튼 핸들러
  const handleSave = () => {
    // 입력값 검증
    if (!name.trim()) {
      Alert.alert("알림", "이름을 입력해주세요.")
      return
    }

    if (!validateEmail(email)) {
      Alert.alert("알림", "올바른 이메일 형식이 아닙니다.")
      return
    }

    if (!validatePhone(phone)) {
      Alert.alert("알림", "올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)")
      return
    }

    if (!validateBirthdate(birthdate)) {
      Alert.alert("알림", "올바른 생년월일 형식이 아닙니다. (예: 1990-01-01)")
      return
    }

    // 저장 로직 (실제로는 API 호출)
    setIsLoading(true)

    // API 호출 시뮬레이션
    setTimeout(() => {
      setIsLoading(false)

      // 수정된 사용자 정보
      const updatedUserInfo = {
        name,
        email,
        phone,
        birthdate,
        profileImage,
      }

      // ProfileScreen으로 돌아가면서 수정된 정보 전달
      // navigate 대신 replace를 사용하여 현재 화면을 네비게이션 스택에서 제거
      navigation.replace("ProfileScreen", { updatedUserInfo })
    }, 1000)
  }

  // 취소 버튼 핸들러
  const handleCancel = () => {
    Alert.alert(
      "변경 취소",
      "변경 사항을 취소하시겠습니까?",
      [
        {
          text: "아니오",
          style: "cancel",
        },
        {
          text: "예",
          onPress: () => navigation.goBack(),
        },
      ],
      { cancelable: true },
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>정보 수정</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* 프로필 이미지 */}
          <View style={styles.profileImageSection}>
            <TouchableOpacity style={styles.profileImageContainer} onPress={handleChangeProfileImage}>
              {typeof profileImage === "number" ? (
                <Image source={profileImage} style={styles.profileImage} />
              ) : (
                <Image source={profileImage} style={styles.profileImage} />
              )}
              <View style={styles.editIconContainer}>
                <Text style={styles.editIcon}>✎</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.changePhotoText}>프로필 사진 변경</Text>
          </View>

          {/* 입력 폼 */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>이름</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="이름을 입력하세요"
                placeholderTextColor="#ADB5BD"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>이메일</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="이메일을 입력하세요"
                placeholderTextColor="#ADB5BD"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>전화번호</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="전화번호를 입력하세요 (예: 010-1234-5678)"
                placeholderTextColor="#ADB5BD"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>생년월일</Text>
              <TextInput
                style={styles.input}
                value={birthdate}
                onChangeText={setBirthdate}
                placeholder="생년월일을 입력하세요 (예: 1990-01-01)"
                placeholderTextColor="#ADB5BD"
              />
            </View>
          </View>

          {/* 버튼 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isLoading}>
              <LinearGradient
                colors={["#FF9A9E", "#FAD0C4"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButtonGradient}
              >
                <Text style={styles.saveButtonText}>{isLoading ? "저장 중..." : "저장"}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F5",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#212529",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
  },
  placeholder: {
    width: 40,
  },
  profileImageSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FF9A9E",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  editIcon: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  changePhotoText: {
    fontSize: 14,
    color: "#6C757D",
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#212529",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: "#212529",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#6C757D",
  },
  saveButton: {
    flex: 1,
    marginLeft: 10,
    borderRadius: 12,
    overflow: "hidden",
  },
  saveButtonGradient: {
    paddingVertical: 15,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
})

export default EditProfileScreen
