// 의사 상세정보 화면

import { useState, useEffect } from "react"
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
} from "react-native"
import { type NavigationProp, useNavigation, useRoute, type RouteProp } from "@react-navigation/native"
import type { RootStackParamList } from "../types/navigation"
import LinearGradient from "react-native-linear-gradient"

type Doctor = {
  id: number
  name: string
  specialty: string
  image: any
  experience: string
  hospital: string
  rating: number
  reviewCount: number
  description: string
  education: string[]
  workingHours: {
    weekday: string
    weekend: string
  }
  consultationFee: string
}

type Review = {
  id: number
  patientName: string
  rating: number
  content: string
  date: string
  helpful: number
}

type DoctorDetailScreenRouteProp = RouteProp<RootStackParamList, "DoctorDetailScreen">

const DoctorDetailScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const route = useRoute<DoctorDetailScreenRouteProp>()
  const { doctorId } = route.params

  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"info" | "reviews">("info")

  // 의사 정보 가져오기 (API 호출 시뮬레이션)
  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      // 목 데이터 - 실제로는 API에서 doctorId로 조회
      const mockDoctor: Doctor = {
        id: doctorId,
        name: "김민수 원장",
        specialty: "피부과 전문의",
        image: require("../assets/doctor1.png"),
        experience: "15년",
        hospital: "서울피부과의원",
        rating: 4.8,
        reviewCount: 127,
        description:
          "피부과 전문의로 15년간 다양한 피부 질환 치료에 전념해왔습니다. 특히 아토피, 여드름, 알레르기성 피부염 치료에 전문성을 가지고 있으며, 환자 개개인의 피부 상태에 맞는 맞춤형 치료를 제공합니다.",
        education: [
          "서울대학교 의과대학 졸업",
          "서울대학교병원 피부과 전공의",
          "대한피부과학회 정회원",
          "대한미용피부과학회 정회원",
        ],
        workingHours: {
          weekday: "09:00 - 18:00",
          weekend: "09:00 - 13:00",
        },
        consultationFee: "50,000원",
      }

      const mockReviews: Review[] = [
        {
          id: 1,
          patientName: "김**",
          rating: 5,
          content: "아토피로 고생했는데 김원장님 덕분에 많이 좋아졌어요. 친절하게 설명해주시고 치료 효과도 좋았습니다.",
          date: "2023-05-20",
          helpful: 12,
        },
        {
          id: 2,
          patientName: "이**",
          rating: 4,
          content: "여드름 치료받았는데 확실히 효과가 있었어요. 다만 대기시간이 조금 길었습니다.",
          date: "2023-05-15",
          helpful: 8,
        },
        {
          id: 3,
          patientName: "박**",
          rating: 5,
          content: "피부 알레르기로 방문했는데 정확한 진단과 치료로 빠르게 회복되었습니다. 추천합니다!",
          date: "2023-05-10",
          helpful: 15,
        },
      ]

      setDoctor(mockDoctor)
      setReviews(mockReviews)
      setLoading(false)
    }, 1000)
  }, [doctorId])

  // 뒤로가기
  const handleBackPress = () => {
    navigation.goBack()
  }

  // 예약하기
  const handleBookAppointment = () => {
    if (doctor) {
      navigation.navigate("AppointmentScreen", {
        doctorId: doctor.id,
        doctorName: doctor.name,
        doctorSpecialty: doctor.specialty,
      })
    }
  }

  // 별점 렌더링
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

  // 날짜 포맷
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${year}.${month}.${day}`
  }

  if (loading || !doctor) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>의사 정보를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} >
          
        </TouchableOpacity>
        <Text style={styles.headerTitle}>의사 정보</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 의사 프로필 섹션 */}
        <View style={styles.profileSection}>
          <Image source={doctor.image} style={styles.doctorImage} />
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
            <Text style={styles.hospitalName}>{doctor.hospital}</Text>
            <View style={styles.ratingContainer}>
              {renderStars(doctor.rating)}
              <Text style={styles.ratingText}>{doctor.rating}</Text>
              <Text style={styles.reviewCountText}>({doctor.reviewCount}개 리뷰)</Text>
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
              리뷰 ({doctor.reviewCount})
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
                <Text style={styles.experienceText}>경력: {doctor.experience}</Text>
              </View>
              {doctor.education.map((edu, index) => (
                <Text key={index} style={styles.educationItem}>
                  • {edu}
                </Text>
              ))}
            </View>

            {/* 진료 정보 */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>진료 정보</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>진료 시간 (평일)</Text>
                <Text style={styles.infoValue}>{doctor.workingHours.weekday}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>진료 시간 (주말)</Text>
                <Text style={styles.infoValue}>{doctor.workingHours.weekend}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>진료비</Text>
                <Text style={styles.infoValue}>{doctor.consultationFee}</Text>
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
                    <Text style={styles.patientName}>{item.patientName}</Text>
                    <Text style={styles.reviewDate}>{formatDate(item.date)}</Text>
                  </View>
                  <View style={styles.reviewRating}>{renderStars(item.rating)}</View>
                  <Text style={styles.reviewContent}>{item.content}</Text>
                  <View style={styles.reviewFooter}>
                    <Text style={styles.helpfulText}>도움됨 {item.helpful}</Text>
                  </View>
                </View>
              )}
              scrollEnabled={false}
              contentContainerStyle={styles.reviewsList}
            />
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6C757D",
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
})

export default DoctorDetailScreen