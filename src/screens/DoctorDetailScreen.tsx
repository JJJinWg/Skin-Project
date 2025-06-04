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
  const [loading, setLoading] = useState(true) // 로딩 활성화
  const [error, setError] = useState<string | null>(null)
  
  // API에서 가져온 데이터를 위한 state (초기값 null)
  const [doctor, setDoctor] = useState<DoctorDetail | null>(null)
  const [reviews, setReviews] = useState<DoctorReview[]>([])

  // API 호출 활성화
  useEffect(() => {
    console.log('🔍 DoctorDetailScreen: 의사 정보 로딩 시작', { doctorId, doctorName, specialty })
    
    const fetchDoctorDetails = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🌐 의사 상세 정보 API 호출 시작...')
        
        // 의사 상세 정보 가져오기
        const doctorResponse = await medicalApi.getDoctor(doctorId)
        console.log('✅ 의사 상세 정보 API 응답:', doctorResponse)
        console.log('🔍 의사 응답 데이터 구조 분석:')
        const doctorData = doctorResponse as any
        console.log('- name:', typeof doctorData.name, doctorData.name)
        console.log('- specialization:', typeof doctorData.specialization, doctorData.specialization)
        console.log('- hospital_id:', typeof doctorData.hospital_id, doctorData.hospital_id)
        console.log('- available_days:', typeof doctorData.available_days, doctorData.available_days)
        console.log('- available_times:', typeof doctorData.available_times, doctorData.available_times)
        console.log('- rating:', typeof doctorData.rating, doctorData.rating)
        console.log('- review_count:', typeof doctorData.review_count, doctorData.review_count)
        setDoctor(doctorResponse as DoctorDetail)
        
        // 의사 리뷰 가져오기
        console.log('🌐 의사 리뷰 API 호출 시작...')
        const reviewsResponse = await medicalApi.getDoctorReviews(doctorId)
        console.log('✅ 의사 리뷰 API 응답:', reviewsResponse)
        console.log('🔍 리뷰 응답 데이터 구조 분석:')
        const reviewsData = reviewsResponse as any
        if (Array.isArray(reviewsData) && reviewsData.length > 0) {
          const firstReview = reviewsData[0]
          console.log('- 첫 번째 리뷰 구조:')
          Object.keys(firstReview).forEach(key => {
            console.log(`  - ${key}:`, typeof firstReview[key], firstReview[key])
          })
        }
        setReviews(reviewsResponse as DoctorReview[])
        
      } catch (error) {
        console.error('❌ 의사 정보 로딩 실패:', error)
        setError('의사 정보를 불러오는데 실패했습니다.')
        
        // 에러 발생시 기본값 설정
        setDoctor({
          id: doctorId,
          name: doctorName || 'Dr. Kim',
          specialization: specialty || '피부과',
          hospital_id: 1,
          experience_years: 10,
          education: '서울대학교 의과대학 졸업, 서울대학교병원 피부과 전공의',
          description: '피부과 전문의로 10년 이상의 경력을 보유하고 있습니다.',
          profile_image_url: '',
          rating: 4.9,
          review_count: 124,
          consultation_fee: 50000,
          available_days: '월~금',
          available_times: '09:00~18:00',
          is_active: true,
          created_at: '2023-01-01',
          updated_at: '2023-01-01'
        })
        
        setReviews([
          {
            id: 1,
            user_id: 1,
            doctor_id: doctorId,
            rating: 5,
            review_text: '매우 친절하고 전문적인 진료를 받았습니다.',
            created_at: '2023-12-01',
            patient_name: '김환자'
          },
          {
            id: 2,
            user_id: 2,
            doctor_id: doctorId,
            rating: 4,
            review_text: '치료 효과가 좋았습니다.',
            created_at: '2023-11-15',
            patient_name: '이환자'
          }
        ])
      } finally {
        setLoading(false)
        console.log('🏁 의사 정보 로딩 완료')
      }
    }

    fetchDoctorDetails()
  }, [doctorId, doctorName, specialty])

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${year}년 ${month}월 ${day}일`
  }

  // 요일 포맷 함수
  const formatAvailableDays = (days: any) => {
    if (Array.isArray(days)) {
      const dayNames: { [key: string]: string } = {
        'mon': '월',
        'tue': '화', 
        'wed': '수',
        'thu': '목',
        'fri': '금',
        'sat': '토',
        'sun': '일'
      }
      return days.map(day => dayNames[day] || day).join(', ')
    }
    return String(days)
  }

  // 진료 시간 포맷 함수
  const formatAvailableTimes = (times: any) => {
    if (times && typeof times === 'object' && times.start && times.end) {
      return `${times.start} ~ ${times.end}`
    }
    return String(times)
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

  // 익명 사용자 이름 생성 함수
  const generateAnonymousName = (userId: number) => {
    return `사용자${userId.toString().padStart(4, '0')}`
  }

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>의사 정보</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF9A9E" />
          <Text style={styles.loadingText}>의사 정보를 불러오는 중...</Text>
        </View>
      ) : error && !doctor ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => {
              console.log('🔄 재시도 버튼 클릭')
              setLoading(true)
              setError(null)
              // useEffect 재실행을 위해 key 변경하거나 직접 호출
            }}
          >
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : doctor ? (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* 의사 프로필 섹션 */}
          <View style={styles.profileSection}>
            <Image source={require('../assets/doctor1.png')} style={styles.doctorImage} />
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{doctor.name}</Text>
              <Text style={styles.doctorSpecialty}>{doctor.specialization}</Text>
              <View style={styles.ratingContainer}>
                {renderStars(doctor.rating)}
                <Text style={styles.ratingText}>{doctor.rating}</Text>
                <Text style={styles.reviewCountText}>({doctor.review_count}개 리뷰)</Text>
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
                리뷰 ({doctor.review_count})
              </Text>
            </TouchableOpacity>
          </View>

          {/* 탭 콘텐츠 */}
          {activeTab === "info" ? (
            <View style={styles.infoContent}>
              {/* 소개 */}
              <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>소개</Text>
                <Text style={styles.description}>{doctor.description}</Text>
              </View>

              {/* 학력 및 경력 */}
              <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>학력 및 경력</Text>
                <View style={styles.experienceContainer}>
                  <Text style={styles.experienceText}>경력: {doctor.experience_years}년</Text>
                </View>
                {doctor.education.split(',').map((edu, index) => (
                  <Text key={index} style={styles.educationItem}>
                    • {edu.trim()}
                  </Text>
                ))}
              </View>

              {/* 진료 정보 */}
              <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>진료 정보</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>진료 시간</Text>
                  <Text style={styles.infoValue}>
                    {formatAvailableDays(doctor.available_days)}, {formatAvailableTimes(doctor.available_times)}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>진료비</Text>
                  <Text style={styles.infoValue}>{doctor.consultation_fee.toLocaleString()}원</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.reviewsContent}>
              <FlatList
                data={reviews}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.patientName}>
                        {item.patient_name && item.patient_name.trim() 
                          ? item.patient_name 
                          : generateAnonymousName(item.user_id)}
                      </Text>
                      <Text style={styles.reviewDate}>{formatDate(item.created_at)}</Text>
                    </View>
                    <View style={styles.reviewRating}>{renderStars(item.rating)}</View>
                    <Text style={styles.reviewContent}>{item.review_text}</Text>
                    <View style={styles.reviewFooter}>
                      <Text style={styles.helpfulText}>리뷰 ID: {item.id}</Text>
                    </View>
                  </View>
                )}
                scrollEnabled={false}
                contentContainerStyle={styles.reviewsList}
              />
            </View>
          )}
        </ScrollView>
      ) : null}

      {/* 하단 예약 버튼 */}
      {doctor && (
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
  reviewFooter: {
    alignItems: "flex-end",
  },
  helpfulText: {
    fontSize: 12,
    color: "#6C757D",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF9A9E",
    marginBottom: 20,
  },
  retryButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FF9A9E",
  },
  retryButtonText: {
    color: "#FF9A9E",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default DoctorDetailScreen