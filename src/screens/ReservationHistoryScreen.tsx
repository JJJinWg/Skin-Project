// 사용자의 예약내역 확인 및 관리 화면

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native"
import { type NavigationProp, useNavigation } from "@react-navigation/native"
import type { RootStackParamList } from "../types/navigation"
import LinearGradient from "react-native-linear-gradient"
import { appointmentService } from "../services/appointmentService"

type AppointmentStatus = "예약완료" | "진료완료" | "예약취소" | "노쇼"

type AppointmentHistory = {
  id: number
  doctorId: number
  doctorName: string
  doctorImage: any
  specialty: string
  date: string
  time: string
  symptoms: string
  status: AppointmentStatus
  createdAt: string
  updatedAt?: string
}

const ReservationHistoryScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const [appointments, setAppointments] = useState<AppointmentHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed" | "canceled">("all")

  // 예약 내역 가져오기
  const loadAppointments = async () => {
    try {
      setLoading(true)
      
      // 실제 서비스에서 예약 내역 조회
      const appointmentsData = await appointmentService.getAppointments()
      
      // 의사 정보와 함께 매핑
      const appointmentsWithDoctorInfo = await Promise.all(
        appointmentsData.map(async (appointment) => {
          try {
            const doctor = await appointmentService.getDoctorById(appointment.doctorId)
            return {
              id: appointment.id,
              doctorId: appointment.doctorId,
              doctorName: doctor?.name || `Doctor ${appointment.doctorId}`,
              doctorImage: doctor?.image || require("../assets/doctor1.png"),
              specialty: doctor?.specialty || appointment.specialty || "일반의",
              date: appointment.date,
              time: appointment.time,
              symptoms: appointment.symptoms,
              status: appointment.status as AppointmentStatus,
              createdAt: appointment.createdAt,
              updatedAt: appointment.updatedAt,
            }
          } catch (error) {
            console.error(`의사 정보 조회 실패 (ID: ${appointment.doctorId}):`, error)
            return {
              id: appointment.id,
              doctorId: appointment.doctorId,
              doctorName: `Doctor ${appointment.doctorId}`,
              doctorImage: require("../assets/doctor1.png"),
              specialty: appointment.specialty || "일반의",
              date: appointment.date,
              time: appointment.time,
              symptoms: appointment.symptoms,
              status: appointment.status as AppointmentStatus,
              createdAt: appointment.createdAt,
              updatedAt: appointment.updatedAt,
            }
          }
        })
      )
      
      setAppointments(appointmentsWithDoctorInfo)
    } catch (error) {
      console.error('예약 내역 조회 실패:', error)
      Alert.alert('오류', '예약 내역을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 새로고침
  const handleRefresh = async () => {
    setRefreshing(true)
    await loadAppointments()
    setRefreshing(false)
  }

  // 초기 데이터 로드
  useEffect(() => {
    loadAppointments()
  }, [])

  // 필터링된 예약 목록
  const filteredAppointments = appointments.filter(appointment => {
    if (filter === "all") return true
    if (filter === "upcoming") return appointment.status === "예약완료"
    if (filter === "completed") return appointment.status === "진료완료"
    if (filter === "canceled") return appointment.status === "예약취소" || appointment.status === "노쇼"
    return true
  })

  // 날짜 포맷 변환
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${year}년 ${month}월 ${day}일`
  }

  // 시간 포맷 변환
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

  // 예약 취소
  const handleCancelAppointment = async (appointmentId: number) => {
    Alert.alert(
      "예약 취소",
      "이 예약을 취소하시겠습니까?",
      [
        { text: "아니오", style: "cancel" },
        {
          text: "예",
          onPress: async () => {
            try {
              // 실제 서비스를 통한 예약 취소
              await appointmentService.cancelAppointment(appointmentId)
              
              // 로컬 상태 업데이트
              const updatedAppointments = appointments.map(apt =>
                apt.id === appointmentId 
                  ? { ...apt, status: "예약취소" as AppointmentStatus, updatedAt: new Date().toISOString() }
                  : apt
              )
              setAppointments(updatedAppointments)
              Alert.alert("알림", "예약이 취소되었습니다.")
            } catch (error) {
              console.error('예약 취소 실패:', error)
              Alert.alert("오류", "예약 취소에 실패했습니다. 다시 시도해주세요.")
            }
          },
        },
      ]
    )
  }

  // 일정 변경 (재예약)
  const handleReschedule = (appointment: AppointmentHistory) => {
    navigation.navigate("AppointmentScreen", {
      doctorId: appointment.doctorId,
      doctorName: appointment.doctorName,
      specialty: appointment.specialty,
    })
  }

  // 상태별 색상
  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case "예약완료":
        return "#4CAF50"
      case "진료완료":
        return "#2196F3"
      case "예약취소":
        return "#F44336"
      case "노쇼":
        return "#FF9800"
      default:
        return "#757575"
    }
  }

  // 뒤로가기
  const handleBackPress = () => {
    navigation.goBack()
  }

  // 새 예약하기
  const handleNewAppointment = () => {
    navigation.navigate("ReservationScreen")
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>예약 내역</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshButtonText}>새로고침</Text>
        </TouchableOpacity>
      </View>

      {/* 필터 탭 */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === "all" && styles.filterTabActive]}
          onPress={() => setFilter("all")}
        >
          <Text style={[styles.filterTabText, filter === "all" && styles.filterTabTextActive]}>
            전체
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === "upcoming" && styles.filterTabActive]}
          onPress={() => setFilter("upcoming")}
        >
          <Text style={[styles.filterTabText, filter === "upcoming" && styles.filterTabTextActive]}>
            예정
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === "completed" && styles.filterTabActive]}
          onPress={() => setFilter("completed")}
        >
          <Text style={[styles.filterTabText, filter === "completed" && styles.filterTabTextActive]}>
            완료
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === "canceled" && styles.filterTabActive]}
          onPress={() => setFilter("canceled")}
        >
          <Text style={[styles.filterTabText, filter === "canceled" && styles.filterTabTextActive]}>
            취소
          </Text>
        </TouchableOpacity>
      </View>

      {/* 예약 목록 */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF9A9E" />
          <Text style={styles.loadingText}>예약 내역을 불러오는 중...</Text>
        </View>
      ) : filteredAppointments.length > 0 ? (
        <FlatList
          data={filteredAppointments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.appointmentCard}>
              <View style={styles.appointmentHeader}>
                <Image source={item.doctorImage} style={styles.doctorImage} />
                <View style={styles.appointmentInfo}>
                  <View style={styles.doctorNameRow}>
                    <Text style={styles.doctorName}>{item.doctorName}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                      <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.specialty}>{item.specialty}</Text>
                  <Text style={styles.dateTime}>
                    {formatDate(item.date)} {formatTime(item.time)}
                  </Text>
                </View>
              </View>

              <View style={styles.symptomsContainer}>
                <Text style={styles.symptomsLabel}>증상:</Text>
                <Text style={styles.symptomsText} numberOfLines={2}>
                  {item.symptoms}
                </Text>
              </View>

              {item.status === "예약완료" && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.rescheduleButton}
                    onPress={() => handleReschedule(item)}
                  >
                    <Text style={styles.rescheduleButtonText}>일정 변경</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => handleCancelAppointment(item.id)}
                  >
                    <Text style={styles.cancelButtonText}>예약 취소</Text>
                  </TouchableOpacity>
                </View>
              )}

              {item.status === "진료완료" && (
                <TouchableOpacity
                  style={styles.reviewButton}
                  onPress={() => Alert.alert("알림", "리뷰 작성 기능은 준비 중입니다.")}
                >
                  <Text style={styles.reviewButtonText}>리뷰 작성</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          contentContainerStyle={styles.appointmentsList}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {filter === "all" ? "예약 내역이 없습니다." : 
             filter === "upcoming" ? "예정된 예약이 없습니다." :
             filter === "completed" ? "완료된 진료가 없습니다." :
             "취소된 예약이 없습니다."}
          </Text>
          <Text style={styles.emptySubtext}>새로운 예약을 만들어보세요.</Text>
          <TouchableOpacity style={styles.newAppointmentButton} onPress={handleNewAppointment}>
            <LinearGradient
              colors={["#FF9A9E", "#FAD0C4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.newAppointmentButtonGradient}
            >
              <Text style={styles.newAppointmentButtonText}>새 예약하기</Text>
            </LinearGradient>
          </TouchableOpacity>
    </View>
      )}
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
  refreshButton: {
    padding: 5,
  },
  refreshButtonText: {
    fontSize: 14,
    color: "#FF9A9E",
    fontWeight: "500",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
  },
  filterTabActive: {
    backgroundColor: "#FF9A9E",
  },
  filterTabText: {
    fontSize: 14,
    color: "#6C757D",
    fontWeight: "500",
  },
  filterTabTextActive: {
    color: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6C757D",
  },
  appointmentsList: {
    padding: 20,
  },
  appointmentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: "row",
    marginBottom: 15,
  },
  doctorImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  appointmentInfo: {
    flex: 1,
  },
  doctorNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  specialty: {
    fontSize: 14,
    color: "#6C757D",
    marginBottom: 4,
  },
  dateTime: {
    fontSize: 14,
    color: "#495057",
    fontWeight: "500",
  },
  symptomsContainer: {
    marginBottom: 15,
  },
  symptomsLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#495057",
    marginBottom: 4,
  },
  symptomsText: {
    fontSize: 14,
    color: "#6C757D",
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rescheduleButton: {
    flex: 1,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF9A9E",
    alignItems: "center",
  },
  rescheduleButtonText: {
    fontSize: 14,
    color: "#FF9A9E",
    fontWeight: "500",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 10,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    color: "#6C757D",
    fontWeight: "500",
  },
  reviewButton: {
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
  },
  reviewButtonText: {
    fontSize: 14,
    color: "#1976D2",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#495057",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6C757D",
    marginBottom: 30,
    textAlign: "center",
  },
  newAppointmentButton: {
    borderRadius: 12,
    overflow: "hidden",
    width: "80%",
  },
  newAppointmentButtonGradient: {
    paddingVertical: 15,
    alignItems: "center",
  },
  newAppointmentButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default ReservationHistoryScreen