// 의사 상세 정보 화면
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import type { RootStackParamList } from '../types/navigation'
import LinearGradient from 'react-native-linear-gradient'
import { appointmentService } from '../services/appointmentService'
import { medicalApi } from '../services/apiClient'

// 의사 타입 정의
interface DoctorDetail {
  id: number;
  name: string;
  specialization: string;
  hospital_id: number;
  experience_years: number;
  education: string;
  description: string;
  profile_image_url?: string;
  rating: number;
  review_count: number;
  consultation_fee: number;
  available_days: string;
  available_times: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 리뷰 타입 정의
interface DoctorReview {
  id: number;
  user_id: number;
  doctor_id: number;
  appointment_id?: number;
  rating: number;
  review_text: string;
  created_at: string;
  patient_name?: string;
}

const DoctorDetailScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const route = useRoute<RouteProp<RootStackParamList, 'DoctorDetailScreen'>>()
  const { doctorId, doctorName, specialty } = route.params
  
  const [activeTab, setActiveTab] = useState<'info' | 'reviews'>('info')
  const [doctor, setDoctor] = useState<DoctorDetail | null>(null)
  const [reviews, setReviews] = useState<DoctorReview[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${year}년 ${month}월 ${day}일`
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

  // 의사 정보와 리뷰 가져오기
  const loadDoctorData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 의사 정보 가져오기
      console.log(`👨‍⚕️ 의사 정보 조회 시작... ID: ${doctorId}`)
      const doctorData = await medicalApi.getDoctor(doctorId) as DoctorDetail
      console.log('👨‍⚕️ 의사 정보 조회 결과:', doctorData)
      setDoctor(doctorData)
      
      // 리뷰 가져오기
      console.log(`📝 의사 리뷰 조회 시작... 의사 ID: ${doctorId}`)
      try {
        const reviewsData = await medicalApi.getDoctorReviews(doctorId) as DoctorReview[]
        console.log('📝 의사 리뷰 조회 결과:', reviewsData)
        setReviews(reviewsData)
      } catch (reviewError) {
        console.log('📝 리뷰 데이터 없음 또는 조회 실패:', reviewError)
        setReviews([])
      }
      
    } catch (error) {
      console.error('❌ 의사 정보 조회 실패:', error)
      setError('의사 정보를 불러오는데 실패했습니다.')
    } finally {
      console.log('🏁 loadDoctorData 완료')
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDoctorData()
  }, [doctorId])

  // 예약 처리 함수들
  const handleReservation = () => {
    if (!doctor) return
    
    navigation.navigate('AppointmentScreen', {
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialization
    })
  }

  const handleBookAppointment = () => {
    if (!doctor) return
    
    navigation.navigate('AppointmentScreen', {
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialization
    })
  }

  // 로딩 중일 때
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF9A9E" />
          <Text style={styles.loadingText}>의사 정보를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    )
  }

  // 에러 발생 시
  if (error || !doctor) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || '의사 정보를 찾을 수 없습니다.'}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => {
              setLoading(true)
              setError(null)
              loadDoctorData()
            }}
          >
            <Text style={styles.retryButtonText}>다시 시도</Text>
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
        <Text style={styles.headerTitle}>의사 정보</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 의사 프로필 섹션 */}
        <View style={styles.profileSection}>
          <Image 
            source={doctor.profile_image_url ? { uri: doctor.profile_image_url } : require('../assets/doctor1.png')} 
            style={styles.doctorImage} 
          />
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <Text style={styles.doctorSpecialty}>{doctor.specialization}</Text>
            <Text style={styles.hospitalName}>
              {doctor.hospital_id ? '서울대학교병원' : '병원 정보 없음'}
            </Text>
            <View style={styles.ratingContainer}>
              {renderStars(doctor.rating || 0)}
              <Text style={styles.ratingText}>{doctor.rating?.toFixed(1) || 'N/A'}</Text>
              <Text style={styles.reviewCountText}>({doctor.review_count || 0}개 리뷰)</Text>
            </View>
          </View>
        </View>

        {/* 탭 메뉴 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "info" && styles.activeTabButton]}
            onPress={() => setActiveTab("info")}
          >
            <Text style={[styles.tabButtonText, activeTab === "info" && styles.activeTabButtonText]}>의사 정보</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "reviews" && styles.activeTabButton]}
            onPress={() => setActiveTab("reviews")}
          >
            <Text style={[styles.tabButtonText, activeTab === "reviews" && styles.activeTabButtonText]}>
              리뷰 ({doctor.review_count || 0})
            </Text>
          </TouchableOpacity>
        </View>

        {/* 탭 콘텐츠 */}
        {activeTab === "info" ? (
          <View style={styles.infoContent}>
            {/* 소개 */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>소개</Text>
              <Text style={styles.description}>
                {doctor.description || '의사 소개 정보가 없습니다.'}
              </Text>
            </View>

            {/* 학력 및 경력 */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>학력 및 경력</Text>
              <View style={styles.experienceContainer}>
                <Text style={styles.experienceText}>경력: {doctor.experience_years || 'N/A'}년</Text>
              </View>
              {doctor.education ? (
                <Text style={styles.educationItem}>• {doctor.education}</Text>
              ) : (
                <Text style={styles.educationItem}>• 학력 정보가 없습니다.</Text>
              )}
            </View>

            {/* 진료 정보 */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>진료 정보</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>진료 시간</Text>
                <Text style={styles.infoValue}>
                  {doctor.available_times || '진료 시간 정보가 없습니다.'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>진료비</Text>
                <Text style={styles.infoValue}>
                  {doctor.consultation_fee ? `₩${doctor.consultation_fee.toLocaleString()}` : '진료비 정보가 없습니다.'}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.reviewsContent}>
            {reviews.length > 0 ? (
              <FlatList
                data={reviews}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.patientName}>{item.patient_name || '익명'}</Text>
                      <Text style={styles.reviewDate}>{formatDate(item.created_at)}</Text>
                    </View>
                    <View style={styles.reviewRating}>{renderStars(item.rating)}</View>
                    <Text style={styles.reviewContent}>{item.review_text}</Text>
                  </View>
                )}
                scrollEnabled={false}
                contentContainerStyle={styles.reviewsList}
              />
            ) : (
              <View style={styles.noReviewsContainer}>
                <Text style={styles.noReviewsText}>아직 리뷰가 없습니다.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* 하단 예약 버튼 */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookAppointment}>
          <LinearGradient
            colors={["#FF9A9E", "#FAD0C4"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bookButtonGradient}
          >
            <Text style={styles.bookButtonText}>예약하기</Text>
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
  header: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F5",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#6C757D",
    marginTop: 10,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  profileSection: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: "#6C757D",
    marginBottom: 2,
  },
  hospitalName: {
    fontSize: 14,
    color: "#6C757D",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starsContainer: {
    flexDirection: "row",
    marginRight: 5,
  },
  starIcon: {
    fontSize: 16,
    color: "#FFC107",
    marginRight: 1,
  },
  emptyStar: {
    color: "#E9ECEF",
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#212529",
    marginRight: 5,
  },
  reviewCountText: {
    fontSize: 12,
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
  infoContent: {
    padding: 20,
  },
  infoCard: {
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
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#495057",
    lineHeight: 20,
  },
  experienceContainer: {
    marginBottom: 10,
  },
  experienceText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF9A9E",
    marginBottom: 8,
  },
  educationItem: {
    fontSize: 14,
    color: "#495057",
    marginBottom: 4,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6C757D",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#212529",
  },
  reviewsContent: {
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  patientName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#212529",
  },
  reviewDate: {
    fontSize: 12,
    color: "#6C757D",
  },
  reviewRating: {
    marginBottom: 8,
  },
  reviewContent: {
    fontSize: 14,
    color: "#495057",
    lineHeight: 20,
    marginBottom: 8,
  },
  bottomContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F1F3F5",
  },
  bookButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  bookButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
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
  retryButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#FF9A9E",
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  noReviewsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  noReviewsText: {
    fontSize: 16,
    color: "#6C757D",
  },
})

export default DoctorDetailScreen