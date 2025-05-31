//AI 기반 화장품 추천 화면
// 이 화면은 사용자의 피부 타입과 고민을 분석하여 맞춤형 화장품을 추천



import { useState, useEffect } from "react"
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

// 화장품 타입 정의
type Cosmetic = {
  id: number
  name: string
  brand: string
  category: string
  price: string
  rating: number
  reviewCount: number
  image: any
  description: string
  ingredients: string[]
  suitableFor: string[]
  notSuitableFor: string[]
  reviews: {
    id: number
    userName: string
    rating: number
    comment: string
    date: string
  }[]
}

// 피부 타입 옵션
const skinTypeOptions = ["건성", "지성", "복합성", "중성", "민감성"]

// 피부 고민 옵션
const skinConcernOptions = [
  "건조함",
  "유분과다",
  "여드름",
  "색소침착",
  "주름",
  "모공",
  "민감성",
  "홍조",
  "탄력저하",
  "각질",
]

const FindCosmeticsScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const [selectedSkinType, setSelectedSkinType] = useState<string | null>(null)
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([])
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [recommendedCosmetics, setRecommendedCosmetics] = useState<Cosmetic[]>([])
  const [showResults, setShowResults] = useState(false)
  const [aiExplanation, setAiExplanation] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [filteredCosmetics, setFilteredCosmetics] = useState<Cosmetic[]>([])

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
  useEffect(() => {
    if (activeCategory) {
      setFilteredCosmetics(recommendedCosmetics.filter((item) => item.category === activeCategory))
    } else {
      setFilteredCosmetics(recommendedCosmetics)
    }
  }, [activeCategory, recommendedCosmetics])

  // 화장품 추천 분석 시작
  const handleAnalyze = () => {
    if (!selectedSkinType) {
      Alert.alert("피부 타입을 선택해주세요.")
      return
    }

    if (selectedConcerns.length === 0) {
      Alert.alert("최소 한 개 이상의 피부 고민을 선택해주세요.")
      return
    }

    setIsAnalyzing(true)

    // AI 분석 API 호출 시뮬레이션
    setTimeout(() => {
      // 모의 데이터 생성
      const mockCosmetics: Cosmetic[] = [
        {
          id: 1,
          name: "수분 세라마이드 크림",
          brand: "세라비",
          category: "크림",
          price: "28,000원",
          rating: 4.7,
          reviewCount: 1243,
          image: require("../assets/product1.png"),
          description:
            "세라마이드와 히알루론산이 풍부하게 함유된 수분 크림으로, 건조한 피부에 깊은 보습을 제공합니다. 피부 장벽을 강화하고 수분 손실을 방지하여 하루 종일 촉촉한 피부를 유지시켜 줍니다.",
          ingredients: ["세라마이드", "히알루론산", "글리세린", "판테놀", "스쿠알란"],
          suitableFor: ["건성", "민감성", "복합성"],
          notSuitableFor: ["심한 지성"],
          reviews: [
            {
              id: 1,
              userName: "피부사랑",
              rating: 5,
              comment:
                "건조한 피부에 정말 좋아요! 겨울에도 당김 없이 촉촉하게 유지됩니다. 자극도 없고 순한 편이라 민감한 피부에도 잘 맞을 것 같아요.",
              date: "2023-05-15",
            },
            {
              id: 2,
              userName: "뷰티맘",
              rating: 4,
              comment:
                "발림성이 좋고 흡수도 빠른 편이에요. 건조함이 많이 개선되었지만 아주 심한 건조함에는 조금 부족할 수 있어요.",
              date: "2023-04-22",
            },
          ],
        },
        {
          id: 2,
          name: "진정 시카 토너",
          brand: "닥터지",
          category: "토너",
          price: "22,000원",
          rating: 4.5,
          reviewCount: 876,
          image: require("../assets/product2.png"),
          description:
            "센텔라아시아티카(시카) 성분이 함유된 진정 토너로, 민감하고 자극받은 피부를 빠르게 진정시켜줍니다. pH 밸런스를 맞춰 피부 장벽을 보호하고 다음 단계 스킨케어의 흡수를 돕습니다.",
          ingredients: ["센텔라아시아티카", "판테놀", "알란토인", "마데카소사이드", "글리세린"],
          suitableFor: ["민감성", "지성", "복합성", "여드름성"],
          notSuitableFor: ["없음"],
          reviews: [
            {
              id: 1,
              userName: "민감성피부",
              rating: 5,
              comment:
                "홍조와 자극으로 고생했는데 이 제품 쓰고 많이 진정되었어요. 자극 없이 순하고 피부가 편안해지는 느낌이에요.",
              date: "2023-06-10",
            },
            {
              id: 2,
              userName: "여드름맘",
              rating: 4,
              comment: "여드름성 피부인 딸에게 사줬는데 좋아하네요. 진정 효과가 있고 자극이 없어서 계속 사용 중입니다.",
              date: "2023-05-05",
            },
          ],
        },
        {
          id: 3,
          name: "비타민C 세럼",
          brand: "클리오",
          category: "세럼",
          price: "35,000원",
          rating: 4.6,
          reviewCount: 1052,
          image: require("../assets/product1.png"),
          description:
            "고농축 비타민C가 함유된 세럼으로, 피부 톤을 밝게 개선하고 색소침착을 완화합니다. 항산화 효과로 피부를 보호하고 콜라겐 생성을 촉진하여 탄력 있는 피부로 가꾸어 줍니다.",
          ingredients: ["비타민C(아스코빅애시드)", "나이아신아마이드", "판테놀", "히알루론산", "비타민E"],
          suitableFor: ["모든 피부 타입", "색소침착", "탄력 저하"],
          notSuitableFor: ["매우 민감한 피부"],
          reviews: [
            {
              id: 1,
              userName: "화이트스킨",
              rating: 5,
              comment:
                "사용한지 한 달 정도 됐는데 확실히 피부톤이 밝아졌어요! 기미도 조금씩 옅어지는 것 같고 피부가 환해진 느낌입니다.",
              date: "2023-04-18",
            },
            {
              id: 2,
              userName: "맑은피부",
              rating: 4,
              comment: "흡수가 빠르고 끈적임이 적어서 좋아요. 비타민C 특유의 산화 냄새가 조금 있지만 효과는 좋습니다.",
              date: "2023-03-22",
            },
          ],
        },
        {
          id: 4,
          name: "포어 컨트롤 클레이 마스크",
          brand: "이니스프리",
          category: "마스크팩",
          price: "18,000원",
          rating: 4.4,
          reviewCount: 687,
          image: require("../assets/product2.png"),
          description:
            "화산송이 클레이가 함유된 마스크로, 모공 속 노폐물과 과잉 피지를 효과적으로 제거합니다. 주 1-2회 사용으로 모공을 깨끗하게 관리하고 피부결을 매끄럽게 정돈해 줍니다.",
          ingredients: ["화산송이", "카올린", "벤토나이트", "살리실산", "티트리오일"],
          suitableFor: ["지성", "복합성", "모공 관리"],
          notSuitableFor: ["건성", "민감성"],
          reviews: [
            {
              id: 1,
              userName: "모공고민",
              rating: 5,
              comment:
                "일주일에 한 번씩 사용하는데 모공이 확실히 깨끗해지는 느낌이에요. 세안 후 피부가 매끈해지고 피지 조절에도 좋습니다.",
              date: "2023-05-30",
            },
            {
              id: 2,
              userName: "지성피부",
              rating: 4,
              comment:
                "여름에 특히 좋아요. 피지가 많이 조절되고 모공이 확 줄어든 느낌입니다. 다만 건조한 부위에는 사용하지 않는 게 좋아요.",
              date: "2023-04-15",
            },
          ],
        },
        {
          id: 5,
          name: "수분 히알루론 앰플",
          brand: "토리든",
          category: "앰플",
          price: "32,000원",
          rating: 4.8,
          reviewCount: 1532,
          image: require("../assets/product1.png"),
          description:
            "5가지 분자 크기의 히알루론산이 함유된 고농축 수분 앰플로, 피부 깊숙이 수분을 공급하고 오랫동안 유지시켜 줍니다. 건조하고 푸석한 피부에 즉각적인 수분감을 선사합니다.",
          ingredients: ["히알루론산", "판테놀", "세라마이드", "글리세린", "베타인"],
          suitableFor: ["모든 피부 타입", "건조함", "탄력 저하"],
          notSuitableFor: ["없음"],
          reviews: [
            {
              id: 1,
              userName: "수분부족",
              rating: 5,
              comment:
                "건조한 피부에 정말 좋아요! 바르면 즉시 촉촉해지고 하루종일 당김이 없어요. 여러 제품 써봤지만 이 제품이 최고입니다.",
              date: "2023-06-05",
            },
            {
              id: 2,
              userName: "푸석피부",
              rating: 5,
              comment:
                "앰플 한 방울로도 얼굴 전체가 촉촉해져요. 흡수도 빠르고 끈적임 없이 산뜻해서 여름에도 부담 없이 사용 중입니다.",
              date: "2023-05-20",
            },
          ],
        },
        {
          id: 6,
          name: "저자극 클렌징 폼",
          brand: "라운드랩",
          category: "클렌저",
          price: "16,000원",
          rating: 4.6,
          reviewCount: 923,
          image: require("../assets/product2.png"),
          description:
            "약산성 포뮬러의 저자극 클렌징 폼으로, 피부 자극 없이 메이크업과 노폐물을 부드럽게 제거합니다. 세안 후에도 당김 없이 촉촉한 사용감을 선사합니다.",
          ingredients: ["판테놀", "센텔라아시아티카", "글리세린", "마데카소사이드", "알란토인"],
          suitableFor: ["모든 피부 타입", "민감성", "건성"],
          notSuitableFor: ["없음"],
          reviews: [
            {
              id: 1,
              userName: "민감성피부",
              rating: 5,
              comment:
                "자극 없이 순하면서도 세정력이 좋아요. 세안 후 당김도 없고 피부가 편안해요. 민감한 피부에 강추합니다!",
              date: "2023-05-25",
            },
            {
              id: 2,
              userName: "아토피맘",
              rating: 4,
              comment: "아토피 있는 아이도 사용 가능할 정도로 순해요. 거품도 풍성하고 세정력도 나쁘지 않습니다.",
              date: "2023-04-30",
            },
          ],
        },
      ]

      // 사용자 입력에 따른 AI 설명 생성
      const aiExplanation = `
${selectedSkinType} 피부 타입과 ${selectedConcerns.join(
        ", ",
      )}에 대한 고민을 분석한 결과, 다음과 같은 제품들을 추천해 드립니다.

피부 타입 분석:
${selectedSkinType} 피부는 ${
        selectedSkinType === "건성"
          ? "수분 부족으로 인한 당김과 각질이 특징이며, 수분 공급과 보습이 중요합니다."
          : selectedSkinType === "지성"
            ? "과다한 피지 분비가 특징이며, 피지 조절과 모공 관리가 중요합니다."
            : selectedSkinType === "복합성"
              ? "T존은 지성, 볼과 턱은 건성인 특징이 있어 부위별 맞춤 케어가 필요합니다."
              : selectedSkinType === "민감성"
                ? "외부 자극에 민감하게 반응하며, 진정과 장벽 강화가 중요합니다."
                : "균형 잡힌 피부 상태로, 기본적인 관리로 건강한 피부를 유지할 수 있습니다."
      }

주요 고민 분석:
${selectedConcerns
  .map((concern) => {
    switch (concern) {
      case "건조함":
        return "- 건조함: 수분과 유분이 부족하여 나타나는 증상으로, 세라마이드나 히알루론산 성분이 도움이 됩니다."
      case "유분과다":
        return "- 유분과다: 과도한 피지 분비로 인한 증상으로, 피지 조절 성분과 가벼운 텍스처의 제품이 적합합니다."
      case "여드름":
        return "- 여드름: 모공 막힘과 염증으로 인한 증상으로, 살리실산, 티트리 오일 등의 성분이 효과적입니다."
      case "색소침착":
        return "- 색소침착: 멜라닌 색소가 과도하게 생성된 상태로, 비타민C, 나이아신아마이드 등이 개선에 도움이 됩니다."
      case "주름":
        return "- 주름: 콜라겐과 탄력 감소로 인한 증상으로, 레티놀, 펩타이드 등의 성분이 효과적입니다."
      case "모공":
        return "- 모공: 피지 분비와 탄력 저하로 인해 확장된 상태로, BHA, 클레이 성분 등이 도움이 됩니다."
      case "민감성":
        return "- 민감성: 외부 자극에 쉽게 반응하는 상태로, 진정 성분과 저자극 제품이 적합합니다."
      case "홍조":
        return "- 홍조: 혈관 확장으로 인한 증상으로, 진정 성분과 항염 성분이 도움이 됩니다."
      case "탄력저하":
        return "- 탄력저하: 콜라겐과 엘라스틴 감소로 인한 증상으로, 펩타이드, 레티놀 등이 효과적입니다."
      case "각질":
        return "- 각질: 각질 턴오버 주기 이상으로 인한 증상으로, AHA, PHA 등의 각질 제거 성분이 도움이 됩니다."
      default:
        return `- ${concern}: 맞춤형 케어가 필요한 고민입니다.`
    }
  })
  .join("\n")}

${additionalInfo ? `추가 정보 분석:\n${additionalInfo}` : ""}

이러한 분석을 바탕으로, 다른 사용자들의 리뷰와 평가를 고려하여 가장 효과적인 제품들을 선별했습니다. 특히 ${
        selectedSkinType === "건성"
          ? "수분 세라마이드 크림과 수분 히알루론 앰플"
          : selectedSkinType === "지성"
            ? "포어 컨트롤 클레이 마스크와 저자극 클렌징 폼"
            : selectedSkinType === "복합성"
              ? "진정 시카 토너와 비타민C 세럼"
              : selectedSkinType === "민감성"
                ? "진정 시카 토너와 저자극 클렌징 폼"
                : "비타민C 세럼과 수분 히알루론 앰플"
      }이 ${selectedSkinType} 피부 타입과 ${selectedConcerns.join(", ")} 고민에 가장 효과적일 것으로 예상됩니다.
`

      setAiExplanation(aiExplanation)
      setRecommendedCosmetics(mockCosmetics)
      setFilteredCosmetics(mockCosmetics)
      setIsAnalyzing(false)
      setShowResults(true)
    }, 3000)
  }

  // 뒤로가기
  const handleBackPress = () => {
    if (showResults) {
      // 결과 화면에서 뒤로가기 시 입력 화면으로
      setShowResults(false)
      setRecommendedCosmetics([])
      setFilteredCosmetics([])
      setAiExplanation("")
      setActiveCategory(null)
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity >
          
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
                  (category === "전체" && activeCategory === null) || activeCategory === category
                    ? styles.activeCategoryButton
                    : {},
                ]}
                onPress={() => setActiveCategory(category === "전체" ? null : category)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    (category === "전체" && activeCategory === null) || activeCategory === category
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
            {filteredCosmetics.map((cosmetic) => (
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
            ))}
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
              {skinTypeOptions.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.optionButton, selectedSkinType === type && styles.selectedOptionButton]}
                  onPress={() => setSelectedSkinType(type)}
                >
                  <Text style={[styles.optionButtonText, selectedSkinType === type && styles.selectedOptionButtonText]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 피부 고민 선택 */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>피부 고민</Text>
            <Text style={styles.sectionSubtitle}>주요 피부 고민을 최대 3개까지 선택해주세요.</Text>
            <View style={styles.concernsContainer}>
              {skinConcernOptions.map((concern) => (
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
