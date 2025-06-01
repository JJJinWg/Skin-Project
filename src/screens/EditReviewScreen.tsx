// 내정보 -> 리뷰내역 확인 및 수정 가능

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  ScrollView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useNavigation, type RouteProp, useRoute } from "@react-navigation/native"
import type { RootStackParamList } from "../types/navigation"
import LinearGradient from "react-native-linear-gradient"
import { launchImageLibrary } from "react-native-image-picker"
import type { StackNavigationProp } from "@react-navigation/stack"
import { reviewService } from "../services/reviewService"

type Review = {
  id: number
  productId: number
  productName: string
  productImage: any
  rating: number
  content: string
  date: string
  images?: string[]
  likes: number
  helpful: number
}

type EditReviewScreenRouteProp = RouteProp<{ params: { review: Review } }, "params">

const EditReviewScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const route = useRoute<EditReviewScreenRouteProp>()
  const { review } = route.params

  const [rating, setRating] = useState(review.rating)
  const [content, setContent] = useState(review.content)
  const [images, setImages] = useState<string[]>(review.images || [])
  const [isLoading, setIsLoading] = useState(false)

  // 별점 변경 핸들러
  const handleRatingChange = (newRating: number) => {
    setRating(newRating)
  }

  // 이미지 추가 핸들러
  const handleAddImage = () => {
    if (images.length >= 3) {
      Alert.alert("알림", "이미지는 최대 3개까지 첨부할 수 있습니다.")
      return
    }

    launchImageLibrary(
      {
        mediaType: "photo",
        includeBase64: false,
        maxHeight: 800,
        maxWidth: 800,
        selectionLimit: 3 - images.length,
      },
      (response) => {
        if (response.didCancel) {
          console.log("User cancelled image picker")
        } else if (response.errorCode) {
          console.log("ImagePicker Error: ", response.errorMessage)
        } else if (response.assets && response.assets.length > 0) {
          const newImages = response.assets.map((asset) => asset.uri || "")
          setImages([...images, ...newImages])
        }
      },
    )
  }

  // 이미지 삭제 핸들러
  const handleRemoveImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)
  }

  // 저장 버튼 핸들러
  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert("알림", "리뷰 내용을 입력해주세요.")
      return
    }

    setIsLoading(true)

    try {
      const result = await reviewService.updateReview(review.id, {
        rating,
        content,
        images,
      })
      setIsLoading(false)
      if (result.success) {
      Alert.alert("알림", "리뷰가 수정되었습니다.", [
        {
          text: "확인",
          onPress: () => navigation.goBack(),
        },
      ])
      } else {
        Alert.alert("오류", result.message || "리뷰 수정에 실패했습니다.")
      }
    } catch (error) {
      setIsLoading(false)
      Alert.alert("오류", "리뷰 수정 중 오류가 발생했습니다.")
    }
  }

  // 취소 버튼 핸들러
  const handleCancel = () => {
    Alert.alert(
      "변경 취소",
      "변경 사항을 취소하시겠습니까?",
      [
        {
          text: "아니오",
          style: "cancel",
        },
        {
          text: "예",
          onPress: () => navigation.goBack(),
        },
      ],
      { cancelable: true },
    )
  }

  // 별점 렌더링 함수
  const renderRatingStars = () => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => handleRatingChange(star)}>
            <Text style={[styles.starIcon, star <= rating ? styles.filledStar : styles.emptyStar]}>★</Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>리뷰 수정</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* 제품 정보 */}
          <View style={styles.productInfoContainer}>
            <Image source={review.productImage} style={styles.productImage} />
            <View style={styles.productDetails}>
              <Text style={styles.productName}>{review.productName}</Text>
              <Text style={styles.productId}>상품 ID: {review.productId}</Text>
            </View>
          </View>

          {/* 별점 */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>별점</Text>
            {renderRatingStars()}
          </View>

          {/* 리뷰 내용 */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>리뷰 내용</Text>
            <TextInput
              style={styles.contentInput}
              value={content}
              onChangeText={setContent}
              placeholder="리뷰 내용을 입력하세요"
              placeholderTextColor="#ADB5BD"
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* 이미지 첨부 */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>이미지 첨부 (최대 3장)</Text>
            <View style={styles.imagesContainer}>
              {images.map((image, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri: image }} style={styles.attachedImage} />
                  <TouchableOpacity style={styles.removeImageButton} onPress={() => handleRemoveImage(index)}>
                    <Text style={styles.removeImageButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < 3 && (
                <TouchableOpacity style={styles.addImageButton} onPress={handleAddImage}>
                  <Text style={styles.addImageButtonText}>+</Text>
                  <Text style={styles.addImageButtonLabel}>이미지 추가</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* 버튼 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isLoading}>
              <LinearGradient
                colors={["#FF9A9E", "#FAD0C4"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButtonGradient}
              >
                <Text style={styles.saveButtonText}>{isLoading ? "저장 중..." : "저장"}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
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
  productInfoContainer: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F5",
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  productDetails: {
    flex: 1,
    justifyContent: "center",
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 5,
  },
  productId: {
    fontSize: 12,
    color: "#6C757D",
  },
  sectionContainer: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 15,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starIcon: {
    fontSize: 30,
    marginRight: 5,
  },
  filledStar: {
    color: "#FFC107",
  },
  emptyStar: {
    color: "#E9ECEF",
  },
  ratingText: {
    fontSize: 16,
    color: "#212529",
    marginLeft: 10,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 8,
    padding: 15,
    fontSize: 14,
    color: "#212529",
    height: 150,
    textAlignVertical: "top",
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  imageContainer: {
    width: 100,
    height: 100,
    marginRight: 10,
    marginBottom: 10,
    position: "relative",
  },
  attachedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FF9A9E",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  removeImageButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderStyle: "dashed",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  addImageButtonText: {
    fontSize: 24,
    color: "#ADB5BD",
    marginBottom: 5,
  },
  addImageButtonLabel: {
    fontSize: 12,
    color: "#6C757D",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#FFFFFF",
    marginTop: 10,
    marginBottom: 30,
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#6C757D",
  },
  saveButton: {
    flex: 1,
    marginLeft: 10,
    borderRadius: 12,
    overflow: "hidden",
  },
  saveButtonGradient: {
    paddingVertical: 15,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
})

export default EditReviewScreen
