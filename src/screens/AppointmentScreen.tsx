// 의사 예약 화면

import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native"
import { Calendar, type DateData } from "react-native-calendars"
import { type RouteProp, useNavigation, useRoute, useFocusEffect } from "@react-navigation/native"
import LinearGradient from "react-native-linear-gradient"
import { appointmentService } from '../services/appointmentService'
import { diagnosisService, type DiagnosisRequest } from '../services/diagnosisService'

type AppointmentScreenRouteProp = RouteProp<
  { params: { doctorId: number; doctorName: string; specialty: string } },
  "params"
>

const AppointmentScreen = () => {
  const navigation = useNavigation()
  const route = useRoute<AppointmentScreenRouteProp>()
  const { doctorId, doctorName, specialty } = route.params

  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [markedDates, setMarkedDates] = useState<any>({})
  const [loading, setLoading] = useState(false)

  // 진료 요청서 관련 상태 추가
  const [diagnosisRequests, setDiagnosisRequests] = useState<DiagnosisRequest[]>([])
  const [selectedDiagnosisRequest, setSelectedDiagnosisRequest] = useState<DiagnosisRequest | null>(null)
  const [loadingRequests, setLoadingRequests] = useState(false)

  // 오늘 날짜 구하기
  const today = new Date()
  const todayString = today.toISOString().split("T")[0]

  // 30일 후 날짜 구하기
  const maxDate = new Date()
  maxDate.setDate(today.getDate() + 30)
  const maxDateString = maxDate.toISOString().split("T")[0]

  // 진료 요청서 목록 조회
  useEffect(() => {
    loadDiagnosisRequests()
  }, [])

  // 화면 포커스 시 목록 새로고침
  useFocusEffect(
    React.useCallback(() => {
      loadDiagnosisRequests()
    }, [])
  )

  const loadDiagnosisRequests = async () => {
    try {
      setLoadingRequests(true)
      const userId = 1 // 실제로는 로그인한 사용자 ID
      const requests = await diagnosisService.getDiagnosisRequests(userId)
      // 제출된 요청서만 필터링 (status가 'submitted' 또는 'pending')
      const availableRequests = requests.filter(req => 
        req.status === 'submitted' || req.status === 'pending'
      )
      setDiagnosisRequests(availableRequests)
    } catch (error) {
      console.error('진료 요청서 목록 조회 실패:', error)
      Alert.alert('오류', '진료 요청서 목록을 불러올 수 없습니다.')
    } finally {
      setLoadingRequests(false)
    }
  }

  // 선택 가능한 시간대 생성 (실제로는 API에서 가져올 수 있음)
  const generateAvailableTimes = async (date: string) => {
    setLoading(true)
    try {
      const times = await appointmentService.getAvailableTimeSlots(doctorId, date)
      setAvailableTimes(times)
    } catch (error) {
      console.error('예약 가능 시간 조회 실패:', error)
      Alert.alert('오류', '예약 가능 시간을 불러올 수 없습니다.')
      setAvailableTimes([])
    } finally {
      setLoading(false)
    }
  }

  // 날짜 선택 핸들러
  const handleDateSelect = async (date: DateData) => {
    const dateString = date.dateString

    // 이미 선택된 날짜를 다시 클릭하면 선택 취소
    if (dateString === selectedDate) {
      setSelectedDate("")
      setSelectedTime("")
      setAvailableTimes([])
      setMarkedDates({})
      return
    }

    setSelectedDate(dateString)
    setSelectedTime("")

    // 선택된 날짜 표시
    const newMarkedDates: any = {}
    newMarkedDates[dateString] = {
      selected: true,
      selectedColor: "#FF9A9E",
    }
    setMarkedDates(newMarkedDates)

    // 선택된 날짜에 대한 가능한 시간 생성
    await generateAvailableTimes(dateString)
  }

  // 시간 선택 핸들러
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  // 진료 요청서 선택 핸들러
  const handleSelectDiagnosisRequest = async (request: DiagnosisRequest) => {
    try {
      setLoading(true)
      
      // 상세 데이터 조회
      const detailResponse = await diagnosisService.getDiagnosisRequestById(request.id)
      
      if (detailResponse && (detailResponse as any).data) {
        setSelectedDiagnosisRequest((detailResponse as any).data)
        console.log('🔍 상세 진료 요청서 데이터:', (detailResponse as any).data)
      } else if (detailResponse) {
        // 응답이 바로 데이터인 경우
        setSelectedDiagnosisRequest(detailResponse)
        console.log('🔍 상세 진료 요청서 데이터 (직접):', detailResponse)
      } else {
        // 상세 조회 실패 시 기본 데이터 사용
        setSelectedDiagnosisRequest(request)
        console.log('⚠️ 상세 조회 실패, 기본 데이터 사용:', request)
      }
    } catch (error) {
      console.error('진료 요청서 상세 조회 실패:', error)
      // 에러 시 기본 데이터 사용
      setSelectedDiagnosisRequest(request)
    } finally {
      setLoading(false)
    }
  }

  // 새 진료 요청서 작성하기
  const handleCreateNewDiagnosisRequest = () => {
    Alert.alert(
      "진료 요청서 작성",
      "새로운 진료 요청서를 작성하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        { 
          text: "작성하기", 
          onPress: () => {
            // DiagnosisHistoryScreen으로 이동 (진료 요청서 작성 화면)
            navigation.navigate('DiagnosisHistoryScreen' as never)
          }
        },
      ]
    )
  }

  // 예약 완료 핸들러
  const handleConfirmAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert("알림", "날짜와 시간을 모두 선택해주세요.")
      return
    }

    if (!selectedDiagnosisRequest) {
      Alert.alert("알림", "진료 요청서를 선택해주세요.")
      return
    }

    try {
      setLoading(true)
      
      // 실제 API 호출 - 모든 필수 DB 필드 포함
      const appointmentData = {
        doctorId: doctorId,
        userId: 1, // 실제로는 로그인한 사용자 ID
        hospitalId: 1, // 기본 병원 ID
        date: selectedDate, // 백엔드에서 appointment_date로 변환됨
        time: selectedTime, // 백엔드에서 appointment_time으로 변환됨
        diagnosisRequestId: selectedDiagnosisRequest.id, // 백엔드에서 diagnosis_request_id로 변환됨
        consultationType: '일반진료', // 백엔드 enum에 맞는 값 사용
        status: 'pending',
        symptoms: selectedDiagnosisRequest.symptoms, // 진료 요청서의 증상
        notes: selectedDiagnosisRequest.additionalNotes || '' // 진료 요청서의 추가 메모
      }
      
      console.log('📅 예약 생성 중...', appointmentData)
      console.log('🔍 선택된 진료 요청서:', selectedDiagnosisRequest)
      const result = await appointmentService.createAppointment(appointmentData)
      
      console.log('✅ 예약 생성 완료:', result)
      
      Alert.alert(
        "예약 완료",
        `${doctorName} 선생님과 ${selectedDate} ${selectedTime}에 비대면 진료 예약이 완료되었습니다.\n\n선택된 진료 요청서: ${selectedDiagnosisRequest.symptoms.substring(0, 30)}...`,
        [
          {
            text: "확인",
            onPress: () => navigation.goBack(),
          },
        ],
      )
    } catch (error) {
      console.error('❌ 예약 생성 실패:', error)
      Alert.alert(
        "예약 실패", 
        "예약 중 오류가 발생했습니다. 다시 시도해주세요.",
        [
          {
            text: "확인"
          },
        ],
      )
    } finally {
      setLoading(false)
    }
  }

  // 시간 포맷 변환 (24시간 -> 12시간)
  const formatTime = (time: string) => {
    const [hour, minute] = time.split(":")
    const hourNum = Number.parseInt(hour)

    if (hourNum < 12) {
      return `오전 ${hourNum}:${minute}`
    } else if (hourNum === 12) {
      return `오후 12:${minute}`
    } else {
      return `오후 ${hourNum - 12}:${minute}`
    }
  }

  // 날짜 포맷 변환 (YYYY-MM-DD -> YYYY년 MM월 DD일)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    return `${year}년 ${month}월 ${day}일`
  }

  // 심각도 텍스트 변환
  const getSeverityText = (severity: "mild" | "moderate" | "severe") => {
    switch (severity) {
      case "mild": return "경미함"
      case "moderate": return "보통"  
      case "severe": return "심각함"
      default: return ""
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} >
          
        </TouchableOpacity>
        <Text style={styles.headerTitle}>비대면 진료 예약</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 의사 정보 */}
        <View style={styles.doctorInfoCard}>
          <Image source={require("../assets/doctor1.png")} style={styles.doctorImage} />
          <Text style={styles.doctorName}>{doctorName}</Text>
          <Text style={styles.doctorSpecialty}>{specialty}</Text>
          <View style={styles.telemedicineBadge}>
            <Text style={styles.telemedicineBadgeText}>비대면 진료</Text>
          </View>
        </View>

        {/* 예약 안내 */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>비대면 진료 안내</Text>
          <Text style={styles.infoText}>• 화상 통화를 통한 원격 진료를 제공합니다.</Text>
          <Text style={styles.infoText}>• 예약은 30일 이내에만 가능합니다.</Text>
          <Text style={styles.infoText}>• 예약 취소는 24시간 전까지 가능합니다.</Text>
          <Text style={styles.infoText}>• 진료 시간은 약 15-20분 소요됩니다.</Text>
        </View>

        {/* 진료 요청서 선택 */}
        <View style={styles.diagnosisRequestContainer}>
          <Text style={styles.sectionTitle}>진료 요청서 선택 *</Text>
          {loadingRequests ? (
            <ActivityIndicator size="large" color="#FF9A9E" style={styles.loader} />
          ) : diagnosisRequests.length > 0 ? (
            <>
              {diagnosisRequests.map((request) => (
                <TouchableOpacity
                  key={request.id}
                  style={[
                    styles.diagnosisRequestItem,
                    selectedDiagnosisRequest?.id === request.id && styles.diagnosisRequestItemSelected
                  ]}
                  onPress={() => handleSelectDiagnosisRequest(request)}
                >
                  <View style={styles.diagnosisRequestHeader}>
                    <Text style={styles.diagnosisRequestDate}>
                      {new Date(request.createdAt).toLocaleDateString('ko-KR')}
                    </Text>
                    <View style={[styles.severityBadge, { backgroundColor: request.severity === 'mild' ? '#4CAF50' : request.severity === 'moderate' ? '#FF9800' : '#F44336' }]}>
                      <Text style={styles.severityBadgeText}>
                        {getSeverityText(request.severity)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.diagnosisRequestSymptoms} numberOfLines={2}>
                    {request.symptoms}
                  </Text>
                  <Text style={styles.diagnosisRequestDuration}>
                    지속기간: {request.duration}
                  </Text>
                  {selectedDiagnosisRequest?.id === request.id && (
                    <View style={styles.selectedIndicator}>
                      <Text style={styles.selectedIndicatorText}>✓ 선택됨</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              
              {/* 새 진료 요청서 작성 버튼 */}
              <TouchableOpacity 
                style={styles.createNewRequestButton}
                onPress={handleCreateNewDiagnosisRequest}
              >
                <Text style={styles.createNewRequestText}>+ 새 진료 요청서 작성</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.noRequestsContainer}>
              <Text style={styles.noRequestsText}>등록된 진료 요청서가 없습니다.</Text>
              <TouchableOpacity 
                style={styles.createFirstRequestButton}
                onPress={handleCreateNewDiagnosisRequest}
              >
                <Text style={styles.createFirstRequestText}>첫 진료 요청서 작성하기</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 달력 */}
        <View style={styles.calendarContainer}>
          <Text style={styles.sectionTitle}>날짜 선택</Text>
          <Calendar
            minDate={todayString}
            maxDate={maxDateString}
            onDayPress={handleDateSelect}
            markedDates={markedDates}
            theme={{
              selectedDayBackgroundColor: "#FF9A9E",
              todayTextColor: "#FF9A9E",
              arrowColor: "#FF9A9E",
              dotColor: "#FF9A9E",
              textDayFontWeight: "500",
              textMonthFontWeight: "bold",
              textDayHeaderFontWeight: "500",
            }}
          />
        </View>

        {/* 시간 선택 */}
        {selectedDate && (
          <View style={styles.timeSelectionContainer}>
            <Text style={styles.sectionTitle}>시간 선택</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#FF9A9E" style={styles.loader} />
            ) : availableTimes.length > 0 ? (
              <View style={styles.timeGrid}>
                {availableTimes.map((time, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.timeButton, selectedTime === time && styles.timeButtonSelected]}
                    onPress={() => handleTimeSelect(time)}
                  >
                    <Text style={[styles.timeButtonText, selectedTime === time && styles.timeButtonTextSelected]}>
                      {formatTime(time)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.noTimesText}>선택한 날짜에 예약 가능한 시간이 없습니다.</Text>
            )}
          </View>
        )}

        {/* 하단 여백 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* 예약 확정 버튼 */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={[styles.confirmButton, (!selectedDate || !selectedTime || !selectedDiagnosisRequest) && styles.confirmButtonDisabled]}
          onPress={handleConfirmAppointment}
          disabled={!selectedDate || !selectedTime || !selectedDiagnosisRequest || loading}
        >
          <LinearGradient
            colors={["#FF9A9E", "#FAD0C4"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.confirmButtonGradient}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.confirmButtonText}>비대면 진료 예약 확정</Text>
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
  placeholder: {
    width: 40,
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
    alignItems: "center",
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 5,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: "#6C757D",
  },
  telemedicineBadge: {
    backgroundColor: "#FF9A9E",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 10,
  },
  telemedicineBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  infoCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9A9E",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#6C757D",
    marginBottom: 5,
  },
  diagnosisRequestContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 15,
  },
  diagnosisRequestItem: {
    padding: 10,
    borderWidth: 2,
    borderColor: "#E9ECEF",
    borderRadius: 8,
    marginBottom: 10,
  },
  diagnosisRequestItemSelected: {
    borderColor: "#FF9A9E",
  },
  diagnosisRequestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  diagnosisRequestDate: {
    fontSize: 14,
    color: "#6C757D",
  },
  severityBadge: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
  },
  severityBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  diagnosisRequestSymptoms: {
    fontSize: 14,
    color: "#212529",
  },
  diagnosisRequestDuration: {
    fontSize: 12,
    color: "#6C757D",
    marginTop: 5,
  },
  selectedIndicator: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#FF9A9E",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedIndicatorText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  createNewRequestButton: {
    padding: 10,
    borderWidth: 2,
    borderColor: "#FF9A9E",
    borderRadius: 8,
    alignItems: "center",
  },
  createNewRequestText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF9A9E",
  },
  noRequestsContainer: {
    padding: 20,
    alignItems: "center",
  },
  noRequestsText: {
    fontSize: 14,
    color: "#6C757D",
    marginBottom: 20,
  },
  createFirstRequestButton: {
    padding: 10,
    borderWidth: 2,
    borderColor: "#FF9A9E",
    borderRadius: 8,
    alignItems: "center",
  },
  createFirstRequestText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF9A9E",
  },
  calendarContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timeSelectionContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  timeButton: {
    width: "31%",
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  timeButtonSelected: {
    backgroundColor: "#FF9A9E",
    borderColor: "#FF9A9E",
  },
  timeButtonText: {
    fontSize: 12,
    color: "#6C757D",
  },
  timeButtonTextSelected: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  noTimesText: {
    fontSize: 14,
    color: "#6C757D",
    textAlign: "center",
    paddingVertical: 20,
  },
  loader: {
    marginVertical: 20,
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
  confirmButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonGradient: {
    paddingVertical: 15,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default AppointmentScreen
