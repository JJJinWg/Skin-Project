//AI피부 검진 화면

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from "react-native"
import { type NavigationProp, useNavigation } from "@react-navigation/native"
import type { RootStackParamList } from "../types/navigation"
import LinearGradient from "react-native-linear-gradient"
import { launchCamera, launchImageLibrary } from "react-native-image-picker"
import { diagnosisService } from "../services/diagnosisService"
import React from "react"

const SkinDiagnosisScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const [selectedImage, setSelectedImage] = useState<{ uri: string } | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // 카메라로 사진 촬영
  const handleTakePhoto = async () => {
    // Android에서 카메라 권한 요청
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: '카메라 권한',
            message: '사진 촬영을 위해 카메라 권한이 필요합니다.',
            buttonNeutral: '나중에',
            buttonNegative: '거부',
            buttonPositive: '허용',
          }
        );
        
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('권한 필요', '카메라 사용을 위해 권한이 필요합니다.');
          return;
        }
      } catch (err) {
        console.warn(err);
        Alert.alert('오류', '권한 요청 중 문제가 발생했습니다.');
        return;
      }
    }

    launchCamera(
      {
        mediaType: "photo",
        includeBase64: false,
        maxHeight: 1200,
        maxWidth: 1200,
        cameraType: "front", // 전면 카메라를 기본으로 설정
        quality: 0.8,
      },
      (response) => {
        if (response.didCancel) {
          console.log("User cancelled camera picker")
        } else if (response.errorCode) {
          console.log("Camera Error: ", response.errorMessage)
          Alert.alert("오류", "카메라를 실행하는 중 문제가 발생했습니다.")
        } else if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0]
          if (asset.uri) {
            setSelectedImage({ uri: asset.uri })
          }
        }
      },
    )
  }

  // 갤러리에서 사진 선택
  const handleSelectPhoto = () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        includeBase64: false,
        maxHeight: 1200,
        maxWidth: 1200,
        quality: 0.8,
        selectionLimit: 1,
      },
      (response) => {
        if (response.didCancel) {
          console.log("User cancelled image picker")
        } else if (response.errorCode) {
          console.log("ImagePicker Error: ", response.errorMessage)
          Alert.alert("오류", "이미지를 선택하는 중 문제가 발생했습니다.")
        } else if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0]
          if (asset.uri) {
            setSelectedImage({ uri: asset.uri })
          }
        }
      },
    )
  }

  // 사진 분석 시작
  const handleAnalyzePhoto = async () => {
    if (!selectedImage) {
      Alert.alert("알림", "분석할 사진을 먼저 선택해주세요.")
      return
    }

    setIsAnalyzing(true)

    try {
      const result = await diagnosisService.analyzeSkin(selectedImage.uri)
      if (result) {
        // 분석 결과 화면으로 이동
        navigation.navigate("SkinAnalysisResultScreen", { 
          imageUri: selectedImage.uri,
          analysisResult: result
        })
      } else {
        Alert.alert("오류", "피부 분석에 실패했습니다. 다시 시도해주세요.")
      }
    } catch (error) {
      console.error("피부 분석 실패:", error)
      Alert.alert("오류", "피부 분석 중 문제가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  // 뒤로가기
  const handleBackPress = () => {
    navigation.goBack()
  }

  // 사진 다시 선택
  const handleResetImage = () => {
    setSelectedImage(null)
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity  >
          
        </TouchableOpacity>
        <Text style={styles.headerTitle}>         AI 피부 검진</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* 안내 텍스트 */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>AI 피부 분석</Text>
          <Text style={styles.infoText}>
            얼굴 사진을 업로드하면 AI가 피부 상태를 분석하여 피부 타입, 문제점, 개선 방안을 제안해 드립니다.
          </Text>
          <View style={styles.tipContainer}>
            <Text style={styles.tipTitle}>촬영 팁</Text>
            <Text style={styles.tipText}>• 자연광이 있는 환경에서 촬영하세요.</Text>
            <Text style={styles.tipText}>• 얼굴 전체가 잘 보이도록 촬영하세요.</Text>
            <Text style={styles.tipText}>• 화장을 하지 않은 상태가 가장 정확합니다.</Text>
          </View>
        </View>

        {/* 이미지 선택/표시 영역 */}
        <View style={styles.imageContainer}>
          {selectedImage ? (
            <>
              <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />
              <TouchableOpacity style={styles.resetButton} onPress={handleResetImage}>
                <Text style={styles.resetButtonText}>다시 선택</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderIcon}>📷</Text>
              <Text style={styles.placeholderText}>사진을 촬영하거나 선택해주세요</Text>
            </View>
          )}
        </View>

        {/* 사진 선택 버튼 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
            <LinearGradient
              colors={["#FFC3A0", "#FFAFBD"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.photoButtonGradient}
            >
              <Text style={styles.photoButtonText}>카메라로 촬영</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.photoButton} onPress={handleSelectPhoto}>
            <LinearGradient
              colors={["#84FAB0", "#8FD3F4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.photoButtonGradient}
            >
              <Text style={styles.photoButtonText}>갤러리에서 선택</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* 분석 버튼 */}
        {selectedImage && (
          <TouchableOpacity
            style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
            onPress={handleAnalyzePhoto}
            disabled={isAnalyzing}
          >
            <LinearGradient
              colors={["#FF9A9E", "#FAD0C4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.analyzeButtonGradient}
            >
              {isAnalyzing ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.analyzeButtonText}>분석 중...</Text>
                </View>
              ) : (
                <Text style={styles.analyzeButtonText}>피부 분석하기</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* 개인정보 처리 안내 */}
        <View style={styles.privacyContainer}>
          <Text style={styles.privacyText}>
            업로드된 사진은 AI 분석 후 자동으로 삭제되며, 분석 결과만 저장됩니다. 자세한 내용은 개인정보처리방침을
            참고하세요.
          </Text>
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
  contentContainer: {
    padding: 20,
  },
  infoCard: {
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
    marginBottom: 15,
  },
  tipContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 15,
    borderLeftWidth: 3,
    borderLeftColor: "#A18CD1",
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: "#495057",
    lineHeight: 20,
  },
  imageContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 300,
  },
  placeholderContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 250,
    borderWidth: 2,
    borderColor: "#E9ECEF",
    borderStyle: "dashed",
    borderRadius: 16,
  },
  placeholderIcon: {
    fontSize: 40,
    color: "#ADB5BD",
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 14,
    color: "#6C757D",
    textAlign: "center",
  },
  selectedImage: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    resizeMode: "contain",
  },
  resetButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  photoButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginHorizontal: 5,
  },
  photoButtonGradient: {
    paddingVertical: 15,
    alignItems: "center",
  },
  photoButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  analyzeButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
  },
  analyzeButtonDisabled: {
    opacity: 0.7,
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
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  privacyContainer: {
    marginBottom: 30,
  },
  privacyText: {
    fontSize: 12,
    color: "#6C757D",
    textAlign: "center",
    lineHeight: 18,
  },
})

export default SkinDiagnosisScreen