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
import { diagnosisService, type Diagnosis } from "../services/diagnosisService"

type DiagnosisDetailScreenRouteProp = RouteProp<{ params: { diagnosisId: number } }, "params">

// 진단 상세 화면용 확장 타입 (추가 필드 포함)
type DiagnosisDetail = Diagnosis & {
  images?: string[]
  additionalNotes?: string
}

const DiagnosisDetailScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const route = useRoute<DiagnosisDetailScreenRouteProp>()
  const { diagnosisId } = route.params

  const [diagnosis, setDiagnosis] = useState<DiagnosisDetail | null>(null)
  const [loading, setLoading] = useState(true)

  // 진단 상세 정보 가져오기 (실제 API 사용)
  useEffect(() => {
    const loadDiagnosisDetail = async () => {
      try {
        setLoading(true);
        console.log('📋 진단 상세 정보 로드 중...', diagnosisId);
        
        // diagnosisService를 사용하여 실제 데이터 조회
        const diagnosisData = await diagnosisService.getDiagnosisDetail(diagnosisId);
        
        if (diagnosisData) {
          setDiagnosis(diagnosisData);
          console.log('✅ 진단 상세 정보 로드 성공:', diagnosisData);
        } else {
          console.log('❌ 진단 정보를 찾을 수 없습니다:', diagnosisId);
          setDiagnosis(null);
        }
      } catch (error) {
        console.error('❌ 진단 상세 정보 로드 실패:', error);
        setDiagnosis(null);
      } finally {
        setLoading(false);
      }
    };

    loadDiagnosisDetail();
  }, [diagnosisId]);

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
        <TouchableOpacity style={styles.backButton}>
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
