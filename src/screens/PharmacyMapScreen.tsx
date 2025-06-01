// 약국 지도 화면

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, StatusBar, Linking, ActivityIndicator, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Ionicons from "react-native-vector-icons/Ionicons"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import FontAwesome from "react-native-vector-icons/FontAwesome"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { RootStackParamList } from "../types/navigation"
import { medicalApi } from "../services/apiClient"

type PharmacyNavigationProp = StackNavigationProp<RootStackParamList, "PharmacyMapScreen">

// 약국 타입 정의
interface Pharmacy {
  id: string
  name: string
  address: string
  distance: string
  isOpen: boolean
  openTime: string
  phone: string
  rating: number
}

// 필터 옵션
type FilterOption = "전체" | "영업중" | "거리순" | "평점순"

// API 응답 타입 정의
interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

const PharmacyMapScreen = () => {
  const navigation = useNavigation<PharmacyNavigationProp>()
  const [searchText, setSearchText] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>("전체")
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([])
  const [allPharmacies, setAllPharmacies] = useState<Pharmacy[]>([])
  const [mapExpanded, setMapExpanded] = useState(false)
  const [loading, setLoading] = useState(true)

  // 약국 데이터 로드
  useEffect(() => {
    loadPharmacies()
  }, [])

  const loadPharmacies = async () => {
    try {
      setLoading(true)
      
      // API 호출
      const response = await medicalApi.getPharmacies() as ApiResponse<any[]>;
      const pharmaciesData = response.data;
      
      // API 응답을 Pharmacy 타입에 맞게 변환
      const transformedPharmacies = pharmaciesData.map((pharmacy: any) => ({
        id: pharmacy.id,
        name: pharmacy.name,
        address: pharmacy.address,
        distance: pharmacy.distance,
        isOpen: pharmacy.isOpen,
        openTime: pharmacy.openTime,
        phone: pharmacy.phone,
        rating: pharmacy.rating,
      }));
      
      setAllPharmacies(transformedPharmacies);
      setPharmacies(transformedPharmacies);
    } catch (error) {
      console.error('약국 데이터 로드 실패:', error);
      Alert.alert('오류', '약국 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  // 필터 적용 함수
  const applyFilter = (filter: FilterOption) => {
    setSelectedFilter(filter)
    let filteredData = [...allPharmacies]

    if (filter === "영업중") {
      filteredData = filteredData.filter((pharmacy) => pharmacy.isOpen)
    } else if (filter === "거리순") {
      filteredData.sort(
        (a, b) => Number.parseFloat(a.distance.replace("km", "")) - Number.parseFloat(b.distance.replace("km", "")),
      )
    } else if (filter === "평점순") {
      filteredData.sort((a, b) => b.rating - a.rating)
    }

    setPharmacies(filteredData)
  }

  // 검색 함수
  const handleSearch = (text: string) => {
    setSearchText(text)
    if (text.trim() === "") {
      applyFilter(selectedFilter)
      return
    }

    const filtered = allPharmacies.filter(
      (pharmacy) =>
        pharmacy.name.toLowerCase().includes(text.toLowerCase()) ||
        pharmacy.address.toLowerCase().includes(text.toLowerCase()),
    )
    setPharmacies(filtered)
  }

  // 전화 걸기 함수
  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`)
  }

  // 지도 확대/축소 토글
  const toggleMapExpansion = () => {
    setMapExpanded(!mapExpanded)
  }

  // 현재 위치로 이동 (실제로는 API 연동 필요)
  const moveToCurrentLocation = () => {
    // 실제 구현에서는 위치 정보를 가져와 지도를 현재 위치로 이동
    console.log("현재 위치로 이동")
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>근처 약국 찾기</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 검색 바 */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="약국명 또는 주소 검색"
          value={searchText}
          onChangeText={handleSearch}
          placeholderTextColor="#888"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {/* 지도 영역 (나중에 실제 지도로 대체) */}
      <View style={[styles.mapContainer, mapExpanded && styles.expandedMap]}>
        <View style={styles.dummyMap}>
          <Text style={styles.dummyMapText}>지도 영역</Text>
          <Text style={styles.dummyMapSubText}>(구글 맵 또는 카카오맵 API로 대체될 영역)</Text>
        </View>

        {/* 지도 컨트롤 버튼들 */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.mapControlButton} onPress={moveToCurrentLocation}>
            <MaterialIcons name="my-location" size={22} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.mapControlButton} onPress={toggleMapExpansion}>
            <MaterialIcons name={mapExpanded ? "fullscreen-exit" : "fullscreen"} size={22} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 필터 옵션 */}
      <View style={styles.filterContainer}>
        {(["전체", "영업중", "거리순", "평점순"] as FilterOption[]).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterButton, selectedFilter === filter && styles.selectedFilterButton]}
            onPress={() => applyFilter(filter)}
          >
            <Text style={[styles.filterText, selectedFilter === filter && styles.selectedFilterText]}>{filter}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 약국 목록 */}
      <View style={[styles.listContainer, mapExpanded && styles.collapsedList]}>
        <Text style={styles.resultText}>{pharmacies.length}개의 약국이 검색되었습니다</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#5C6BC0" />
        ) : (
          <FlatList
            data={pharmacies}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.pharmacyCard}>
                <View style={styles.pharmacyHeader}>
                  <View>
                    <Text style={styles.pharmacyName}>{item.name}</Text>
                    <View style={styles.ratingContainer}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FontAwesome
                          key={star}
                          name={star <= Math.floor(item.rating) ? "star" : star <= item.rating ? "star-half-o" : "star-o"}
                          size={14}
                          color="#FFD700"
                          style={{ marginRight: 2 }}
                        />
                      ))}
                      <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                  </View>
                  <View style={styles.distanceContainer}>
                    <Text style={styles.distanceText}>{item.distance}</Text>
                    <View style={[styles.statusBadge, item.isOpen ? styles.openBadge : styles.closedBadge]}>
                      <Text style={[styles.statusText, item.isOpen ? styles.openText : styles.closedText]}>
                        {item.isOpen ? "영업중" : "영업종료"}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.pharmacyAddress}>{item.address}</Text>
                <Text style={styles.pharmacyHours}>영업시간: {item.openTime}</Text>

                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.actionButton} onPress={() => handleCall(item.phone)}>
                    <Ionicons name="call" size={16} color="#5C6BC0" />
                    <Text style={styles.actionButtonText}>전화</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="navigate" size={16} color="#5C6BC0" />
                    <Text style={styles.actionButtonText}>길찾기</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="information-circle" size={16} color="#5C6BC0" />
                    <Text style={styles.actionButtonText}>상세정보</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  placeholder: {
    width: 24,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    height: 46,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: "#333",
  },
  mapContainer: {
    height: 200,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#e1e2e3",
  },
  expandedMap: {
    height: 400,
  },
  dummyMap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e1e2e3",
  },
  dummyMapText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#555",
  },
  dummyMapSubText: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },
  mapControls: {
    position: "absolute",
    right: 10,
    bottom: 10,
  },
  mapControlButton: {
    width: 40,
    height: 40,
    backgroundColor: "white",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    minWidth: 70,
    alignItems: "center",
  },
  selectedFilterButton: {
    backgroundColor: "#5C6BC0",
  },
  filterText: {
    fontSize: 14,
    color: "#555",
  },
  selectedFilterText: {
    color: "white",
    fontWeight: "500",
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  collapsedList: {
    maxHeight: "30%",
  },
  resultText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  pharmacyCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pharmacyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  pharmacyName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 4,
  },
  distanceContainer: {
    alignItems: "flex-end",
  },
  distanceText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  openBadge: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
  },
  closedBadge: {
    backgroundColor: "rgba(239, 83, 80, 0.1)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  openText: {
    color: "#4CAF50",
  },
  closedText: {
    color: "#EF5350",
  },
  pharmacyAddress: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  pharmacyHours: {
    fontSize: 13,
    color: "#777",
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 6,
  },
  actionButtonText: {
    fontSize: 14,
    color: "#5C6BC0",
    marginLeft: 4,
  },
})

export default PharmacyMapScreen
