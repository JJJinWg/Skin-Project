//AI 기반 화장품 추천 화면
// 이 화면은 사용자의 피부 타입과 고민을 분석하여 맞춤형 화장품을 추천



import { useState, useEffect, useMemo } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native"
import { type NavigationProp, useNavigation } from "@react-navigation/native"
import type { RootStackParamList } from "../types/navigation"
import LinearGradient from "react-native-linear-gradient"
import { productService, type Product } from "../services/productService"

// 화장품 타입 정의
type Cosmetic = Product & {
  suitableFor: string[];
  notSuitableFor: string[];
}

// 피부 타입과 고민 옵션 타입 정의
interface SkinOptions {
  skinTypes: string[];
  concerns: string[];
}

const FindCosmeticsScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const [selectedSkinType, setSelectedSkinType] = useState<string>("")
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([])
  const [additionalInfo, setAdditionalInfo] = useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [recommendedCosmetics, setRecommendedCosmetics] = useState<Cosmetic[]>([])
  const [aiExplanation, setAiExplanation] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("전체")
  const [skinOptions, setSkinOptions] = useState<SkinOptions>({ skinTypes: [], concerns: [] })
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)

  // 피부 타입과 고민 옵션 로드
  useEffect(() => {
    const loadSkinOptions = async () => {
      try {
        const response = await productService.getSkinOptions();
        setSkinOptions(response);
      } catch (error) {
        console.error('피부 옵션 로드 실패:', error);
        Alert.alert('오류', '피부 타입과 고민 옵션을 불러오는데 실패했습니다.');
      } finally {
        setIsLoadingOptions(false);
      }
    };

    loadSkinOptions();
  }, []);

  // 피부 고민 선택/해제 처리
  const toggleConcern = (concern: string) => {
    if (selectedConcerns.includes(concern)) {
      setSelectedConcerns(selectedConcerns.filter((item) => item !== concern))
    } else {
      if (selectedConcerns.length < 3) {
        setSelectedConcerns([...selectedConcerns, concern])
      } else {
        // 최대 3개까지만 선택 가능
        Alert.alert("피부 고민은 최대 3개까지 선택 가능합니다.")
      }
    }
  }

  // 화장품 카테고리 필터링
  const filteredCosmetics = useMemo(() => {
    return recommendedCosmetics.filter((cosmetic) => {
      if (selectedCategory !== "전체" && cosmetic.category !== selectedCategory) {
        return false
      }
      if (selectedConcerns.length > 0) {
        return selectedConcerns.some((concern) => 
          cosmetic.suitableFor?.includes(concern)
        )
      }
      return true
    })
  }, [recommendedCosmetics, selectedCategory, selectedConcerns])

  // 화장품 추천 분석 시작
  const handleAnalyze = async () => {
    if (!selectedSkinType) {
      Alert.alert("피부 타입을 선택해주세요.")
      return
    }

    if (selectedConcerns.length === 0) {
      Alert.alert("최소 한 개 이상의 피부 고민을 선택해주세요.")
      return
    }

    setIsAnalyzing(true)

    try {
      const result = await productService.getCosmeticRecommendations({
        skinType: selectedSkinType,
        concerns: selectedConcerns,
        additionalInfo: additionalInfo
      });

      setRecommendedCosmetics(result.products);
      setAiExplanation(result.explanation);
      setShowResults(true);
    } catch (error) {
      console.error('화장품 추천 실패:', error);
      Alert.alert('오류', '화장품 추천을 불러오는데 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  }

  // 뒤로가기
  const handleBackPress = () => {
    if (showResults) {
      // 결과 화면에서 뒤로가기 시 입력 화면으로
      setShowResults(false)
      setRecommendedCosmetics([])
      setSelectedCategory("전체")
      setAiExplanation("")
    } else {
      // 입력 화면에서 뒤로가기 시 이전 화면으로
      navigation.goBack()
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

  // 화장품 카테고리 목록 생성
  const getCategories = () => {
    const categories = recommendedCosmetics.map((item) => item.category)
    return ["전체", ...Array.from(new Set(categories))]
  }

  // 필터링된 화장품 목록 렌더링
  const renderFilteredCosmetics = () => {
    return filteredCosmetics.map((cosmetic) => (
      <TouchableOpacity
        key={cosmetic.id}
        style={styles.cosmeticCard}
        onPress={() => navigation.navigate("ProductDetailScreen", { id: cosmetic.id })}
      >
        <Image source={cosmetic.image} style={styles.cosmeticImage} />
        <View style={styles.cosmeticInfo}>
          <Text style={styles.cosmeticBrand}>{cosmetic.brand}</Text>
          <Text style={styles.cosmeticName}>{cosmetic.name}</Text>
          <View style={styles.ratingContainer}>
            {renderStars(cosmetic.rating)}
            <Text style={styles.ratingText}>
              {cosmetic.rating} ({cosmetic.reviewCount})
            </Text>
          </View>
          <Text style={styles.cosmeticPrice}>{cosmetic.price}</Text>
          <View style={styles.tagsContainer}>
            {cosmetic.suitableFor.slice(0, 2).map((tag, index) => (
              <View key={index} style={styles.tagBadge}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    ))
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Text style={styles.backButtonText}>
            뒤로
          </Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{showResults ? "         맞춤 화장품 추천" : "          화장품 추천받기"}</Text>
        <View style={styles.placeholder} />
      </View>

      {isAnalyzing ? (
        // 분석 중 로딩 화면
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF9A9E" />
          <Text style={styles.loadingText}>AI가 맞춤형 화장품을 분석 중입니다...</Text>
          <Text style={styles.loadingSubText}>
            사용자의 피부 타입과 고민, 다른 사용자들의 리뷰를 분석하고 있습니다.
          </Text>
        </View>
      ) : showResults ? (
        // 결과 화면
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* AI 분석 결과 */}
          <View style={styles.aiResultCard}>
            <View style={styles.aiHeaderContainer}>
              <View style={styles.aiIconContainer}>
                <Text style={styles.aiIcon}>🤖</Text>
              </View>
              <Text style={styles.aiTitle}>AI 분석 결과</Text>
            </View>
            <Text style={styles.aiExplanation}>{aiExplanation}</Text>
          </View>

          {/* 카테고리 필터 */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
            {getCategories().map((category, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.categoryButton,
                  (category === "전체" && selectedCategory === "전체") || selectedCategory === category
                    ? styles.activeCategoryButton
                    : {},
                ]}
                onPress={() => setSelectedCategory(category === "전체" ? "전체" : category)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    (category === "전체" && selectedCategory === "전체") || selectedCategory === category
                      ? styles.activeCategoryButtonText
                      : {},
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* 추천 화장품 목록 */}
          <View style={styles.cosmeticsContainer}>
            <Text style={styles.sectionTitle}>추천 화장품</Text>
            {renderFilteredCosmetics()}
          </View>

          {/* 하단 여백 */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      ) : (
        // 입력 화면
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* 안내 텍스트 */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>AI 화장품 추천</Text>
            <Text style={styles.infoText}>
              피부 타입과 고민을 선택하면 AI가 다른 사용자들의 리뷰와 평가를 분석하여 맞춤형 화장품을 추천해 드립니다.
            </Text>
          </View>

          {/* 피부 타입 선택 */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>피부 타입</Text>
            <Text style={styles.sectionSubtitle}>자신의 피부 타입을 선택해주세요.</Text>
            <View style={styles.optionsContainer}>
              {isLoadingOptions ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#FF9A9E" />
                  <Text style={styles.loadingText}>피부 옵션을 불러오는 중...</Text>
                </View>
              ) : (
                skinOptions.skinTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.optionButton, selectedSkinType === type && styles.selectedOptionButton]}
                    onPress={() => setSelectedSkinType(type)}
                  >
                    <Text style={[styles.optionButtonText, selectedSkinType === type && styles.selectedOptionButtonText]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>

          {/* 피부 고민 선택 */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>피부 고민</Text>
            <Text style={styles.sectionSubtitle}>주요 피부 고민을 최대 3개까지 선택해주세요.</Text>
            <View style={styles.concernsContainer}>
              {skinOptions.concerns.map((concern) => (
                <TouchableOpacity
                  key={concern}
                  style={[styles.concernButton, selectedConcerns.includes(concern) && styles.selectedConcernButton]}
                  onPress={() => toggleConcern(concern)}
                >
                  <Text
                    style={[
                      styles.concernButtonText,
                      selectedConcerns.includes(concern) && styles.selectedConcernButtonText,
                    ]}
                  >
                    {concern}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 추가 정보 입력 */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>추가 정보 (선택사항)</Text>
            <Text style={styles.sectionSubtitle}>더 정확한 추천을 위해 추가 정보를 입력해주세요.</Text>
            <TextInput
              style={styles.additionalInfoInput}
              placeholder="예: 알레르기가 있는 성분, 선호하는 제형, 특정 브랜드 등"
              placeholderTextColor="#ADB5BD"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={additionalInfo}
              onChangeText={setAdditionalInfo}
            />
          </View>

          {/* 분석 버튼 */}
          <TouchableOpacity style={styles.analyzeButton} onPress={handleAnalyze}>
            <LinearGradient
              colors={["#84FAB0", "#8FD3F4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.analyzeButtonGradient}
            >
              <Text style={styles.analyzeButtonText}>맞춤 화장품 추천받기</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* 개인정보 처리 안내 */}
          <View style={styles.privacyContainer}>
            <Text style={styles.privacyText}>
              입력하신 정보는 화장품 추천을 위해서만 사용되며, 다른 목적으로 저장되거나 공유되지 않습니다.
            </Text>
          </View>
        </ScrollView>
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
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    margin: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#495057",
    lineHeight: 20,
  },
  sectionContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
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
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6C757D",
    marginBottom: 15,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  optionButton: {
    width: "48%",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    marginBottom: 10,
  },
  selectedOptionButton: {
    borderColor: "#84FAB0",
    backgroundColor: "rgba(132, 250, 176, 0.1)",
  },
  optionButtonText: {
    fontSize: 14,
    color: "#495057",
  },
  selectedOptionButtonText: {
    color: "#212529",
    fontWeight: "bold",
  },
  concernsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  concernButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    backgroundColor: "#FFFFFF",
    marginRight: 8,
    marginBottom: 8,
  },
  selectedConcernButton: {
    borderColor: "#8FD3F4",
    backgroundColor: "rgba(143, 211, 244, 0.1)",
  },
  concernButtonText: {
    fontSize: 12,
    color: "#495057",
  },
  selectedConcernButtonText: {
    color: "#212529",
    fontWeight: "bold",
  },
  additionalInfoInput: {
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 12,
    padding: 15,
    fontSize: 14,
    color: "#212529",
    height: 100,
    textAlignVertical: "top",
  },
  analyzeButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  analyzeButtonGradient: {
    paddingVertical: 15,
    alignItems: "center",
  },
  analyzeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  privacyContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  privacyText: {
    fontSize: 12,
    color: "#6C757D",
    textAlign: "center",
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
    marginTop: 20,
    marginBottom: 10,
  },
  loadingSubText: {
    fontSize: 14,
    color: "#6C757D",
    textAlign: "center",
    lineHeight: 20,
  },
  // 결과 화면 스타일
  aiResultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    margin: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  aiHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  aiIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F9FE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  aiIcon: {
    fontSize: 20,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
  },
  aiExplanation: {
    fontSize: 14,
    color: "#495057",
    lineHeight: 20,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    backgroundColor: "#FFFFFF",
    marginRight: 10,
  },
  activeCategoryButton: {
    borderColor: "#84FAB0",
    backgroundColor: "rgba(132, 250, 176, 0.1)",
  },
  categoryButtonText: {
    fontSize: 14,
    color: "#495057",
  },
  activeCategoryButtonText: {
    color: "#212529",
    fontWeight: "bold",
  },
  cosmeticsContainer: {
    padding: 20,
  },
  cosmeticCard: {
    flexDirection: "row",
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
  cosmeticImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 15,
  },
  cosmeticInfo: {
    flex: 1,
    justifyContent: "center",
  },
  cosmeticBrand: {
    fontSize: 12,
    color: "#6C757D",
    marginBottom: 2,
  },
  cosmeticName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
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
    fontSize: 12,
    color: "#6C757D",
  },
  cosmeticPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 5,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tagBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    backgroundColor: "#F1F9FE",
    borderRadius: 10,
    marginRight: 5,
    marginBottom: 5,
  },
  tagText: {
    fontSize: 10,
    color: "#0078D7",
  },
  bottomSpacer: {
    height: 40,
  },
})

export default FindCosmeticsScreen
