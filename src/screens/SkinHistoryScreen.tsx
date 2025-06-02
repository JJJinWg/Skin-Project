// 피부 검진 진단 내역과 화장품 추천 내역을 볼 수 있는 화면
// 피부 관리 기록

import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native"
import { type NavigationProp, useNavigation } from "@react-navigation/native"
import type { RootStackParamList } from "../types/navigation"
import LinearGradient from "react-native-linear-gradient"
import { productService } from "../services/productService"

interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// 피부 분석 내역 타입
type SkinAnalysisHistory = {
  id: number
  date: string
  skinType: string
  skinAge: number
  moisture: number
  wrinkles: number
  pigmentation: number
  pores: number
  acne: number
  imageUri: string
  issues: {
    title: string
    severity: "low" | "medium" | "high"
  }[]
  analysisResult: {
    skinType: string
    concerns: string[]
    recommendations: string[]
    imageUrl: string
  }
}

// 화장품 추천 내역 타입
type CosmeticRecommendationHistory = {
  id: number
  date: string
  skinType: string
  concerns: string[]
  recommendedProducts: {
    id: number
    name: string
    brand: string
    category: string
    image: any
  }[]
}

const SkinHistoryScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const [activeTab, setActiveTab] = useState<"analysis" | "recommendations">("analysis")
  const [analysisHistory, setAnalysisHistory] = useState<SkinAnalysisHistory[]>([])
  const [recommendationHistory, setRecommendationHistory] = useState<CosmeticRecommendationHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [recommendationsLoading, setRecommendationsLoading] = useState(true)

  // 피부 분석 내역 가져오기
  useEffect(() => {
    const loadSkinHistory = async () => {
      try {
    setLoading(true)
        const response = await productService.getSkinAnalysisHistory(1) as any;
        const historyData = response;
        
        // API 응답을 SkinAnalysis 타입에 맞게 변환
        const formattedHistory: SkinAnalysisHistory[] = historyData.map((item: any) => ({
          id: item.id,
          date: item.date,
          skinType: item.skinType,
          skinAge: item.skinAge,
          moisture: item.moisture,
          wrinkles: item.wrinkles,
          pigmentation: item.pigmentation,
          pores: item.pores,
          acne: item.acne,
          imageUri: item.imageUri,
          issues: item.issues.map((issue: any) => ({
            title: issue.title,
            severity: issue.severity,
          })),
          analysisResult: {
            skinType: item.skinType,
            concerns: item.issues.map((issue: any) => issue.title),
            recommendations: item.recommendations || [],
            imageUrl: item.imageUri,
            },
        }))
        
        setAnalysisHistory(formattedHistory)
      } catch (error) {
        console.error('피부 분석 내역 로드 실패:', error)
        Alert.alert('오류', '피부 분석 내역을 불러오는데 실패했습니다.')
        setAnalysisHistory([])
      } finally {
      setLoading(false)
      }
    }

    loadSkinHistory()
  }, [])

  // 화장품 추천 내역 가져오기
  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setRecommendationsLoading(true)
        
        // 실제 저장된 추천 내역 조회
        const savedRecommendations = await productService.getRecommendationHistory(1); // 임시 사용자 ID
        setRecommendationHistory(savedRecommendations)
        
        console.log(`📋 화장품 추천 내역: ${savedRecommendations.length}개 로드됨`);
      } catch (error) {
        console.error('화장품 추천 내역 로드 실패:', error)
        Alert.alert('오류', '화장품 추천 내역을 불러오는데 실패했습니다.')
        setRecommendationHistory([])
      } finally {
        setRecommendationsLoading(false)
      }
    }

    loadRecommendations()
  }, [])

  // 날짜 포맷 변환 (YYYY-MM-DD -> YYYY년 MM월 DD일)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    return `${year}년 ${month}월 ${day}일`
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

  // 뒤로가기
  const handleBackPress = () => {
    navigation.goBack()
  }

  // 피부 분석 상세 화면으로 이동
  const navigateToAnalysisDetail = (analysisId: number) => {
    // 실제로는 해당 분석 ID를 사용하여 상세 화면으로 이동
    navigation.navigate("SkinAnalysisResultScreen", {
      imageUri: "https://example.com/skin-analysis-1.jpg",
      analysisResult: {
        skinType: '',
        concerns: [],
        recommendations: [],
        imageUrl: "https://example.com/skin-analysis-1.jpg",
      }
    })
  }

  // 화장품 추천 상세 화면으로 이동
  const navigateToRecommendationDetail = (recommendationId: number) => {
    // 실제로는 해당 추천 ID를 사용하여 상세 화면으로 이동
    navigation.navigate("FindCosmeticsScreen")
  }

  // 새로운 피부 분석 시작
  const handleNewAnalysis = () => {
    navigation.navigate("SkinDiagnosisScreen")
  }

  // 새로운 화장품 추천 받기
  const handleNewRecommendation = () => {
    navigation.navigate("FindCosmeticsScreen")
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
       
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내 피부 관리 기록</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 탭 메뉴 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "analysis" && styles.activeTabButton]}
          onPress={() => setActiveTab("analysis")}
        >
          <Text style={[styles.tabButtonText, activeTab === "analysis" && styles.activeTabButtonText]}>
            피부 분석 내역
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "recommendations" && styles.activeTabButton]}
          onPress={() => setActiveTab("recommendations")}
        >
          <Text style={[styles.tabButtonText, activeTab === "recommendations" && styles.activeTabButtonText]}>
            화장품 추천 내역
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        // 로딩 화면
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF9A9E" />
          <Text style={styles.loadingText}>내역을 불러오는 중...</Text>
        </View>
      ) : (
        // 내역 화면
        <View style={styles.container}>
          {/* 피부 분석 내역 탭 */}
          {activeTab === "analysis" && (
            <>
              {analysisHistory.length > 0 ? (
                <FlatList
                  data={analysisHistory}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.historyCard} onPress={() => navigateToAnalysisDetail(item.id)}>
                      <View style={styles.historyHeader}>
                        <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
                        <View style={styles.skinTypeBadge}>
                          <Text style={styles.skinTypeText}>{item.skinType}</Text>
                        </View>
                      </View>

                      <View style={styles.skinScoresContainer}>
                        <View style={styles.skinScoreItem}>
                          <Text style={styles.skinScoreLabel}>피부 나이</Text>
                          <Text style={styles.skinScoreValue}>{item.skinAge}세</Text>
                        </View>
                        <View style={styles.skinScoreItem}>
                          <Text style={styles.skinScoreLabel}>수분</Text>
                          <Text style={styles.skinScoreValue}>{item.moisture}%</Text>
                        </View>
                        <View style={styles.skinScoreItem}>
                          <Text style={styles.skinScoreLabel}>모공</Text>
                          <Text style={styles.skinScoreValue}>{item.pores}%</Text>
                        </View>
                      </View>

                      <View style={styles.issuesContainer}>
                        <Text style={styles.issuesTitle}>주요 문제점</Text>
                        <View style={styles.issuesList}>
                          {item.issues.map((issue, index) => (
                            <View key={index} style={styles.issueItem}>
                              <View style={[styles.issueDot, { backgroundColor: getSeverityColor(issue.severity) }]} />
                              <Text style={styles.issueText}>{issue.title}</Text>
                              <View
                                style={[
                                  styles.issueSeverityBadge,
                                  { backgroundColor: getSeverityColor(issue.severity) },
                                ]}
                              >
                                <Text style={styles.issueSeverityText}>{getSeverityText(issue.severity)}</Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      </View>

                      <TouchableOpacity style={styles.detailButton} onPress={() => navigateToAnalysisDetail(item.id)}>
                        <Text style={styles.detailButtonText}>상세 보기</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  )}
                  contentContainerStyle={styles.historyList}
                  showsVerticalScrollIndicator={false}
                  ListFooterComponent={
                    <TouchableOpacity style={styles.newButton} onPress={handleNewAnalysis}>
                      <LinearGradient
                        colors={["#A18CD1", "#FBC2EB"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.newButtonGradient}
                      >
                        <Text style={styles.newButtonText}>새로운 피부 분석하기</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  }
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyTitle}>피부 분석 내역이 없습니다</Text>
                  <Text style={styles.emptyText}>AI 피부 분석을 통해 피부 상태를 확인해보세요.</Text>
                  <TouchableOpacity style={styles.newButton} onPress={handleNewAnalysis}>
                    <LinearGradient
                      colors={["#A18CD1", "#FBC2EB"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.newButtonGradient}
                    >
                      <Text style={styles.newButtonText}>피부 분석하기</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          {/* 화장품 추천 내역 탭 */}
          {activeTab === "recommendations" && (
            <>
              {recommendationHistory.length > 0 ? (
                <FlatList
                  data={recommendationHistory}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.historyCard}
                      onPress={() => navigateToRecommendationDetail(item.id)}
                    >
                      <View style={styles.historyHeader}>
                        <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
                        <View style={styles.skinTypeBadge}>
                          <Text style={styles.skinTypeText}>{item.skinType}</Text>
                        </View>
                      </View>

                      <View style={styles.concernsContainer}>
                        <Text style={styles.concernsTitle}>피부 고민</Text>
                        <View style={styles.concernsList}>
                          {item.concerns.map((concern, index) => (
                            <View key={index} style={styles.concernBadge}>
                              <Text style={styles.concernText}>{concern}</Text>
                            </View>
                          ))}
                        </View>
                      </View>

                      <View style={styles.productsContainer}>
                        <Text style={styles.productsTitle}>추천 제품 ({item.recommendedProducts.length})</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsList}>
                          {item.recommendedProducts.map((product, index) => (
                            <View key={index} style={styles.productItem}>
                              <Image source={product.image} style={styles.productImage} />
                              <Text style={styles.productBrand}>{product.brand}</Text>
                              <Text style={styles.productName} numberOfLines={2}>
                                {product.name}
                              </Text>
                              <View style={styles.productCategoryBadge}>
                                <Text style={styles.productCategoryText}>{product.category}</Text>
                              </View>
                            </View>
                          ))}
                        </ScrollView>
                      </View>

                      <TouchableOpacity
                        style={styles.detailButton}
                        onPress={() => navigateToRecommendationDetail(item.id)}
                      >
                        <Text style={styles.detailButtonText}>상세 보기</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  )}
                  contentContainerStyle={styles.historyList}
                  showsVerticalScrollIndicator={false}
                  ListFooterComponent={
                    <TouchableOpacity style={styles.newButton} onPress={handleNewRecommendation}>
                      <LinearGradient
                        colors={["#84FAB0", "#8FD3F4"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.newButtonGradient}
                      >
                        <Text style={styles.newButtonText}>새로운 화장품 추천받기</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  }
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyTitle}>화장품 추천 내역이 없습니다</Text>
                  <Text style={styles.emptyText}>AI 화장품 추천을 통해 맞춤형 화장품을 추천받아보세요.</Text>
                  <TouchableOpacity style={styles.newButton} onPress={handleNewRecommendation}>
                    <LinearGradient
                      colors={["#84FAB0", "#8FD3F4"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.newButtonGradient}
                    >
                      <Text style={styles.newButtonText}>화장품 추천받기</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
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
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
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
  historyList: {
    padding: 20,
    paddingBottom: 40,
  },
  historyCard: {
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
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#212529",
  },
  skinTypeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: "#F1F9FE",
    borderRadius: 12,
  },
  skinTypeText: {
    fontSize: 12,
    color: "#0078D7",
    fontWeight: "500",
  },
  skinScoresContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 15,
  },
  skinScoreItem: {
    alignItems: "center",
  },
  skinScoreLabel: {
    fontSize: 12,
    color: "#6C757D",
    marginBottom: 5,
  },
  skinScoreValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
  },
  issuesContainer: {
    marginBottom: 15,
  },
  issuesTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 10,
  },
  issuesList: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
  },
  issueItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  issueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  issueText: {
    flex: 1,
    fontSize: 14,
    color: "#495057",
  },
  issueSeverityBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  issueSeverityText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  detailButton: {
    alignSelf: "flex-end",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  detailButtonText: {
    fontSize: 12,
    color: "#6C757D",
  },
  concernsContainer: {
    marginBottom: 15,
  },
  concernsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 10,
  },
  concernsList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  concernBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: "rgba(132, 250, 176, 0.2)",
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  concernText: {
    fontSize: 12,
    color: "#2E7D32",
  },
  productsContainer: {
    marginBottom: 15,
  },
  productsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 10,
  },
  productsList: {
    marginBottom: 10,
  },
  productItem: {
    width: 120,
    marginRight: 10,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  productBrand: {
    fontSize: 10,
    color: "#6C757D",
    marginBottom: 2,
  },
  productName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 4,
    height: 32,
  },
  productCategoryBadge: {
    alignSelf: "flex-start",
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: "#F1F9FE",
    borderRadius: 8,
  },
  productCategoryText: {
    fontSize: 10,
    color: "#0078D7",
  },
  newButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 10,
  },
  newButtonGradient: {
    paddingVertical: 15,
    alignItems: "center",
  },
  newButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6C757D",
    textAlign: "center",
    marginBottom: 20,
  },
})

export default SkinHistoryScreen
