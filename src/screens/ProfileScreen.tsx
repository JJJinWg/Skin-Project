//내 정보 화면, 기본 정보,예약내역,리뷰 내역,진단 내역,설정 탭으로 구성
// 로그인 안했을시 로그인 유도 화면 표시

import React, { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  Switch,
  FlatList,
  Alert,
} from "react-native"
import { type NavigationProp, useNavigation, useFocusEffect, useRoute, type RouteProp } from "@react-navigation/native"
import type { RootStackParamList } from "../types/navigation"
import LinearGradient from "react-native-linear-gradient"
import { useDispatch } from 'react-redux'
import { logout } from '../store/authSlice'
import { appointmentService } from '../services/appointmentService'
import { diagnosisService } from '../services/diagnosisService'
import { reviewService } from '../services/reviewService'
import { userService, type UserInfo as ServiceUserInfo } from '../services/userService'
import type { Appointment as ServiceAppointment } from '../data/dummyData'

type Appointment = {
  id: number
  doctorName: string
  specialty: string
  date: string
  time: string
  status: "upcoming" | "completed" | "canceled"
}

type UserInfo = ServiceUserInfo

// 리뷰 타입 정의
type Review = {
  id: number
  productId: number
  productName: string
  productImage: any
  rating: number
  content: string
  date: string
  images?: string[]
  likes: number
  helpful: number
}

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const route = useRoute<RouteProp<{ params?: { updatedUserInfo?: UserInfo } }, "params">>()
  const [activeTab, setActiveTab] = useState<"info" | "appointments" | "reviews" | "diagnoses" | "settings">("info")
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [darkModeEnabled, setDarkModeEnabled] = useState(false)
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [diagnoses, setDiagnoses] = useState<any[]>([])
  const [diagnosesLoading, setDiagnosesLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(true) // 로그인 상태 (실제로는 전역 상태나 AsyncStorage에서 가져와야 함) 일단 테스트할때는 true로 설정
  const dispatch = useDispatch()

  // 사용자 정보 (실제로는 API에서 가져옴)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)

  // 예약 내역 (실제로는 API에서 가져옴)
  const [appointments, setAppointments] = useState<Appointment[]>([])

  // 리뷰 내역 (실제로는 API에서 가져옴)
  const [reviews, setReviews] = useState<Review[]>([])

  const dispatch = useDispatch()

  // 사용자 정보 가져오기

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const userData = await userService.getCurrentUser()
        setUserInfo(userData)
      } catch (error) {
        console.error('사용자 정보 조회 실패:', error)
      }
    }
    
    loadUserInfo()
  }, [])

  // 예약 내역 가져오기
  useEffect(() => {
    const loadAppointments = async () => {
      setLoading(true)
      try {
        // 실제 서비스에서 예약 내역 조회 (최근 3개만)
        const appointmentsData = await appointmentService.getAppointments()
        
        // 최근 3개만 가져와서 상태 매핑
        const recentAppointments: Appointment[] = appointmentsData
          .slice(0, 3)
          .map((appointment: ServiceAppointment) => ({
            id: appointment.id,
            doctorName: appointment.doctorName,
            specialty: appointment.specialty || "일반의",
            date: appointment.date,
            time: appointment.time,
            status: appointment.status === "예약완료" ? "upcoming" : 
                   appointment.status === "진료완료" ? "completed" : "canceled"
          }))
        
        setAppointments(recentAppointments)
      } catch (error) {
        console.error('예약 내역 조회 실패:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadAppointments()
  }, [])

  // 리뷰 내역 가져오기
  useEffect(() => {
    const loadReviews = async () => {
      setReviewsLoading(true)
      try {
        // 실제 서비스에서 사용자 리뷰 목록 조회
        const reviewsData = await reviewService.getUserReviews()
        setReviews(reviewsData)
      } catch (error) {
        console.error('리뷰 내역 조회 실패:', error)
        setReviews([])
      } finally {
        setReviewsLoading(false)
      }
    }
    
    loadReviews()
  }, [])

  // 진단 내역 가져오기
  useEffect(() => {
    const loadDiagnoses = async () => {
      setDiagnosesLoading(true)
      try {
        // 실제 서비스에서 진료 요청서 목록 조회
        const diagnosisRequests = await diagnosisService.getDiagnosisRequests()
        
        // 진료 요청서를 진단 내역 형태로 변환 (최근 5개만)
        const diagnosesData = diagnosisRequests
          .slice(0, 5)
          .map(request => ({
            id: request.id || 0,
            doctorId: request.assignedDoctorId || 1,
            doctorName: request.assignedDoctorName || "담당의사",
            doctorImage: require("../assets/doctor1.png"),
            specialty: "피부과",
            date: request.createdAt.split('T')[0],
            symptoms: request.symptoms,
            diagnosisContent: request.status === "완료" ? 
              "진료 요청서가 검토되어 진단이 완료되었습니다." : 
              `진료 요청서가 ${request.status} 상태입니다.`,
            treatment: request.status === "완료" ? 
              "처방전 및 치료 방법이 별도로 안내됩니다." : 
              "검토 완료 후 치료 방법을 안내해드립니다.",
            prescriptions: request.status === "완료" ? ["처방전 확인 필요"] : [],
            followUpRequired: request.status === "완료",
            status: request.status,
            severity: request.severity,
            duration: request.duration,
          }))
        
        setDiagnoses(diagnosesData)
      } catch (error) {
        console.error('진단 내역 조회 실패:', error)
        setDiagnoses([])
      } finally {
        setDiagnosesLoading(false)
      }
    }
    
    loadDiagnoses()
  }, [])

  // 화면이 포커스될 때마다 실행되는 효과
  useFocusEffect(
    useCallback(() => {
      // 업데이트된 사용자 정보가 있으면 적용
      if (route.params?.updatedUserInfo) {
        setUserInfo(route.params.updatedUserInfo)

        // 네비게이션 파라미터 초기화 (중복 적용 방지)
        navigation.setParams({ updatedUserInfo: undefined })
      }
    }, [route.params, navigation]),
  )

  // 날짜 포맷 변환 (YYYY-MM-DD -> YYYY년 MM월 DD일)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    return `${year}년 ${month}월 ${day}일`
  }

  // 로그아웃 처리
  const handleLogout = () => {
    Alert.alert(
      "로그아웃",
      "정말 로그아웃 하시겠습니까?",
      [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "로그아웃",
          onPress: () => {
            // 실제로는 로그아웃 API 호출 후 로그인 화면으로 이동
            navigation.navigate("LoginForm")
          },
        },
      ],
      { cancelable: true },
    )
  }

  // 계정 삭제 처리
  const handleDeleteAccount = () => {
    Alert.alert(
      "계정 삭제",
      "계정을 삭제하시면 모든 데이터가 영구적으로 삭제됩니다. 정말 삭제하시겠습니까?",
      [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => {
            // 실제로는 계정 삭제 API 호출 후 로그인 화면으로 이동
            Alert.alert("계정이 삭제되었습니다.")
            navigation.navigate("LoginForm")
          },
        },
      ],
      { cancelable: true },
    )
  }

  // 예약 취소 처리
  const handleCancelAppointment = async (id: number) => {
    Alert.alert(
      "예약 취소",
      "이 예약을 취소하시겠습니까?",
      [
        {
          text: "아니오",
          style: "cancel",
        },
        {
          text: "예",
          onPress: async () => {
            try {
              // 실제 서비스를 통한 예약 취소
              await appointmentService.cancelAppointment(id)
              
              // 로컬 상태 업데이트
              const updatedAppointments = appointments.map((appointment) =>
                appointment.id === id ? { ...appointment, status: "canceled" as const } : appointment,
              )
              setAppointments(updatedAppointments)
              Alert.alert("예약이 취소되었습니다.")
            } catch (error) {
              console.error('예약 취소 실패:', error)
              Alert.alert("오류", "예약 취소에 실패했습니다. 다시 시도해주세요.")
            }
          },
        },
      ],
      { cancelable: true },
    )
  }

  // 리뷰 삭제 처리
  const handleDeleteReview = async (id: number) => {
    Alert.alert(
      "리뷰 삭제",
      "이 리뷰를 삭제하시겠습니까?",
      [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "삭제",
          onPress: async () => {
            try {
              // 실제 서비스를 통한 리뷰 삭제
              const result = await reviewService.deleteReview(id)
              
              if (result.success) {
                // 로컬 상태 업데이트
                const updatedReviews = reviews.filter((review) => review.id !== id)
                setReviews(updatedReviews)
                Alert.alert("알림", result.message)
              } else {
                Alert.alert("오류", result.message)
              }
            } catch (error) {
              console.error('리뷰 삭제 실패:', error)
              Alert.alert("오류", "리뷰 삭제에 실패했습니다. 다시 시도해주세요.")
            }
          },
        },
      ],
      { cancelable: true },
    )
  }

  // 리뷰 수정 화면으로 이동
  const handleEditReview = (review: Review) => {
    navigation.navigate("EditReviewScreen", { review })
  }

  // 예약 상태에 따른 색상 반환
  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "#4CAF50" // 초록색
      case "completed":
        return "#2196F3" // 파란색
      case "canceled":
        return "#F44336" // 빨간색
      default:
        return "#757575" // 회색
    }
  }

  // 예약 상태 한글 변환
  const getStatusText = (status: string) => {
    switch (status) {
      case "upcoming":
        return "예정됨"
      case "completed":
        return "완료됨"
      case "canceled":
        return "취소됨"
      default:
        return ""
    }
  }

  // 별점 렌더링 함수
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating)
    const halfStar = rating - fullStars >= 0.5
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0)

    return (
      <View style={styles.starsContainer}>
        {[...Array(fullStars)].map((_, i) => (
          <Text key={`full-${i}`} style={styles.starIcon}>
            ★
          </Text>
        ))}
        {halfStar && <Text style={styles.starIcon}>★</Text>}
        {[...Array(emptyStars)].map((_, i) => (
          <Text key={`empty-${i}`} style={[styles.starIcon, styles.emptyStar]}>
            ★
          </Text>
        ))}
      </View>
    )
  }

  // 프로필 이미지 변경
  const handleChangeProfileImage = () => {
    if (userInfo) {
      navigation.navigate("EditProfileScreen", { userInfo })
    }
  }

  // 뒤로가기 처리 - 홈 화면으로 이동
  const handleBackPress = () => {
    navigation.navigate("HomeScreen")
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} >
          
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내 정보</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 프로필 헤더 */}
      <View style={styles.profileHeader}>
        <TouchableOpacity style={styles.profileImageContainer} onPress={handleChangeProfileImage}>
          <Image source={userInfo?.profileImage || require("../assets/doctor1.png")} style={styles.profileImage} />
          <View style={styles.editIconContainer}>
            <Text style={styles.editIcon}>✎</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.profileName}>{userInfo?.name || '사용자'}</Text>
        <Text style={styles.profileEmail}>{userInfo?.email || ''}</Text>
      </View>

      {/* 탭 메뉴 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "info" && styles.activeTabButton]}
          onPress={() => setActiveTab("info")}
        >
          <Text style={[styles.tabButtonText, activeTab === "info" && styles.activeTabButtonText]}>기본 정보</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "appointments" && styles.activeTabButton]}
          onPress={() => setActiveTab("appointments")}
        >
          <Text style={[styles.tabButtonText, activeTab === "appointments" && styles.activeTabButtonText]}>
            예약 내역
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "reviews" && styles.activeTabButton]}
          onPress={() => setActiveTab("reviews")}
        >
          <Text style={[styles.tabButtonText, activeTab === "reviews" && styles.activeTabButtonText]}>리뷰 내역</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "diagnoses" && styles.activeTabButton]}
          onPress={() => setActiveTab("diagnoses")}
        >
          <Text style={[styles.tabButtonText, activeTab === "diagnoses" && styles.activeTabButtonText]}>진단 내역</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "settings" && styles.activeTabButton]}
          onPress={() => setActiveTab("settings")}
        >
          <Text style={[styles.tabButtonText, activeTab === "settings" && styles.activeTabButtonText]}>설정</Text>
        </TouchableOpacity>
      </View>

      {/* 탭 콘텐츠 */}
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* 기본 정보 탭 */}
        {activeTab === "info" && (
          <View style={styles.infoContainer}>
            {userInfo ? (
              <>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>이름</Text>
                    <Text style={styles.infoValue}>{userInfo.name}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>이메일</Text>
                    <Text style={styles.infoValue}>{userInfo.email}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>전화번호</Text>
                    <Text style={styles.infoValue}>{userInfo.phone}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>생년월일</Text>
                    <Text style={styles.infoValue}>{formatDate(userInfo.birthdate)}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => navigation.navigate("EditProfileScreen", { userInfo })}
                >
                  <LinearGradient
                    colors={["#FF9A9E", "#FAD0C4"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.editButtonGradient}
                  >
                    <Text style={styles.editButtonText}>정보 수정</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>사용자 정보를 불러오는 중...</Text>
              </View>
            )}
          </View>
        )}

        {/* 예약 내역 탭 */}
        {activeTab === "appointments" && (
          <View style={styles.appointmentsContainer}>
            <View style={styles.appointmentsHeader}>
              <Text style={styles.appointmentsTitle}>최근 예약 내역</Text>
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => navigation.navigate("ReservationHistoryScreen")}
              >
                <Text style={styles.viewAllButtonText}>전체 보기</Text>
              </TouchableOpacity>
            </View>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>예약 내역을 불러오는 중...</Text>

              </View>
            </TouchableOpacity>
            <Text style={styles.profileName}>{userInfo.name}</Text>
            <Text style={styles.profileEmail}>{userInfo.email}</Text>
          </View>

          {/* 탭 메뉴 */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "info" && styles.activeTabButton]}
              onPress={() => setActiveTab("info")}
            >
              <Text style={[styles.tabButtonText, activeTab === "info" && styles.activeTabButtonText]}>기본 정보</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "appointments" && styles.activeTabButton]}
              onPress={() => setActiveTab("appointments")}
            >
              <Text style={[styles.tabButtonText, activeTab === "appointments" && styles.activeTabButtonText]}>
                예약 내역
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "reviews" && styles.activeTabButton]}
              onPress={() => setActiveTab("reviews")}
            >
              <Text style={[styles.tabButtonText, activeTab === "reviews" && styles.activeTabButtonText]}>
                리뷰 내역
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "diagnoses" && styles.activeTabButton]}
              onPress={() => setActiveTab("diagnoses")}
            >
              <Text style={[styles.tabButtonText, activeTab === "diagnoses" && styles.activeTabButtonText]}>
                진단 내역
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "settings" && styles.activeTabButton]}
              onPress={() => setActiveTab("settings")}
            >
              <Text style={[styles.tabButtonText, activeTab === "settings" && styles.activeTabButtonText]}>설정</Text>
            </TouchableOpacity>
          </View>

          {/* 탭 콘텐츠 */}
          <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
            {/* 기본 정보 탭 */}
            {activeTab === "info" && (
              <View style={styles.infoContainer}>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>이름</Text>
                    <Text style={styles.infoValue}>{userInfo.name}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>이메일</Text>
                    <Text style={styles.infoValue}>{userInfo.email}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>전화번호</Text>
                    <Text style={styles.infoValue}>{userInfo.phone}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>생년월일</Text>
                    <Text style={styles.infoValue}>{formatDate(userInfo.birthdate)}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => navigation.navigate("EditProfileScreen", { userInfo })}
                >
                  <LinearGradient
                    colors={["#FF9A9E", "#FAD0C4"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.editButtonGradient}
                  >
                    <Text style={styles.editButtonText}>정보 수정</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* 예약 내역 탭 */}
            {activeTab === "appointments" && (
              <View style={styles.appointmentsContainer}>
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>예약 내역을 불러오는 중...</Text>
                  </View>
                ) : appointments.length > 0 ? (
                  <FlatList
                    data={appointments}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <View style={styles.appointmentCard}>
                        <View style={styles.appointmentHeader}>
                          <Text style={styles.doctorName}>{item.doctorName}</Text>
                          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                          </View>
                        </View>
                        <Text style={styles.specialty}>{item.specialty}</Text>
                        <View style={styles.appointmentDetails}>
                          <Text style={styles.appointmentDate}>
                            {formatDate(item.date)} {item.time}
                          </Text>
                        </View>
                        {item.status === "upcoming" && (
                          <View style={styles.appointmentActions}>
                            <TouchableOpacity
                              style={styles.rescheduleButton}
                              onPress={() => Alert.alert("일정 변경", "이 기능은 아직 구현되지 않았습니다.")}
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
                      </View>
                    )}
                    contentContainerStyle={styles.appointmentsList}
                    showsVerticalScrollIndicator={false}
                  />
                ) : (
                  <View style={styles.noAppointmentsContainer}>
                    <Text style={styles.noAppointmentsText}>예약 내역이 없습니다.</Text>
                    <TouchableOpacity
                      style={styles.makeAppointmentButton}
                      onPress={() => navigation.navigate("ReservationScreen")}
                    >
                      <LinearGradient
                        colors={["#FF9A9E", "#FAD0C4"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.makeAppointmentButtonGradient}
                      >
                        <Text style={styles.makeAppointmentButtonText}>예약하기</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}


        {/* 진단 내역 탭 */}
        {activeTab === "diagnoses" && (
          <View style={styles.diagnosesContainer}>
            {diagnosesLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>진단 내역을 불러오는 중...</Text>
              </View>
            ) : diagnoses.length > 0 ? (
              <View style={styles.diagnosisList}>
                {diagnoses.map((item) => (
                  <View key={item.id.toString()} style={styles.diagnosisCard}>
                    <View style={styles.diagnosisHeader}>
                      <Image source={item.doctorImage} style={styles.doctorImageSmall} />
                      <View style={styles.diagnosisHeaderInfo}>
                        <Text style={styles.doctorName}>{item.doctorName}</Text>
                        <Text style={styles.specialty}>{item.specialty}</Text>
                        <Text style={styles.diagnosisDate}>{formatDate(item.date)}</Text>
                      </View>
                    )}
                    contentContainerStyle={styles.reviewsList}
                    showsVerticalScrollIndicator={false}
                  />
                ) : (
                  <View style={styles.noReviewsContainer}>
                    <Text style={styles.noReviewsText}>작성한 리뷰가 없습니다.</Text>
                    <TouchableOpacity
                      style={styles.writeReviewButton}
                      onPress={() => navigation.navigate("ProductReviewScreen")}
                    >
                      <LinearGradient
                        colors={["#FF9A9E", "#FAD0C4"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.writeReviewButtonGradient}
                      >
                        <Text style={styles.writeReviewButtonText}>제품 둘러보기</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noDiagnosisContainer}>
                <Text style={styles.noDiagnosisText}>진단 내역이 없습니다.</Text>
                <Text style={styles.noDiagnosisSubtext}>의사의 진단을 받은 후에 이곳에서 확인할 수 있습니다.</Text>
                <TouchableOpacity
                  style={styles.makeAppointmentButton}
                  onPress={() => navigation.navigate("ReservationScreen")}
                >
                  <LinearGradient
                    colors={["#FF9A9E", "#FAD0C4"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.makeAppointmentButtonGradient}
                  >
                    <Text style={styles.makeAppointmentButtonText}>진료 예약하기</Text>
                  </LinearGradient>
                </TouchableOpacity>

              </View>
            )}

            {/* 진단 내역 탭 */}
            {activeTab === "diagnoses" && (
              <View style={styles.diagnosesContainer}>
                {diagnosesLoading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>진단 내역을 불러오는 중...</Text>
                  </View>
                ) : diagnoses.length > 0 ? (
                  <FlatList
                    data={diagnoses}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <View style={styles.diagnosisCard}>
                        <View style={styles.diagnosisHeader}>
                          <Image source={item.doctorImage} style={styles.doctorImageSmall} />
                          <View style={styles.diagnosisHeaderInfo}>
                            <Text style={styles.doctorName}>{item.doctorName}</Text>
                            <Text style={styles.specialty}>{item.specialty}</Text>
                            <Text style={styles.diagnosisDate}>{formatDate(item.date)}</Text>
                          </View>
                        </View>
                        <View style={styles.diagnosisSummary}>
                          <Text style={styles.diagnosisLabel}>주요 증상:</Text>
                          <Text style={styles.diagnosisText} numberOfLines={2}>
                            {item.symptoms}
                          </Text>
                        </View>
                        <View style={styles.diagnosisSummary}>
                          <Text style={styles.diagnosisLabel}>진단:</Text>
                          <Text style={styles.diagnosisText} numberOfLines={2}>
                            {item.diagnosisContent}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.viewDetailButton}
                          onPress={() => navigation.navigate("DiagnosisDetailScreen", { diagnosisId: item.id })}
                        >
                          <Text style={styles.viewDetailButtonText}>상세 보기</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    contentContainerStyle={styles.diagnosisList}
                    showsVerticalScrollIndicator={false}
                  />
                ) : (
                  <View style={styles.noDiagnosisContainer}>
                    <Text style={styles.noDiagnosisText}>진단 내역이 없습니다.</Text>
                    <Text style={styles.noDiagnosisSubtext}>의사의 진단을 받은 후에 이곳에서 확인할 수 있습니다.</Text>
                    <TouchableOpacity
                      style={styles.makeAppointmentButton}
                      onPress={() => navigation.navigate("ReservationScreen")}
                    >
                      <LinearGradient
                        colors={["#FF9A9E", "#FAD0C4"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.makeAppointmentButtonGradient}
                      >
                        <Text style={styles.makeAppointmentButtonText}>진료 예약하기</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* 설정 탭 */}
            {activeTab === "settings" && (
              <View style={styles.settingsContainer}>
                <View style={styles.settingsSection}>
                  <Text style={styles.settingsSectionTitle}>알림 설정</Text>
                  <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>알림 받기</Text>
                    <Switch
                      value={notificationsEnabled}
                      onValueChange={setNotificationsEnabled}
                      trackColor={{ false: "#E9ECEF", true: "#FF9A9E" }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                </View>

                <View style={styles.settingsSection}>
                  <Text style={styles.settingsSectionTitle}>앱 설정</Text>
                  <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>다크 모드</Text>
                    <Switch
                      value={darkModeEnabled}
                      onValueChange={setDarkModeEnabled}
                      trackColor={{ false: "#E9ECEF", true: "#FF9A9E" }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                  <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>생체 인증 사용</Text>
                    <Switch
                      value={biometricEnabled}
                      onValueChange={setBiometricEnabled}
                      trackColor={{ false: "#E9ECEF", true: "#FF9A9E" }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                </View>

                <View style={styles.settingsSection}>
                  <Text style={styles.settingsSectionTitle}>계정</Text>
                  <TouchableOpacity style={styles.settingButton} onPress={handleLogout}>
                    <Text style={styles.settingButtonText}>로그아웃</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.settingButton} onPress={handleDeleteAccount}>
                    <Text style={[styles.settingButtonText, styles.deleteAccountText]}>계정 삭제</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.settingsSection}>
                  <Text style={styles.settingsSectionTitle}>앱 정보</Text>
                  <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>버전</Text>
                    <Text style={styles.settingValue}>1.0.0</Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "#F8F9FA",
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
  profileHeader: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#FFFFFF",
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 15,
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
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: "#6C757D",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F5",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: "#FF9A9E",
  },
  tabButtonText: {
    fontSize: 14,
    color: "#6C757D",
  },
  activeTabButtonText: {
    color: "#FF9A9E",
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  // 기본 정보 탭 스타일
  infoContainer: {
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
  infoRow: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "center",
  },
  infoLabel: {
    width: 80,
    fontSize: 14,
    color: "#6C757D",
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: "#212529",
    fontWeight: "500",
  
  },
  
  editButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  editButtonGradient: {
    paddingVertical: 15,
    alignItems: "center",
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  // 예약 내역 탭 스타일
  appointmentsContainer: {
    flex: 1,
    padding: 20,
  },
  appointmentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  appointmentsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#FF9A9E",
  },
  viewAllButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 14,
    color: "#6C757D",
  },
  appointmentsList: {
    paddingBottom: 20,
  },
  appointmentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  specialty: {
    fontSize: 14,
    color: "#6C757D",
    marginBottom: 10,
  },
  appointmentDetails: {
    marginBottom: 10,
  },
  appointmentDate: {
    fontSize: 14,
    color: "#212529",
  },
  appointmentActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  rescheduleButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    marginRight: 10,
  },
  rescheduleButtonText: {
    fontSize: 12,
    color: "#6C757D",
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 12,
    color: "#EF4444",
  },
  noAppointmentsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  noAppointmentsText: {
    fontSize: 16,
    color: "#6C757D",
    marginBottom: 20,
  },
  makeAppointmentButton: {
    borderRadius: 12,
    overflow: "hidden",
    width: "100%",
  },
  makeAppointmentButtonGradient: {
    paddingVertical: 15,
    alignItems: "center",
  },
  makeAppointmentButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  // 리뷰 내역 탭 스타일
  reviewsContainer: {
    flex: 1,
    padding: 20,
  },
  reviewsList: {
    paddingBottom: 20,
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  reviewHeaderInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: "row",
    marginRight: 5,
  },
  starIcon: {
    fontSize: 14,
    color: "#FFC107",
    marginRight: 1,
  },
  emptyStar: {
    color: "#E9ECEF",
  },
  ratingText: {
    fontSize: 14,
    color: "#212529",
    marginLeft: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: "#6C757D",
  },
  reviewContent: {
    fontSize: 14,
    color: "#212529",
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewImagesContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  reviewStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F3F5",
  },
  reviewStatsText: {
    fontSize: 12,
    color: "#6C757D",
  },
  reviewActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  reviewActionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    marginLeft: 10,
  },
  reviewActionButtonText: {
    fontSize: 12,
    color: "#6C757D",
  },
  deleteButton: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FEE2E2",
  },
  deleteButtonText: {
    fontSize: 12,
    color: "#EF4444",
  },
  noReviewsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  noReviewsText: {
    fontSize: 16,
    color: "#6C757D",
    marginBottom: 20,
  },
  writeReviewButton: {
    borderRadius: 12,
    overflow: "hidden",
    width: "100%",
  },
  writeReviewButtonGradient: {
    paddingVertical: 15,
    alignItems: "center",
  },
  writeReviewButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  // 설정 탭 스타일
  settingsContainer: {
    padding: 20,
  },
  settingsSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingsSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F5",
  },
  settingLabel: {
    fontSize: 14,
    color: "#212529",
  },
  settingValue: {
    fontSize: 14,
    color: "#6C757D",
  },
  settingButton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F5",
  },
  settingButtonText: {
    fontSize: 14,
    color: "#212529",
  },
  deleteAccountText: {
    color: "#EF4444",
  },
  // 진단 내역 탭 스타일
  diagnosesContainer: {
    flex: 1,
    padding: 20,
  },
  diagnosisList: {
    paddingBottom: 20,
  },
  diagnosisCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  diagnosisHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  doctorImageSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  diagnosisHeaderInfo: {
    flex: 1,
    justifyContent: "center",
  },
  diagnosisDate: {
    fontSize: 12,
    color: "#ADB5BD",
  },
  diagnosisSummary: {
    marginBottom: 8,
  },
  diagnosisLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 4,
  },
  diagnosisText: {
    fontSize: 14,
    color: "#495057",
    lineHeight: 20,
  },
  viewDetailButton: {
    alignSelf: "flex-end",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    marginTop: 8,
  },
  viewDetailButtonText: {
    fontSize: 12,
    color: "#6C757D",
  },
  noDiagnosisContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  noDiagnosisText: {
    fontSize: 16,
    color: "#6C757D",
    marginBottom: 8,
  },
  noDiagnosisSubtext: {
    fontSize: 14,
    color: "#ADB5BD",
    textAlign: "center",
    marginBottom: 20,
  },
  // 로그인 유도 화면 스타일
  loginPromptContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    justifyContent: "space-between",
  },
  loginPromptContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loginPromptIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F1F3F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  loginPromptIconText: {
    fontSize: 32,
  },
  loginPromptTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 12,
    textAlign: "center",
  },
  loginPromptMessage: {
    fontSize: 16,
    color: "#6C757D",
    textAlign: "center",
    lineHeight: 24,
  },
  loginPromptBottom: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loginRequiredText: {
    fontSize: 14,
    color: "#6C757D",
    textAlign: "center",
    marginBottom: 16,
  },
  loginPromptButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  loginPromptButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  loginPromptButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default ProfileScreen
