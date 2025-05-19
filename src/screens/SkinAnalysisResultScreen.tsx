//AI 피부 분석 결과 화면



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
  ActivityIndicator,
  Share,
  Alert,
} from "react-native"
import { type NavigationProp, useNavigation, type RouteProp, useRoute } from "@react-navigation/native"
import type { RootStackParamList } from "../types/navigation"
import LinearGradient from "react-native-linear-gradient"

// 피부 분석 결과 타입
type SkinAnalysisResult = {
  skinType: string
  skinAge: number
  moisture: number
  wrinkles: number
  pigmentation: number
  pores: number
  acne: number
  issues: {
    title: string
    description: string
    severity: "low" | "medium" | "high"
  }[]
  recommendations: {
    title: string
    description: string
    products?: {
      name: string
      description: string
      image: any
    }[]
  }[]
}

type SkinAnalysisResultScreenRouteProp = RouteProp<{ params: { imageUri: string } }, "params">

const SkinAnalysisResultScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const route = useRoute<SkinAnalysisResultScreenRouteProp>()
  const { imageUri } = route.params

  const [analysisResult, setAnalysisResult] = useState<SkinAnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "issues" | "recommendations">("overview")

  // 분석 결과 가져오기 (API 호출 시뮬레이션)
  useEffect(() => {
    // 실제로는 이미지를 서버에 업로드하고 AI 분석 결과를 받아옴
    setTimeout(() => {
      const mockResult: SkinAnalysisResult = {
        skinType: "복합성",
        skinAge: 28,
        moisture: 65,
        wrinkles: 25,
        pigmentation: 40,
        pores: 55,
        acne: 30,
        issues: [
          {
            title: "건조함",
            description:
              "T존을 제외한 부위에서 건조함이 감지되었습니다. 특히 볼 부위의 수분 부족이 두드러집니다. 이는 계절적 요인이나 부적절한 보습 관리로 인한 것일 수 있습니다.",
            severity: "medium",
          },
          {
            title: "모공 확장",
            description:
              "코와 이마 부위에 확장된 모공이 관찰됩니다. 과도한 피지 분비와 불완전한 클렌징으로 인해 모공이 확장될 수 있습니다.",
            severity: "high",
          },
          {
            title: "색소침착",
            description:
              "양 볼과 이마에 경미한 색소침착이 있습니다. 이는 자외선 노출이나 염증 후 색소침착으로 인한 것일 수 있습니다.",
            severity: "low",
          },
        ],
        recommendations: [
          {
            title: "수분 공급 강화",
            description:
              "히알루론산이나 세라마이드가 함유된 보습제를 사용하여 피부 수분 장벽을 강화하세요. 하루에 최소 2리터의 물을 마시는 것도 피부 수분 유지에 도움이 됩니다.",
            products: [
              {
                name: "세라마이드 보습 크림",
                description: "건조한 피부를 위한 집중 보습 크림",
                image: require("../assets/product1.png"),
              },
              {
                name: "히알루론산 세럼",
                description: "깊은 수분 공급을 위한 고농축 세럼",
                image: require("../assets/product2.png"),
              },
            ],
          },
          {
            title: "모공 관리",
            description:
              "주 2-3회 BHA(살리실산) 성분이 함유된 각질 제거제를 사용하여 모공 속 노폐물을 제거하세요. 클레이 마스크도 일주일에 1-2회 사용하면 모공 관리에 효과적입니다.",
            products: [
              {
                name: "BHA 토너",
                description: "모공 속 노폐물 제거에 효과적인 토너",
                image: require("../assets/product1.png"),
              },
            ],
          },
          {
            title: "색소침착 개선",
            description:
              "비타민C, 나이아신아마이드, 알부틴 등의 성분이 함유된 제품을 사용하여 색소침착을 개선하세요. 자외선 차단제를 매일 사용하는 것도 중요합니다.",
            products: [
              {
                name: "비타민C 세럼",
                description: "색소침착 개선 및 피부 톤 정돈",
                image: require("../assets/product2.png"),
              },
            ],
          },
        ],
      }
      setAnalysisResult(mockResult)
      setLoading(false)
    }, 1500)
  }, [])

  // 뒤로가기
  const handleBackPress = () => {
    navigation.goBack()
  }

  // 결과 공유하기
  const handleShare = async () => {
    if (!analysisResult) return

    try {
      const shareMessage = `
AI 피부 분석 결과

피부 타입: ${analysisResult.skinType}
피부 나이: ${analysisResult.skinAge}세
수분: ${analysisResult.moisture}%
주름: ${analysisResult.wrinkles}%
색소침착: ${analysisResult.pigmentation}%
모공: ${analysisResult.pores}%
여드름: ${analysisResult.acne}%

주요 문제점:
${analysisResult.issues.map((issue) => `- ${issue.title}`).join("\n")}

추천 관리법:
${analysisResult.recommendations.map((rec) => `- ${rec.title}`).join("\n")}
`

      await Share.share({
        message: shareMessage,
        title: "AI 피부 분석 결과",
      })
    } catch (error) {
      console.error("Error sharing analysis result:", error)
    }
  }

  // 심각도에 따른 색상 반환
  const getSeverityColor = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "low":
        return "#4CAF50" // 초록색
      case "medium":
        return "#FF9800" // 주황색
      case "high":
        return "#F44336" // 빨간색
      default:
        return "#757575" // 회색
    }
  }

  // 심각도 텍스트 반환
  const getSeverityText = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "low":
        return "낮음"
      case "medium":
        return "중간"
      case "high":
        return "높음"
      default:
        return ""
    }
  }

  // 점수 바 렌더링
  const renderScoreBar = (score: number, color: string) => {
    return (
      <View style={styles.scoreBarContainer}>
        <View style={[styles.scoreBar, { width: `${score}%`, backgroundColor: color }]} />
      </View>
    )
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF9A9E" />
          <Text style={styles.loadingText}>피부 분석 결과를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!analysisResult) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>분석 결과를 불러올 수 없습니다.</Text>
          <TouchableOpacity style={styles.backButtonLarge} onPress={handleBackPress}>
            <Text style={styles.backButtonLargeText}>돌아가기</Text>
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
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>피부 분석 결과</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>공유</Text>
        </TouchableOpacity>
      </View>

      {/* 탭 메뉴 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "overview" && styles.activeTabButton]}
          onPress={() => setActiveTab("overview")}
        >
          <Text style={[styles.tabButtonText, activeTab === "overview" && styles.activeTabButtonText]}>개요</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "issues" && styles.activeTabButton]}
          onPress={() => setActiveTab("issues")}
        >
          <Text style={[styles.tabButtonText, activeTab === "issues" && styles.activeTabButtonText]}>문제점</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "recommendations" && styles.activeTabButton]}
          onPress={() => setActiveTab("recommendations")}
        >
          <Text style={[styles.tabButtonText, activeTab === "recommendations" && styles.activeTabButtonText]}>
            추천 관리법
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 개요 탭 */}
        {activeTab === "overview" && (
          <View style={styles.overviewContainer}>
            {/* 분석된 이미지 */}
            <View style={styles.imageCard}>
              <Image source={{ uri: imageUri }} style={styles.analyzedImage} />
              <View style={styles.imageOverlay}>
                <Text style={styles.overlayText}>AI 분석 완료</Text>
              </View>
            </View>

            {/* 피부 타입 및 나이 */}
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>피부 분석 결과</Text>
                <Text style={styles.analysisDate}>분석일: {new Date().toLocaleDateString()}</Text>
              </View>

              <View style={styles.skinTypeContainer}>
                <View style={styles.skinTypeItem}>
                  <Text style={styles.skinTypeLabel}>피부 타입</Text>
                  <Text style={styles.skinTypeValue}>{analysisResult.skinType}</Text>
                </View>
                <View style={styles.skinTypeItem}>
                  <Text style={styles.skinTypeLabel}>피부 나이</Text>
                  <Text style={styles.skinTypeValue}>{analysisResult.skinAge}세</Text>
                </View>
              </View>

              {/* 피부 상태 점수 */}
              <View style={styles.scoresContainer}>
                <View style={styles.scoreItem}>
                  <View style={styles.scoreHeader}>
                    <Text style={styles.scoreLabel}>수분</Text>
                    <Text style={styles.scoreValue}>{analysisResult.moisture}%</Text>
                  </View>
                  {renderScoreBar(analysisResult.moisture, "#4FC3F7")}
                </View>

                <View style={styles.scoreItem}>
                  <View style={styles.scoreHeader}>
                    <Text style={styles.scoreLabel}>주름</Text>
                    <Text style={styles.scoreValue}>{analysisResult.wrinkles}%</Text>
                  </View>
                  {renderScoreBar(analysisResult.wrinkles, "#FF9800")}
                </View>

                <View style={styles.scoreItem}>
                  <View style={styles.scoreHeader}>
                    <Text style={styles.scoreLabel}>색소침착</Text>
                    <Text style={styles.scoreValue}>{analysisResult.pigmentation}%</Text>
                  </View>
                  {renderScoreBar(analysisResult.pigmentation, "#9C27B0")}
                </View>

                <View style={styles.scoreItem}>
                  <View style={styles.scoreHeader}>
                    <Text style={styles.scoreLabel}>모공</Text>
                    <Text style={styles.scoreValue}>{analysisResult.pores}%</Text>
                  </View>
                  {renderScoreBar(analysisResult.pores, "#F44336")}
                </View>

                <View style={styles.scoreItem}>
                  <View style={styles.scoreHeader}>
                    <Text style={styles.scoreLabel}>여드름</Text>
                    <Text style={styles.scoreValue}>{analysisResult.acne}%</Text>
                  </View>
                  {renderScoreBar(analysisResult.acne, "#8BC34A")}
                </View>
              </View>

              {/* 요약 */}
              <View style={styles.summarySectionContainer}>
                <Text style={styles.summaryTitle}>요약</Text>
                <Text style={styles.summaryText}>
                  피부 타입은 <Text style={styles.highlightText}>{analysisResult.skinType}</Text>이며, 주요 문제점은{" "}
                  <Text style={styles.highlightText}>
                    {analysisResult.issues.map((issue) => issue.title).join(", ")}
                  </Text>{" "}
                  입니다. 피부 관리를 위해{" "}
                  <Text style={styles.highlightText}>
                    {analysisResult.recommendations.map((rec) => rec.title).join(", ")}
                  </Text>
                  을 권장합니다.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 문제점 탭 */}
        {activeTab === "issues" && (
          <View style={styles.issuesContainer}>
            {analysisResult.issues.map((issue, index) => (
              <View key={index} style={styles.issueCard}>
                <View style={styles.issueHeader}>
                  <Text style={styles.issueTitle}>{issue.title}</Text>
                  <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(issue.severity) }]}>
                    <Text style={styles.severityText}>심각도: {getSeverityText(issue.severity)}</Text>
                  </View>
                </View>
                <Text style={styles.issueDescription}>{issue.description}</Text>
              </View>
            ))}

            <TouchableOpacity style={styles.consultButton} onPress={() => navigation.navigate("ReservationScreen")}>
              <LinearGradient
                colors={["#FF9A9E", "#FAD0C4"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.consultButtonGradient}
              >
                <Text style={styles.consultButtonText}>전문의 상담 예약하기</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* 추천 관리법 탭 */}
        {activeTab === "recommendations" && (
          <View style={styles.recommendationsContainer}>
            {analysisResult.recommendations.map((recommendation, index) => (
              <View key={index} style={styles.recommendationCard}>
                <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
                <Text style={styles.recommendationDescription}>{recommendation.description}</Text>

                {recommendation.products && recommendation.products.length > 0 && (
                  <View style={styles.productsContainer}>
                    <Text style={styles.productsTitle}>추천 제품</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {recommendation.products.map((product, productIndex) => (
                        <TouchableOpacity
                          key={productIndex}
                          style={styles.productCard}
                          onPress={() => Alert.alert("제품 정보", `${product.name}\n\n${product.description}`)}
                        >
                          <Image source={product.image} style={styles.productImage} />
                          <Text style={styles.productName}>{product.name}</Text>
                          <Text style={styles.productDescription} numberOfLines={2}>
                            {product.description}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            ))}

            <TouchableOpacity style={styles.shopButton} onPress={() => navigation.navigate("ProductReviewScreen")}>
              <LinearGradient
                colors={["#84FAB0", "#8FD3F4"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shopButtonGradient}
              >
                <Text style={styles.shopButtonText}>추천 제품 더 보기</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* 하단 여백 */}
        <View style={styles.bottomSpacer} />
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
  shareButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
  },
  shareButtonText: {
    fontSize: 14,
    color: "#6C757D",
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
  backButtonLarge: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#FF9A9E",
    borderRadius: 8,
  },
  backButtonLargeText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
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
  // 개요 탭 스타일
  overviewContainer: {
    padding: 20,
  },
  imageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
  },
  analyzedImage: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    resizeMode: "cover",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  overlayText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  resultCard: {
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
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
  },
  analysisDate: {
    fontSize: 12,
    color: "#6C757D",
  },
  skinTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 15,
  },
  skinTypeItem: {
    alignItems: "center",
    flex: 1,
  },
  skinTypeLabel: {
    fontSize: 14,
    color: "#6C757D",
    marginBottom: 5,
  },
  skinTypeValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
  },
  scoresContainer: {
    marginBottom: 20,
  },
  scoreItem: {
    marginBottom: 12,
  },
  scoreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  scoreLabel: {
    fontSize: 14,
    color: "#212529",
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#212529",
  },
  scoreBarContainer: {
    height: 8,
    backgroundColor: "#E9ECEF",
    borderRadius: 4,
    overflow: "hidden",
  },
  scoreBar: {
    height: "100%",
    borderRadius: 4,
  },
  summarySectionContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 15,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 14,
    color: "#495057",
    lineHeight: 20,
  },
  highlightText: {
    fontWeight: "bold",
    color: "#FF9A9E",
  },
  // 문제점 탭 스타일
  issuesContainer: {
    padding: 20,
  },
  issueCard: {
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
  issueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
  },
  severityBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  severityText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  issueDescription: {
    fontSize: 14,
    color: "#495057",
    lineHeight: 20,
  },
  consultButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 10,
  },
  consultButtonGradient: {
    paddingVertical: 15,
    alignItems: "center",
  },
  consultButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  // 추천 관리법 탭 스타일
  recommendationsContainer: {
    padding: 20,
  },
  recommendationCard: {
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
  recommendationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 10,
  },
  recommendationDescription: {
    fontSize: 14,
    color: "#495057",
    lineHeight: 20,
    marginBottom: 15,
  },
  productsContainer: {
    marginTop: 5,
  },
  productsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 10,
  },
  productCard: {
    width: 150,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 10,
    marginRight: 10,
  },
  productImage: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: "#6C757D",
  },
  shopButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 10,
  },
  shopButtonGradient: {
    paddingVertical: 15,
    alignItems: "center",
  },
  shopButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomSpacer: {
    height: 40,
  },
})

export default SkinAnalysisResultScreen
