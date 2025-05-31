//내 정보 화면, 기본 정보,예약내역,리뷰 내역,진단 내역,설정 탭으로 구성

import { useState, useEffect, useCallback } from "react"
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
import { medicalApi } from '../services/apiClient'

type Appointment = {
  id: number
  doctorName: string
  specialty: string
  date: string
  time: string
  status: "upcoming" | "completed" | "canceled"
}

type UserInfo = {
  name: string
  email: string
  phone: string
  birthdate: string
  profileImage: any
}

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

  // 사용자 정보 (실제로는 API에서 가져옴)
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: "홍길동",
    email: "hong@example.com",
    phone: "010-1234-5678",
    birthdate: "1990-01-01",
    profileImage: require("../assets/doctor1.png"), // 기본 이미지
  })

  // 예약 내역 (실제로는 API에서 가져옴)
  const [appointments, setAppointments] = useState<Appointment[]>([])

  // 리뷰 내역 (실제로는 API에서 가져옴)
  const [reviews, setReviews] = useState<Review[]>([])

  const dispatch = useDispatch()

  // 예약 내역 가져오기 (실제 API 호출)
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true)
        const appointmentsData = await medicalApi.getAppointments(1) as any[] // 사용자 ID 1로 가정
        
        // API 응답을 Appointment 타입에 맞게 변환
        const formattedAppointments: Appointment[] = appointmentsData.map((appointment: any) => ({
          id: appointment.id,
          doctorName: appointment.doctorName || '의사명',
          specialty: appointment.specialty || '전문분야',
          date: appointment.date,
          time: appointment.time,
          status: appointment.status === 'confirmed' ? 'upcoming' : 
                 appointment.status === 'completed' ? 'completed' : 'canceled'
        }))
        
        setAppointments(formattedAppointments)
      } catch (error) {
        console.error('예약 내역 로드 실패:', error)
        // 폴백: 기본 데이터
        const mockAppointments: Appointment[] = [
          {
            id: 1,
            doctorName: "Dr. Kim",
            specialty: "피부과",
            date: "2023-06-15",
            time: "14:30",
            status: "upcoming",
          },
          {
            id: 2,
            doctorName: "Dr. Lee",
            specialty: "알레르기",
            date: "2023-06-10",
            time: "11:00",
            status: "completed",
          },
        ]
        setAppointments(mockAppointments)
      } finally {
        setLoading(false)
      }
    }

    loadAppointments()
  }, [])

  // 리뷰 내역 가져오기 (실제 API 호출)
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setReviewsLoading(true)
        const reviewsData = await medicalApi.getUserReviews(1) // 사용자 ID 1로 가정
        
        // API 응답을 Review 타입에 맞게 변환
        const formattedReviews: Review[] = reviewsData.map((review: any) => ({
          id: review.id,
          productId: review.productId || 0,
          productName: review.productName || '제품명',
          productImage: require("../assets/product1.png"), // 기본 이미지
          rating: review.rating || 0,
          content: review.content || '',
          date: review.date || new Date().toISOString().split('T')[0],
          images: review.images || [],
          likes: review.likes || 0,
          helpful: review.helpful || 0,
        }))
        
        setReviews(formattedReviews)
      } catch (error) {
        console.error('리뷰 내역 로드 실패:', error)
        // 폴백: 기본 데이터
        const mockReviews: Review[] = [
          {
            id: 1,
            productId: 101,
            productName: "Beplain 클렌징 폼",
            productImage: require("../assets/product1.png"),
            rating: 4.5,
            content: "피부가 민감한 편인데 자극없이 순하게 세안할 수 있어요.",
            date: "2023-05-15",
            images: [],
            likes: 24,
            helpful: 18,
          },
        ]
        setReviews(mockReviews)
      } finally {
        setReviewsLoading(false)
      }
    }

    loadReviews()
  }, [])

  // 진단 내역 가져오기 (API 호출 시뮬레이션)
  useEffect(() => {
    setDiagnosesLoading(true)
    setTimeout(() => {
      const mockDiagnoses = [
        {
          id: 1,
          doctorId: 1,
          doctorName: "Dr. Kim",
          doctorImage: require("../assets/doctor1.png"),
          specialty: "피부과",
          date: "2023-05-15",
          symptoms: "얼굴에 붉은 발진과 가려움증, 건조함",
          diagnosisContent: "접촉성 피부염으로 진단됩니다. 특정 화장품이나 세안제에 대한 알레르기 반응으로 보입니다.",
          treatment: "스테로이드 연고를 처방해 드립니다. 하루에 두 번, 아침과 저녁에 발진 부위에 얇게 바르세요.",
          prescriptions: ["베타메타손 연고 0.05%", "세티리진 정 10mg"],
          followUpRequired: true,
          followUpDate: "2023-05-29",
        },
        {
          id: 2,
          doctorId: 2,
          doctorName: "Dr. Lee",
          doctorImage: require("../assets/doctor2.png"),
          specialty: "알레르기내과",
          date: "2023-04-10",
          symptoms: "재채기, 콧물, 눈 가려움증",
          diagnosisContent: "계절성 알레르기성 비염입니다. 봄철 꽃가루에 대한 알레르기 반응으로 보입니다.",
          treatment: "항히스타민제를 처방해 드립니다. 증상이 심할 때 하루 한 번 복용하세요.",
          prescriptions: ["로라타딘 정 10mg", "플루티카손 비강 스프레이"],
          followUpRequired: false,
        },
      ]
      setDiagnoses(mockDiagnoses)
      setDiagnosesLoading(false)
    }, 1000)
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
        { text: "취소", style: "cancel" },
        {
          text: "로그아웃",
          onPress: () => {
            dispatch(logout())
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
  const handleCancelAppointment = (id: number) => {
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
          onPress: () => {
            // 실제로는 예약 취소 API 호출
            const updatedAppointments = appointments.map((appointment) =>
              appointment.id === id ? { ...appointment, status: "canceled" as const } : appointment,
            )
            setAppointments(updatedAppointments)
            Alert.alert("예약이 취소되었습니다.")
          },
        },
      ],
      { cancelable: true },
    )
  }

  // 리뷰 삭제 처리
  const handleDeleteReview = (id: number) => {
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
          onPress: () => {
            // 실제로는 리뷰 삭제 API 호출
            const updatedReviews = reviews.filter((review) => review.id !== id)
            setReviews(updatedReviews)
            Alert.alert("리뷰가 삭제되었습니다.")
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
    navigation.navigate("EditProfileScreen", { userInfo })
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
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내 정보</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 프로필 헤더 */}
      <View style={styles.profileHeader}>
        <TouchableOpacity style={styles.profileImageContainer} onPress={handleChangeProfileImage}>
          <Image source={userInfo.profileImage} style={styles.profileImage} />
          <View style={styles.editIconContainer}>
            <Text style={styles.editIcon}>✎</Text>
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
                        <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancelAppointment(item.id)}>
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

        {/* 리뷰 내역 탭 */}
        {activeTab === "reviews" && (
          <View style={styles.reviewsContainer}>
            {reviewsLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>리뷰 내역을 불러오는 중...</Text>
              </View>
            ) : reviews.length > 0 ? (
              <FlatList
                data={reviews}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <Image source={item.productImage} style={styles.productImage} />
                      <View style={styles.reviewHeaderInfo}>
                        <Text style={styles.productName}>{item.productName}</Text>
                        <View style={styles.ratingContainer}>
                          {renderStars(item.rating)}
                          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                        </View>
                        <Text style={styles.reviewDate}>{formatDate(item.date)}</Text>
                      </View>
                    </View>
                    <Text style={styles.reviewContent}>{item.content}</Text>
                    {item.images && item.images.length > 0 && (
                      <View style={styles.reviewImagesContainer}>
                        {item.images.map((image, index) => (
                          <Image key={index} source={{ uri: image }} style={styles.reviewImage} />
                        ))}
                      </View>
                    )}
                    <View style={styles.reviewStats}>
                      <Text style={styles.reviewStatsText}>👍 {item.likes} 명이 좋아합니다</Text>
                      <Text style={styles.reviewStatsText}>🙌 {item.helpful} 명이 도움됐습니다</Text>
                    </View>
                    <View style={styles.reviewActions}>
                      <TouchableOpacity style={styles.reviewActionButton} onPress={() => handleEditReview(item)}>
                        <Text style={styles.reviewActionButtonText}>수정</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.reviewActionButton, styles.deleteButton]}
                        onPress={() => handleDeleteReview(item.id)}
                      >
                        <Text style={styles.deleteButtonText}>삭제</Text>
                      </TouchableOpacity>
                    </View>
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
    //color: "#212529",
    fontWeight: "500",
    color: "#6C757D",
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
})

export default ProfileScreen
