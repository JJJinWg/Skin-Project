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

type SkinAnalysisResultScreenRouteProp = RouteProp<RootStackParamList, "SkinAnalysisResultScreen">

const SkinAnalysisResultScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const route = useRoute<SkinAnalysisResultScreenRouteProp>()
  const { imageUri, analysisResult: initialAnalysisResult } = route.params

  const [activeTab, setActiveTab] = useState<"overview" | "issues" | "recommendations">("overview")

  // 뒤로가기
  const handleBackPress = () => {
    navigation.goBack()
  }

  // 결과 공유하기
  const handleShare = async () => {
    if (!initialAnalysisResult) return

    try {
      const shareMessage = `
AI 피부 분석 결과

피부 타입: ${initialAnalysisResult.skinType}

주요 문제점:
${initialAnalysisResult.concerns.map((concern) => `- ${concern}`).join("\n")}

추천 관리법:
${initialAnalysisResult.recommendations.map((rec) => `- ${rec}`).join("\n")}
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

  if (!initialAnalysisResult) {
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
        <TouchableOpacity onPress={handleBackPress}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI 피부 분석 결과</Text>
        <TouchableOpacity onPress={handleShare}>
          <Text style={styles.shareButton}>공유</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* 분석 이미지 */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.analysisImage} />
        </View>

        {/* 피부 타입 */}
        <View style={styles.skinTypeContainer}>
          <Text style={styles.skinTypeLabel}>피부 타입</Text>
          <Text style={styles.skinTypeValue}>{initialAnalysisResult.skinType}</Text>
        </View>

        {/* 탭 메뉴 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "overview" && styles.activeTab]}
            onPress={() => setActiveTab("overview")}
          >
            <Text style={[styles.tabText, activeTab === "overview" && styles.activeTabText]}>
              개요
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "issues" && styles.activeTab]}
            onPress={() => setActiveTab("issues")}
          >
            <Text style={[styles.tabText, activeTab === "issues" && styles.activeTabText]}>
              문제점
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "recommendations" && styles.activeTab]}
            onPress={() => setActiveTab("recommendations")}
          >
            <Text style={[styles.tabText, activeTab === "recommendations" && styles.activeTabText]}>
              추천
            </Text>
          </TouchableOpacity>
        </View>

        {/* 탭 컨텐츠 */}
        <View style={styles.tabContent}>
          {activeTab === "overview" && (
            <View style={styles.overviewContainer}>
              <Text style={styles.overviewText}>
                AI가 분석한 결과, {initialAnalysisResult.skinType} 피부 타입으로 판단되었습니다.
                주요 문제점과 개선 방안을 확인해보세요.
              </Text>
            </View>
          )}

          {activeTab === "issues" && (
            <View style={styles.issuesContainer}>
              {initialAnalysisResult.concerns.map((concern, index) => (
                <View key={index} style={styles.issueItem}>
                  <Text style={styles.issueTitle}>• {concern}</Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === "recommendations" && (
            <View style={styles.recommendationsContainer}>
              {initialAnalysisResult.recommendations.map((recommendation, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Text style={styles.recommendationTitle}>• {recommendation}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
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
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
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
  contentContainer: {
    padding: 20,
  },
  imageContainer: {
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
  analysisImage: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    resizeMode: "cover",
  },
  skinTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 15,
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
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F5",
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#FF9A9E",
  },
  tabText: {
    fontSize: 14,
    color: "#6C757D",
  },
  activeTabText: {
    color: "#FF9A9E",
    fontWeight: "bold",
  },
  overviewContainer: {
    padding: 20,
  },
  overviewText: {
    fontSize: 14,
    color: "#495057",
    lineHeight: 20,
  },
  issuesContainer: {
    padding: 20,
  },
  issueItem: {
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
  issueTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
  },
  recommendationsContainer: {
    padding: 20,
  },
  recommendationItem: {
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
  tabContent: {
    flex: 1,
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
})

export default SkinAnalysisResultScreen
