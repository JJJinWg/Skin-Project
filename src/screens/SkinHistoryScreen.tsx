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
import { diagnosisService, type SkinAnalysisHistory } from "../services/diagnosisService"

interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// 화장품 추천 내역 타입
type CosmeticRecommendationHistory = {
  id: number
  date: string
  skinType: string
  concerns: string[]
  explanation?: string
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

  // 영어 상태를 한국어로 매핑하는 함수
  const translateSkinType = (englishType: string): string => {
    const typeMap: { [key: string]: string } = {
      'oily': '지성',
      'dry': '건성', 
      'combination': '복합성',
      'sensitive': '민감성',
      'normal': '정상',
      'lesion': '병변', // 질환이 있는 경우
      'mixed': '복합성',
      'dehydrated': '수분부족',
      // 기타 상태들도 추가 가능
    };
    return typeMap[englishType.toLowerCase()] || englishType;
  };

  const translateConcern = (englishConcern: string): string => {
    const concernMap: { [key: string]: string } = {
      'acne': '여드름',
      'pores': '모공',
      'lesion': '병변',
      'wrinkles': '주름',
      'pigmentation': '색소침착',
      'dryness': '건조함',
      'oiliness': '유분',
      'sensitivity': '민감성',
      'redness': '홍조',
      'blackheads': '블랙헤드',
      'whiteheads': '화이트헤드',
      'wrinkle': '주름',
      'inflammation': '염증',
      'roughness': '거칠음',
      // 추가 고민사항들...
    };
    return concernMap[englishConcern.toLowerCase()] || englishConcern;
  };

  // 피부 상태를 한국어로 번역하는 함수 추가
  const translateSkinState = (englishState: string): string => {
    const stateMap: { [key: string]: string } = {
      'lesion': '병변',
      'wrinkle': '주름',
      'lip_dryness': '입술 건조',
      'chin_sagging': '턱 처짐',
      'normal': '정상',
      'healthy': '건강함',
      'problematic': '문제있음',
      'good': '양호',
      'fair': '보통',
      'poor': '나쁨',
      'excellent': '우수',
    };
    return stateMap[englishState.toLowerCase()] || englishState;
  };

  // 피부 질환을 한국어로 번역하는 함수 추가
  const translateSkinDisease = (englishDisease: string): string => {
    const diseaseMap: { [key: string]: string } = {
      'acne': '여드름',
      'dermatitis': '피부염',
      'eczema': '습진',
      'psoriasis': '건선',
      'rosacea': '주사',
      'melasma': '기미',
      'hyperpigmentation': '과색소침착',
      'age spots': '노인성 반점',
      'sun damage': '광노화',
      'seborrheic dermatitis': '지루성 피부염',
      'contact dermatitis': '접촉성 피부염',
      'keratosis': '각화증',
      'folliculitis': '모낭염',
      'cellulitis': '봉와직염',
      'hives': '두드러기',
      'warts': '사마귀',
      'moles': '점',
      'skin cancer': '피부암',
      'basal cell carcinoma': '기저세포암',
      'melanoma': '흑색종',
      'squamous cell carcinoma': '편평세포암',
      'normal': '정상',
      'healthy': '건강함',
      'no disease detected': '질환 없음',
      'inflammatory': '염증성',
      'lesion': '병변',
      'benign': '양성',
      'malignant': '악성',
    };
    return diseaseMap[englishDisease.toLowerCase()] || englishDisease;
  };

  // 피부 분석 내역 가져오기
  useEffect(() => {
    const loadSkinHistory = async () => {
      try {
        setLoading(true)
        console.log('🔍 AI 피부 분석 내역 로딩 중...');
        
        // diagnosisService를 사용하여 실제 AI 분석 내역 조회
        const diagnosisHistory = await diagnosisService.getSkinAnalysisHistory(1); // TODO: 실제 사용자 ID로 변경
        console.log('📋 받은 분석 내역:', diagnosisHistory);
        
        // 영어 → 한국어 변환 후 그대로 사용
        const processedHistory: SkinAnalysisHistory[] = diagnosisHistory.map((analysis: SkinAnalysisHistory) => {
          // 영어 → 한국어 변환
          const translatedSkinType = translateSkinType(analysis.skinType);
          const translatedConcerns = analysis.concerns.map((concern: string) => translateConcern(concern));
          const translatedSkinState = analysis.analysisResult.skinState ? translateSkinState(analysis.analysisResult.skinState) : undefined;
          const translatedSkinDisease = analysis.analysisResult.skinDisease ? translateSkinDisease(analysis.analysisResult.skinDisease) : undefined;
          
          // detailed_analysis도 번역
          let translatedDetailedAnalysis = analysis.analysisResult.detailedAnalysis;
          if (translatedDetailedAnalysis) {
            // skin_state의 all_detections 번역
            if (translatedDetailedAnalysis.skin_state?.all_detections) {
              const translatedDetections: { [key: string]: number } = {};
              Object.entries(translatedDetailedAnalysis.skin_state.all_detections).forEach(([key, value]) => {
                const translatedKey = translateSkinState(key);
                translatedDetections[translatedKey] = value as number;
              });
              translatedDetailedAnalysis = {
                ...translatedDetailedAnalysis,
                skin_state: {
                  ...translatedDetailedAnalysis.skin_state,
                  all_detections: translatedDetections,
                  state: translatedSkinState || translatedDetailedAnalysis.skin_state.state
                }
              };
            }
            
            // skin_disease의 all_detections 번역
            if (translatedDetailedAnalysis.skin_disease?.all_detections) {
              const translatedDetections: { [key: string]: number } = {};
              Object.entries(translatedDetailedAnalysis.skin_disease.all_detections).forEach(([key, value]) => {
                const translatedKey = translateSkinDisease(key);
                translatedDetections[translatedKey] = value as number;
              });
              translatedDetailedAnalysis = {
                ...translatedDetailedAnalysis,
                skin_disease: {
                  ...translatedDetailedAnalysis.skin_disease,
                  all_detections: translatedDetections,
                  disease: translatedSkinDisease || translatedDetailedAnalysis.skin_disease.disease
                }
              };
            }
          }
          
          return {
            ...analysis, // 원본 데이터 그대로 유지
            skinType: translatedSkinType,
            concerns: translatedConcerns,
            analysisResult: {
              ...analysis.analysisResult,
              skinType: translatedSkinType,
              concerns: translatedConcerns,
              skinState: translatedSkinState, // 피부 상태도 번역
              skinDisease: translatedSkinDisease, // 피부 질환도 번역
              detailedAnalysis: translatedDetailedAnalysis, // 상세 분석도 번역
            }
          };
        });
        
        setAnalysisHistory(processedHistory)
        console.log(`📋 AI 피부 분석 내역: ${processedHistory.length}개 로드됨`);
      } catch (error) {
        console.error('❌ 피부 분석 내역 로드 실패:', error)
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
        
        // 각 추천 내역의 제품들에 대해 실제 이미지 정보 업데이트 (ProfileScreen 방식 적용)
        const updatedRecommendations: CosmeticRecommendationHistory[] = [];
        
        for (const recommendation of savedRecommendations) {
          const updatedProducts = [];
          
          for (const product of recommendation.recommendedProducts) {
            try {
              console.log(`🔍 히스토리 제품 ${product.id} 실제 정보 조회 중...`);
              const actualProduct = await productService.getProductById(product.id);
              
              if (actualProduct) {
                console.log(`✅ 히스토리 제품 ${product.id} 실제 이미지:`, actualProduct.image);
                updatedProducts.push({
                  ...product,
                  image: actualProduct.image, // 실제 제품 이미지 사용
                  name: actualProduct.name,
                  brand: actualProduct.brand,
                  category: actualProduct.category,
                });
              } else {
                console.warn(`⚠️ 히스토리 제품 ${product.id} 정보를 찾을 수 없습니다.`);
                updatedProducts.push(product); // 원본 그대로 사용
              }
            } catch (error) {
              console.warn(`⚠️ 히스토리 제품 ${product.id} 정보 조회 실패:`, error);
              updatedProducts.push(product); // 원본 그대로 사용
            }
          }
          
          updatedRecommendations.push({
            ...recommendation,
            recommendedProducts: updatedProducts,
          });
        }
        
        setRecommendationHistory(updatedRecommendations);
        console.log(`📋 화장품 추천 내역: ${updatedRecommendations.length}개 로드됨`);
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
    // 해당 분석 데이터 찾기
    const selectedAnalysis = analysisHistory.find(item => item.id === analysisId);
    
    if (selectedAnalysis) {
      console.log('🔍 선택된 분석 내역:', selectedAnalysis);
      
      // 실제 분석 데이터를 SkinAnalysisResultScreen으로 전달
      navigation.navigate("SkinAnalysisResultScreen", {
        imageUri: selectedAnalysis.imageUrl || "https://example.com/skin-analysis-1.jpg",
        analysisResult: {
          skinType: selectedAnalysis.skinType,
          concerns: selectedAnalysis.concerns,
          recommendations: selectedAnalysis.recommendations,
          imageUrl: selectedAnalysis.imageUrl || "https://example.com/skin-analysis-1.jpg",
          // 추가 분석 정보들
          skinDisease: selectedAnalysis.analysisResult.skinDisease,
          skinState: selectedAnalysis.analysisResult.skinState,
          needsMedicalAttention: selectedAnalysis.analysisResult.needsMedicalAttention,
          confidence: selectedAnalysis.analysisResult.confidence,
          detailedAnalysis: selectedAnalysis.analysisResult.detailedAnalysis,
        }
      });
    } else {
      Alert.alert('오류', '분석 내역을 찾을 수 없습니다.');
    }
  }

  // 화장품 추천 상세 화면으로 이동
  const navigateToRecommendationDetail = (recommendationId: number) => {
    // 해당 추천 내역 찾기
    const selectedRecommendation = recommendationHistory.find(item => item.id === recommendationId);
    
    if (selectedRecommendation) {
      console.log('🔍 선택된 추천 내역:', selectedRecommendation);
      
      // 추천 데이터를 FindCosmeticsScreen으로 전달하여 결과 화면 표시
      navigation.navigate("FindCosmeticsScreen", {
        showResults: true,
        recommendationData: {
          skinType: selectedRecommendation.skinType,
          concerns: selectedRecommendation.concerns,
          recommendedProducts: selectedRecommendation.recommendedProducts,
          explanation: selectedRecommendation.explanation || "AI 분석 결과를 불러오는 중입니다...",
          isHistoryView: true, // 내역 보기임을 표시
        }
      });
    } else {
      Alert.alert('오류', '추천 내역을 찾을 수 없습니다.');
    }
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
                        <View style={styles.historyHeaderLeft}>
                          <Text style={styles.historyDate}>{formatDate(item.analysisDate)}</Text>
                          <View style={styles.skinTypeBadge}>
                            <Text style={styles.skinTypeText}>{item.skinType}</Text>
                          </View>
                        </View>
                        {/* 분석한 사진 작게 표시 */}
                        {item.imageUrl && (
                          <Image source={{ uri: item.imageUrl }} style={styles.historyThumbnail} />
                        )}
                      </View>

                      {/* AI 분석 결과 표시 (실제 데이터만) */}
                      {(item.analysisResult.skinDisease || item.analysisResult.skinState) && (
                        <View style={styles.analysisResultContainer}>
                          {item.analysisResult.skinDisease && (
                            <View style={styles.analysisResultItem}>
                              <Text style={styles.analysisResultLabel}>피부 질환</Text>
                              <Text style={styles.analysisResultValue}>{item.analysisResult.skinDisease}</Text>
                            </View>
                          )}
                          {item.analysisResult.skinState && (
                            <View style={styles.analysisResultItem}>
                              <Text style={styles.analysisResultLabel}>피부 상태</Text>
                              <Text style={styles.analysisResultValue}>{item.analysisResult.skinState}</Text>
                            </View>
                          )}
                          {item.analysisResult.needsMedicalAttention && (
                            <View style={styles.warningBadge}>
                              <Text style={styles.warningText}>⚠️ 의료진 상담 권장</Text>
                            </View>
                          )}
                        </View>
                      )}

                      <View style={styles.issuesContainer}>
                        <Text style={styles.issuesTitle}>주요 문제점</Text>
                        <View style={styles.issuesList}>
                          {item.concerns.map((concern: string, index: number) => (
                            <View key={index} style={styles.issueItem}>
                              <View style={[styles.issueDot, { backgroundColor: getSeverityColor('medium') }]} />
                              <Text style={styles.issueText}>{concern}</Text>
                              <View
                                style={[
                                  styles.issueSeverityBadge,
                                  { backgroundColor: getSeverityColor('medium') },
                                ]}
                              >
                                <Text style={styles.issueSeverityText}>{getSeverityText('medium')}</Text>
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
  historyHeaderLeft: {
    flexDirection: "column",
    alignItems: "flex-start",
    flex: 1,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 6,
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
  historyThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginLeft: 10,
  },
  analysisResultContainer: {
    marginBottom: 15,
  },
  analysisResultItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  analysisResultLabel: {
    fontSize: 12,
    color: "#6C757D",
    marginRight: 8,
  },
  analysisResultValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
  },
  warningBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: "#FF9800",
    borderRadius: 10,
  },
  warningText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "bold",
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
