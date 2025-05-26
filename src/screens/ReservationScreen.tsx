 // 의사 전체보기 및 예약가능 화면

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
} from "react-native"
import { type NavigationProp, useNavigation } from "@react-navigation/native"
import type { RootStackParamList } from "../types/navigation"
import LinearGradient from "react-native-linear-gradient"
import { appointmentService } from "../services/appointmentService"

type Doctor = {
  id: number
  name: string
  specialty: string
  rating: number
  reviews: number
  available: boolean
  image: any
  nextAvailable?: string
}

const ReservationScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("all")

  const [specialties, setSpecialties] = useState<any[]>([])

  // 데이터 가져오기
  useEffect(() => {
    const loadData = async () => {
      try {
        const [doctorsData, specialtiesData] = await Promise.all([
          appointmentService.getReservationDoctors(),
          appointmentService.getSpecialties()
        ]);
        
        setDoctors(doctorsData);
        setFilteredDoctors(doctorsData);
        setSpecialties(specialtiesData);
        setLoading(false);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
        setLoading(false);
      }
    };

    loadData();
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
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
      ) : filteredDoctors.length > 0 ? (
        <FlatList
          data={filteredDoctors}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.doctorCard}
              onPress={() =>
                navigation.navigate("AppointmentScreen", {
                  doctorId: item.id,
                  doctorName: item.name,
                  specialty: item.specialty,
                  doctorImage: item.image,
                })
              }
            >
              <Image source={item.image} style={styles.doctorImage} />
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
                <View style={styles.nextAvailableContainer}>
                  <Text style={styles.nextAvailableLabel}>다음 예약 가능:</Text>
                  <Text style={styles.nextAvailableTime}>{item.nextAvailable}</Text>
                </View>
              </View>
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
            </TouchableOpacity>
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
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
    alignSelf: "center",
  },
  doctorInfo: {
    marginBottom: 15,
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
  nextAvailableContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  nextAvailableLabel: {
    fontSize: 12,
    color: "#6C757D",
    marginRight: 5,
  },
  nextAvailableTime: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#212529",
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
})

export default ReservationScreen
