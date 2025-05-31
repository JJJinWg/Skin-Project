//프로필->진단 내역->상세 보기

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
  ActivityIndicator,
  Share,
} from "react-native"
import { type NavigationProp, useNavigation, type RouteProp, useRoute } from "@react-navigation/native"
import type { RootStackParamList } from "../types/navigation"
import LinearGradient from "react-native-linear-gradient"

// 진단 내역 타입 정의
type Diagnosis = {
  id: number
  doctorId: number
  doctorName: string
  doctorImage: any
  specialty: string
  date: string
  symptoms: string
  diagnosisContent: string
  treatment: string
  prescriptions: string[]
  followUpRequired: boolean
  followUpDate?: string
  images?: string[]
  additionalNotes?: string
}

type DiagnosisDetailScreenRouteProp = RouteProp<{ params: { diagnosisId: number } }, "params">

const DiagnosisDetailScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const route = useRoute<DiagnosisDetailScreenRouteProp>()
  const { diagnosisId } = route.params

  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null)
  const [loading, setLoading] = useState(true)

  // 진단 상세 정보 가져오기 (API 호출 시뮬레이션)
  useEffect(() => {
    setLoading(true)
    // API 호출 시뮬레이션
    setTimeout(() => {
      // 실제로는 diagnosisId를 사용하여 API에서 특정 진단 정보를 가져옵니다
      const mockDiagnosis: Diagnosis = {
        id: diagnosisId,
        doctorId: 1,
        doctorName: "Dr. Kim",
        doctorImage: require("../assets/doctor1.png"),
        specialty: "피부과",
        date: "2023-05-15",
        symptoms:
          "얼굴에 붉은 발진과 가려움증, 건조함이 있습니다. 특히 볼과 이마 부위에 증상이 심하며, 세안 후 더 심해지는 경향이 있습니다. 2주 전부터 새로운 화장품을 사용하기 시작했습니다.",
        diagnosisContent:
          "접촉성 피부염으로 진단됩니다. 특정 화장품이나 세안제에 포함된 성분에 대한 알레르기 반응으로 보입니다. 피부 장벽이 약해져 있어 자극에 더 민감하게 반응하고 있습니다.",
        treatment:
          "스테로이드 연고를 처방해 드립니다. 하루에 두 번, 아침과 저녁에 발진 부위에 얇게 바르세요. 또한 자극이 적은 세안제와 보습제를 사용하시기 바랍니다. 최근에 사용하기 시작한 화장품은 일단 중단하시고, 피부가 회복된 후 하나씩 테스트해보는 것이 좋겠습니다.",
        prescriptions: [
          "베타메타손 연고 0.05% - 하루 2회, 아침/저녁 발진 부위에 얇게 바름",
          "세티리진 정 10mg - 가려움이 심할 때 하루 1회 복용",
          "세라마이드 함유 보습제 - 하루 3회 이상 충분히 바름",
        ],
        followUpRequired: true,
        followUpDate: "2023-05-29",
        images: ["https://example.com/diagnosis-image1.jpg"],
        additionalNotes:
          "알레르기 반응이 심해지거나 호전되지 않으면 바로 내원하세요. 처방된 약물에 대한 부작용(피부 자극, 발적 증가 등)이 있으면 즉시 사용을 중단하고 연락주세요.",
      }
      setDiagnosis(mockDiagnosis)
      setLoading(false)
    }, 1000)
  }, [diagnosisId])

  // 날짜 포맷 변환 (YYYY-MM-DD -> YYYY년 MM월 DD일)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    return `${year}년 ${month}월 ${day}일`
  }

  // 뒤로가기 처리
  const handleBackPress = () => {
    navigation.goBack()
  }

  // 진단서 공유하기
  const handleShare = async () => {
    if (!diagnosis) return

    try {
      const shareMessage = `
진단 정보 - ${formatDate(diagnosis.date)}

의사: ${diagnosis.doctorName} (${diagnosis.specialty})
증상: ${diagnosis.symptoms}
진단: ${diagnosis.diagnosisContent}
치료 계획: ${diagnosis.treatment}

처방약:
${diagnosis.prescriptions.join("\n")}

${diagnosis.followUpRequired ? `추적 관찰: ${diagnosis.followUpDate ? formatDate(diagnosis.followUpDate) : "필요"}` : ""}
`

      await Share.share({
        message: shareMessage,
        title: `${diagnosis.doctorName} 진단서 - ${formatDate(diagnosis.date)}`,
      })
    } catch (error) {
      console.error("Error sharing diagnosis:", error)
    }
  }

  // 예약 화면으로 이동
  const handleMakeAppointment = () => {
    if (!diagnosis) return

    navigation.navigate("AppointmentScreen", {
      doctorId: diagnosis.doctorId,
      doctorName: diagnosis.doctorName,
      specialty: diagnosis.specialty,
    })
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF9A9E" />
          <Text style={styles.loadingText}>진단 정보를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!diagnosis) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>진단 정보를 찾을 수 없습니다.</Text>
          <TouchableOpacity style={styles.backButtonLarge} onPress={handleBackPress}>
            <Text style={styles.backButtonLargeText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>진단 상세</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>공유</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 의사 정보 */}
        <View style={styles.doctorInfoCard}>
          <Image source={diagnosis.doctorImage} style={styles.doctorImage} />
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{diagnosis.doctorName}</Text>
            <Text style={styles.specialty}>{diagnosis.specialty}</Text>
            <Text style={styles.diagnosisDate}>{formatDate(diagnosis.date)}</Text>
          </View>
        </View>

        {/* 진단 내용 */}
        <View style={styles.diagnosisCard}>
          <View style={styles.diagnosisSection}>
            <Text style={styles.diagnosisSectionTitle}>증상</Text>
            <Text style={styles.diagnosisText}>{diagnosis.symptoms}</Text>
          </View>

          <View style={styles.diagnosisSection}>
            <Text style={styles.diagnosisSectionTitle}>진단</Text>
            <Text style={styles.diagnosisText}>{diagnosis.diagnosisContent}</Text>
          </View>

          <View style={styles.diagnosisSection}>
            <Text style={styles.diagnosisSectionTitle}>치료 계획</Text>
            <Text style={styles.diagnosisText}>{diagnosis.treatment}</Text>
          </View>

          <View style={styles.diagnosisSection}>
            <Text style={styles.diagnosisSectionTitle}>처방약</Text>
            {diagnosis.prescriptions.map((prescription, index) => (
              <View key={index} style={styles.prescriptionItem}>
                <View style={styles.prescriptionBullet} />
                <Text style={styles.prescriptionText}>{prescription}</Text>
              </View>
            ))}
          </View>

          {diagnosis.followUpRequired && (
            <View style={styles.diagnosisSection}>
              <Text style={styles.diagnosisSectionTitle}>추적 관찰</Text>
              <Text style={styles.diagnosisText}>
                {diagnosis.followUpDate
                  ? `${formatDate(diagnosis.followUpDate)}에 재방문이 필요합니다.`
                  : "추적 관찰이 필요합니다."}
              </Text>
            </View>
          )}

          {diagnosis.additionalNotes && (
            <View style={styles.diagnosisSection}>
              <Text style={styles.diagnosisSectionTitle}>추가 안내사항</Text>
              <Text style={styles.diagnosisText}>{diagnosis.additionalNotes}</Text>
            </View>
          )}

          {diagnosis.images && diagnosis.images.length > 0 && (
            <View style={styles.diagnosisSection}>
              <Text style={styles.diagnosisSectionTitle}>진단 이미지</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
                {diagnosis.images.map((image, index) => (
                  <Image key={index} source={{ uri: image }} style={styles.diagnosisImage} />
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* 예약 버튼 */}
        <TouchableOpacity style={styles.appointmentButton} onPress={handleMakeAppointment}>
          <LinearGradient
            colors={["#FF9A9E", "#FAD0C4"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.appointmentButtonGradient}
          >
            <Text style={styles.appointmentButtonText}>이 의사에게 예약하기</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* 하단 여백 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
  shareButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
  },
  shareButtonText: {
    fontSize: 14,
    color: "#6C757D",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#6C757D",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#6C757D",
    marginBottom: 20,
    textAlign: "center",
  },
  backButtonLarge: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#FF9A9E",
    borderRadius: 8,
  },
  backButtonLargeText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  doctorInfoCard: {
    margin: 20,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  doctorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    color: "#6C757D",
    marginBottom: 4,
  },
  diagnosisDate: {
    fontSize: 12,
    color: "#ADB5BD",
  },
  diagnosisCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  diagnosisSection: {
    marginBottom: 20,
  },
  diagnosisSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#FF9A9E",
    paddingLeft: 10,
  },
  diagnosisText: {
    fontSize: 14,
    color: "#495057",
    lineHeight: 22,
  },
  prescriptionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  prescriptionBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF9A9E",
    marginTop: 8,
    marginRight: 8,
  },
  prescriptionText: {
    flex: 1,
    fontSize: 14,
    color: "#495057",
    lineHeight: 22,
  },
  imagesContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  diagnosisImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginRight: 10,
  },
  appointmentButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  appointmentButtonGradient: {
    paddingVertical: 15,
    alignItems: "center",
  },
  appointmentButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomSpacer: {
    height: 40,
  },
})

export default DiagnosisDetailScreen
