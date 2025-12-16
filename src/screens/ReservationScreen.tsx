// 사용자의 예약내역 확인 화면
// 사용안함 다른걸로 대체함

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native"
import { type NavigationProp, useNavigation } from "@react-navigation/native"
import type { RootStackParamList } from "../types/navigation"
import LinearGradient from "react-native-linear-gradient"
import { appointmentService } from "../services/appointmentService"

type Doctor = {
  id: number
  name: string
  specialty: string
  specialization?: string
  rating: number
  reviews: number
  available: boolean
  image: any
}

const ReservationScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("all")

  const specialties = [
    { id: "all", name: "전체" },
    { id: "dermatology", name: "피부과" },

  ]

  // 의사 데이터 가져오기 (실제 API에서만 가져옴)
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('📋 예약 화면 의사 목록 로딩 중...')
        const doctorsData = await appointmentService.getReservationDoctors()
        
        // API 데이터를 화면에 맞게 변환
        const transformedDoctors = doctorsData.map((doctor: any) => ({
          id: doctor.id,
          name: doctor.name,
          specialty: doctor.specialization || doctor.specialty,
          specialization: doctor.specialization,
          rating: doctor.rating || 0,
          reviews: doctor.review_count || 0,
          available: doctor.available !== false,
          image: require("../assets/doctor1.png"), // 모든 의사에게 같은 기본 이미지
        }))
        
        setDoctors(transformedDoctors)
        setFilteredDoctors(transformedDoctors)
        console.log('✅ 의사 목록 로딩 완료:', transformedDoctors.length, '명')
      } catch (error) {
        console.error('❌ 의사 목록 로딩 실패:', error)
        setError('의사 목록을 불러올 수 없습니다. 서버 연결을 확인해주세요.')
        setDoctors([])
        setFilteredDoctors([])
      } finally {
        setLoading(false)
      }
    }

    loadDoctors()
  }, [])

  // 검색 및 필터링
  useEffect(() => {
    let results = doctors

    // 검색어로 필터링
    if (searchQuery) {
      results = results.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // 전문분야로 필터링
    if (selectedSpecialty !== "all") {
      results = results.filter(
        (doctor) => doctor.specialty === specialties.find((s) => s.id === selectedSpecialty)?.name,
      )
    }

    setFilteredDoctors(results)
  }, [searchQuery, selectedSpecialty, doctors])

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

  // 재시도 함수
  const handleRetry = () => {
    const loadDoctors = async () => {
      try {
        setLoading(true)
        setError(null)
        const doctorsData = await appointmentService.getReservationDoctors()
        
        const transformedDoctors = doctorsData.map((doctor: any) => ({
          id: doctor.id,
          name: doctor.name,
          specialty: doctor.specialization || doctor.specialty,
          specialization: doctor.specialization,
          rating: doctor.rating || 0,
          reviews: doctor.review_count || 0,
          available: doctor.available !== false,
          image: require("../assets/doctor1.png"), // 모든 의사에게 같은 기본 이미지
        }))
        
        setDoctors(transformedDoctors)
        setFilteredDoctors(transformedDoctors)
      } catch (error) {
        setError('의사 목록을 불러올 수 없습니다. 서버 연결을 확인해주세요.')
        setDoctors([])
        setFilteredDoctors([])
      } finally {
        setLoading(false)
      }
    }
    loadDoctors()
  }

  // 의사 이미지 렌더링 (에러 처리 포함)
  const renderDoctorImage = (item: Doctor) => {
    return (
      <Image 
        source={item.image} 
        style={styles.doctorImage}
        onError={() => {
          console.log('의사 이미지 로드 실패:', item.name)
        }}
      />
    )
  }

const ReservationHistoryScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} >
          
        </TouchableOpacity>
        <Text style={styles.headerTitle}>진료 예약</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 검색 바 */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="의사 또는 전문분야 검색"
            placeholderTextColor="#ADB5BD"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* 전문분야 필터 */}
      <View style={styles.specialtyContainer}>
        <FlatList
          data={specialties}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.specialtyTab, selectedSpecialty === item.id && styles.specialtyTabActive]}
              onPress={() => setSelectedSpecialty(item.id)}
            >
              <Text style={[styles.specialtyTabText, selectedSpecialty === item.id && styles.specialtyTabTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.specialtyList}
        />
      </View>

      {/* 의사 목록 */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF9A9E" />
          <Text style={styles.loadingText}>의사 목록을 불러오는 중...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>연결 오류</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : filteredDoctors.length > 0 ? (
        <FlatList
          data={filteredDoctors}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.doctorCard}>
              {/* 의사 프로필 구역 - 클릭하면 상세 페이지로 이동 */}
              <TouchableOpacity
                style={styles.doctorProfileArea}
                onPress={() =>
                  navigation.navigate("DoctorDetailScreen", {
                    doctorId: item.id,
                    doctorName: item.name,
                    specialty: item.specialty,
                  })
                }
              >
                {renderDoctorImage(item)}
                <View style={styles.doctorInfo}>
                  <View style={styles.doctorNameRow}>
                    <Text style={styles.doctorName}>{item.name}</Text>
                    {item.available && (
                      <View style={styles.availableBadge}>
                        <Text style={styles.availableBadgeText}>예약가능</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.doctorSpecialty}>{item.specialty}</Text>
                  <View style={styles.ratingContainer}>
                    {renderStars(item.rating)}
                    <Text style={styles.ratingText}>{item.rating}</Text>
                    <Text style={styles.reviewCount}>({item.reviews})</Text>
                  </View>
                </View>
              </TouchableOpacity>
              
              {/* 예약하기 버튼 - 별도 클릭 이벤트 */}
              <LinearGradient
                colors={["#FF9A9E", "#FAD0C4"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.bookButtonGradient}
              >
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() =>
                    navigation.navigate("AppointmentScreen", {
                      doctorId: item.id,
                      doctorName: item.name,
                      specialty: item.specialty,
                    })
                  }
                >
                  <Text style={styles.bookButtonText}>예약하기</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}
          contentContainerStyle={styles.doctorList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>검색 결과가 없습니다.</Text>
          <Text style={styles.noResultsSubtext}>다른 검색어나 필터를 시도해보세요.</Text>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
    color: "#ADB5BD",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#212529",
    padding: 0,
  },
  clearIcon: {
    fontSize: 16,
    color: "#ADB5BD",
    padding: 5,
  },
  specialtyContainer: {
    backgroundColor: "#FFFFFF",
    paddingBottom: 10,
  },
  specialtyList: {
    paddingHorizontal: 20,
  },
  specialtyTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  specialtyTabActive: {
    backgroundColor: "#FF9A9E",
    borderColor: "#FF9A9E",
  },
  specialtyTabText: {
    fontSize: 14,
    color: "#6C757D",
  },
  specialtyTabTextActive: {
    color: "#FFFFFF",
    fontWeight: "bold",
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
  doctorList: {
    padding: 20,
    paddingTop: 10,
  },
  doctorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 20,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  doctorProfileArea: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
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
  doctorNameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
  },
  availableBadge: {
    backgroundColor: "#4CAF50",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  availableBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  doctorSpecialty: {
    fontSize: 14,
    color: "#6C757D",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
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
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: "#6C757D",
  },
  bookButtonGradient: {
    borderRadius: 12,
    overflow: "hidden",
  },
  bookButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: "#6C757D",
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorIcon: {
    fontSize: 24,
    color: "#FF9A9E",
    marginBottom: 10,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: "#6C757D",
    marginBottom: 20,
  },
  retryButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FF9A9E",
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});

export default ReservationHistoryScreen;