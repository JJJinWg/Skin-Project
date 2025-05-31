// 진료 요청서 작성 화면

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native"
import { type NavigationProp, useNavigation } from "@react-navigation/native"
import type { RootStackParamList } from "../types/navigation"
import LinearGradient from "react-native-linear-gradient"
import { launchCamera, launchImageLibrary } from "react-native-image-picker"
import { diagnosisService } from "../services/diagnosisService"

type ImageType = {
  uri: string
  type: string
  name: string
}

type DiagnosisRequest = {
  symptoms: string
  duration: string
  severity: "mild" | "moderate" | "severe"
  previousTreatment: string
  allergies: string
  medications: string
  additionalNotes: string
  images: ImageType[]
}

const DiagnosisHistoryScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<DiagnosisRequest>({
    symptoms: "",
    duration: "",
    severity: "mild",
    previousTreatment: "",
    allergies: "",
    medications: "",
    additionalNotes: "",
    images: [],
  })

  // 뒤로가기
  const handleBackPress = () => {
    navigation.goBack()
  }

  // 증상 심각도 선택
  const handleSeveritySelect = (severity: "mild" | "moderate" | "severe") => {
    setFormData(prev => ({ ...prev, severity }))
  }

  // 사진 추가
  const handleAddPhoto = () => {
    Alert.alert(
      "사진 추가",
      "사진을 어떻게 추가하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        { text: "카메라", onPress: () => openCamera() },
        { text: "갤러리", onPress: () => openGallery() },
      ]
    )
  }

  // 카메라 열기
  const openCamera = () => {
    launchCamera(
      {
        mediaType: "photo",
        includeBase64: false,
        maxHeight: 1200,
        maxWidth: 1200,
        quality: 0.8,
      },
      (response) => {
        if (response.didCancel || response.errorCode) return
        
        if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0]
          if (asset.uri && asset.type && asset.fileName) {
            const newImage: ImageType = {
              uri: asset.uri,
              type: asset.type,
              name: asset.fileName,
            }
            setFormData(prev => ({
              ...prev,
              images: [...prev.images, newImage]
            }))
          }
        }
      }
    )
  }

  // 갤러리 열기
  const openGallery = () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        includeBase64: false,
        maxHeight: 1200,
        maxWidth: 1200,
        quality: 0.8,
        selectionLimit: 5 - formData.images.length, // 최대 5장까지
      },
      (response) => {
        if (response.didCancel || response.errorCode) return
        
        if (response.assets && response.assets.length > 0) {
          const newImages: ImageType[] = response.assets
            .filter(asset => asset.uri && asset.type && asset.fileName)
            .map(asset => ({
              uri: asset.uri!,
              type: asset.type!,
              name: asset.fileName!,
            }))
          
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...newImages]
          }))
        }
      }
    )
  }

  // 사진 삭제
  const handleRemovePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    if (!formData.symptoms.trim()) {
      Alert.alert("알림", "증상을 입력해주세요.")
      return false
    }
    if (!formData.duration.trim()) {
      Alert.alert("알림", "증상 지속 기간을 입력해주세요.")
      return false
    }
    return true
  }

  // 진료 요청서 제출
  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)

      // 실제 서비스를 통한 진료 요청서 제출
      const result = await diagnosisService.submitDiagnosisRequest(formData)

      if (result.success) {
        Alert.alert(
          "제출 완료",
          `${result.message} 요청서 번호: ${result.requestId}`,
          [
            {
              text: "확인",
              onPress: () => {
                // 홈 화면으로 이동
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'HomeScreen' }],
                })
              },
            },
          ],
          { cancelable: false }
        )
      } else {
        Alert.alert("오류", result.message)
      }
    } catch (error) {
      console.error('진료 요청서 제출 실패:', error)
      Alert.alert("오류", "진료 요청서 제출에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setLoading(false)
    }
  }

  // 심각도 텍스트 반환
  const getSeverityText = (severity: "mild" | "moderate" | "severe") => {
    switch (severity) {
      case "mild": return "경미함"
      case "moderate": return "보통"
      case "severe": return "심각함"
      default: return ""
    }
  }

  // 심각도 색상 반환
  const getSeverityColor = (severity: "mild" | "moderate" | "severe") => {
    switch (severity) {
      case "mild": return "#4CAF50"
      case "moderate": return "#FF9800"
      case "severe": return "#F44336"
      default: return "#757575"
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} >
          
        </TouchableOpacity>
        <Text style={styles.headerTitle}>진료 요청서</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 안내 메시지 */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>진료 요청서 작성</Text>
          <Text style={styles.infoText}>
            정확한 진단을 위해 증상과 관련 정보를 자세히 작성해주세요. 
            의료진이 검토 후 적절한 치료 방안을 제안해드립니다.
          </Text>
        </View>

        {/* 주요 증상 */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>주요 증상 *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="현재 겪고 있는 증상을 자세히 설명해주세요"
            placeholderTextColor="#ADB5BD"
            value={formData.symptoms}
            onChangeText={(text) => setFormData(prev => ({ ...prev, symptoms: text }))}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* 증상 지속 기간 */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>증상 지속 기간 *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="예: 3일 전부터, 1주일째, 한 달 이상"
            placeholderTextColor="#ADB5BD"
            value={formData.duration}
            onChangeText={(text) => setFormData(prev => ({ ...prev, duration: text }))}
          />
        </View>

        {/* 증상 심각도 */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>증상 심각도</Text>
          <View style={styles.severityContainer}>
            {(["mild", "moderate", "severe"] as const).map((severity) => (
              <TouchableOpacity
                key={severity}
                style={[
                  styles.severityButton,
                  formData.severity === severity && {
                    backgroundColor: getSeverityColor(severity),
                    borderColor: getSeverityColor(severity),
                  }
                ]}
                onPress={() => handleSeveritySelect(severity)}
              >
                <Text
                  style={[
                    styles.severityButtonText,
                    formData.severity === severity && styles.severityButtonTextActive
                  ]}
                >
                  {getSeverityText(severity)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 이전 치료 경험 */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>이전 치료 경험</Text>
          <TextInput
            style={styles.textArea}
            placeholder="비슷한 증상으로 받은 치료나 처방받은 약물이 있다면 작성해주세요"
            placeholderTextColor="#ADB5BD"
            value={formData.previousTreatment}
            onChangeText={(text) => setFormData(prev => ({ ...prev, previousTreatment: text }))}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* 알레르기 */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>알레르기</Text>
          <TextInput
            style={styles.textInput}
            placeholder="알려진 알레르기가 있다면 작성해주세요"
            placeholderTextColor="#ADB5BD"
            value={formData.allergies}
            onChangeText={(text) => setFormData(prev => ({ ...prev, allergies: text }))}
          />
        </View>

        {/* 복용 중인 약물 */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>복용 중인 약물</Text>
          <TextInput
            style={styles.textInput}
            placeholder="현재 복용 중인 약물이나 영양제가 있다면 작성해주세요"
            placeholderTextColor="#ADB5BD"
            value={formData.medications}
            onChangeText={(text) => setFormData(prev => ({ ...prev, medications: text }))}
          />
        </View>

        {/* 추가 메모 */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>추가 메모</Text>
          <TextInput
            style={styles.textArea}
            placeholder="의료진에게 전달하고 싶은 추가 정보가 있다면 작성해주세요"
            placeholderTextColor="#ADB5BD"
            value={formData.additionalNotes}
            onChangeText={(text) => setFormData(prev => ({ ...prev, additionalNotes: text }))}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* 사진 첨부 */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>사진 첨부 (선택사항)</Text>
          <Text style={styles.sectionSubtitle}>증상 부위 사진을 첨부하면 더 정확한 진단에 도움이 됩니다.</Text>
          
          <View style={styles.photoContainer}>
            {formData.images.map((image, index) => (
              <View key={index} style={styles.photoItem}>
                <Image source={{ uri: image.uri }} style={styles.photoImage} />
                <TouchableOpacity
                  style={styles.photoRemoveButton}
                  onPress={() => handleRemovePhoto(index)}
                >
                  <Text style={styles.photoRemoveText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            
            {formData.images.length < 5 && (
              <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
                <Text style={styles.addPhotoIcon}>📷</Text>
                <Text style={styles.addPhotoText}>사진 추가</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 하단 여백 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* 제출 버튼 */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <LinearGradient
            colors={["#FF9A9E", "#FAD0C4"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitButtonGradient}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>진료 요청서 제출</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
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
    borderBottomColor: "#E9ECEF",
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: "#212529",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
  },
  placeholder: {
    width: 34,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#6C757D",
    lineHeight: 22,
  },
  formSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#6C757D",
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    fontSize: 14,
    color: "#212529",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    fontSize: 14,
    color: "#212529",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    minHeight: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  severityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  severityButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  severityButtonText: {
    fontSize: 14,
    color: "#6C757D",
    fontWeight: "500",
  },
  severityButtonTextActive: {
    color: "#FFFFFF",
  },
  photoContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  photoItem: {
    position: "relative",
    marginRight: 10,
    marginBottom: 10,
  },
  photoImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  photoRemoveButton: {
    position: "absolute",
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#F44336",
    alignItems: "center",
    justifyContent: "center",
  },
  photoRemoveText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  addPhotoButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#E9ECEF",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FA",
  },
  addPhotoIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  addPhotoText: {
    fontSize: 10,
    color: "#6C757D",
    textAlign: "center",
  },
  bottomSpacer: {
    height: 100,
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
  },
  submitButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    paddingVertical: 15,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default DiagnosisHistoryScreen
