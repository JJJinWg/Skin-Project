// 리뷰 상품 상세정보화면

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  FlatList,
  Dimensions,
  Alert,
} from "react-native"
import { type NavigationProp, useNavigation, type RouteProp, useRoute } from "@react-navigation/native"
import type { RootStackParamList } from "../types/navigation"
import LinearGradient from "react-native-linear-gradient"

const { width } = Dimensions.get("window")

type Product = {
  id: number
  name: string
  brand: string
  price: number
  originalPrice?: number
  rating: number
  reviews: number
  images: any[]
  description: string
  howToUse: string
  keyIngredients: string[]
  allIngredients: string[]
  category: string
  skinType: string[]
}

type Review = {
  id: number
  userName: string
  userImage: any
  rating: number
  content: string
  date: string
  images?: string[]
  likes: number
  helpful: number
  skinType: string
  age: number
}

const ProductDetailScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const route = useRoute<RouteProp<RootStackParamList, "ProductDetailScreen">>()
  const { id } = route.params

  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [activeTab, setActiveTab] = useState<"info" | "reviews" | "ingredients">("info")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const scrollViewRef = useRef<ScrollView>(null)

  // 상품 데이터 가져오기 (실제로는 API에서 가져옴)
  useEffect(() => {
    setTimeout(() => {
      const productData: Product = {
        id: id,
        name: "Centella Unscented Serum",
        brand: "COSRX",
        price: 16800,
        originalPrice: 21000,
        rating: 4.6,
        reviews: 1247,
        images: [
          require("../assets/product1.png"),
          require("../assets/product2.png"),
          require("../assets/product1.png"),
        ],
        description:
          "센텔라 아시아티카 추출물이 함유된 진정 세럼으로, 민감하고 트러블이 있는 피부를 케어해줍니다. 무향료 제품으로 예민한 피부도 안심하고 사용할 수 있습니다.",
        howToUse:
          "1. 세안 후 토너로 피부결을 정돈합니다.\n2. 적당량을 손바닥에 덜어 얼굴 전체에 부드럽게 발라줍니다.\n3. 손바닥으로 가볍게 눌러 흡수시켜줍니다.\n4. 아침, 저녁으로 사용하세요.",
        keyIngredients: ["센텔라 아시아티카 추출물", "나이아신아마이드", "히알루론산"],
        allIngredients: [
          "Centella Asiatica Extract",
          "Aqua",
          "Niacinamide",
          "Pentylene Glycol",
          "1,2-Hexanediol",
          "Sodium Hyaluronate",
          "Panthenol",
          "Madecassoside",
          "Asiaticoside",
          "Asiatic Acid",
          "Madecassic Acid",
        ],
        category: "세럼",
        skinType: ["민감성", "트러블성", "건성"],
      }

      const reviewsData: Review[] = [
        {
          id: 1,
          userName: "김민지",
          userImage: require("../assets/doctor1.png"),
          rating: 5.0,
          content:
            "정말 순하고 좋아요! 트러블이 많았는데 이거 쓰고 나서 많이 진정됐어요. 무향료라서 향에 민감한 저도 잘 맞네요.",
          date: "2023-11-15",
          images: ["https://example.com/review1.jpg"],
          likes: 24,
          helpful: 18,
          skinType: "민감성",
          age: 25,
        },
        {
          id: 2,
          userName: "이서연",
          userImage: require("../assets/doctor2.png"),
          rating: 4.5,
          content:
            "흡수가 빠르고 끈적임이 없어서 좋습니다. 아침에 발라도 메이크업이 밀리지 않아요. 다만 보습력은 조금 아쉬워요.",
          date: "2023-11-10",
          likes: 15,
          helpful: 12,
          skinType: "복합성",
          age: 28,
        },
        {
          id: 3,
          userName: "박지현",
          userImage: require("../assets/doctor1.png"),
          rating: 4.0,
          content:
            "가격 대비 괜찮은 제품이에요. 센텔라 성분이 들어있어서 진정 효과는 있는 것 같아요. 꾸준히 써봐야겠어요.",
          date: "2023-11-05",
          likes: 8,
          helpful: 6,
          skinType: "지성",
          age: 22,
        },
      ]

      setProduct(productData)
      setReviews(reviewsData)
      setLoading(false)
    }, 1000)
  }, [id])

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

  // 이미지 슬라이더 렌더링
  const renderImageSlider = () => {
    if (!product) return null

    return (
      <View style={styles.imageSliderContainer}>
        <FlatList
          data={product.images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, index) => index.toString()}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width)
            setCurrentImageIndex(index)
          }}
          renderItem={({ item }) => <Image source={item} style={styles.productImage} />}
        />
        <View style={styles.imageIndicator}>
          {product.images.map((_, index) => (
            <View key={index} style={[styles.indicatorDot, currentImageIndex === index && styles.indicatorDotActive]} />
          ))}
        </View>
      </View>
    )
  }

  // 리뷰 아이템 렌더링
  const renderReviewItem = ({ item }: { item: Review }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <Image source={item.userImage} style={styles.reviewUserImage} />
        <View style={styles.reviewUserInfo}>
          <Text style={styles.reviewUserName}>{item.userName}</Text>
          <Text style={styles.reviewUserDetails}>
            {item.skinType} • {item.age}세
          </Text>
          <View style={styles.reviewRatingContainer}>
            {renderStars(item.rating)}
            <Text style={styles.reviewDate}>{item.date}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.reviewContent}>{item.content}</Text>
      {item.images && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {item.images.map((image, index) => (
            <Image key={index} source={{ uri: image }} style={styles.reviewImage} />
          ))}
        </ScrollView>
      )}
      <View style={styles.reviewActions}>
        <TouchableOpacity style={styles.reviewActionButton}>
          <Text style={styles.reviewActionText}>👍 {item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.reviewActionButton}>
          <Text style={styles.reviewActionText}>🙌 도움됨 {item.helpful}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  if (loading || !product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>상품 정보를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} >
          
        </TouchableOpacity>
        <Text style={styles.headerTitle}>상품 상세</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareButtonText}>⋯</Text>
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollViewRef} style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 상품 이미지 슬라이더 */}
        {renderImageSlider()}

        {/* 상품 기본 정보 */}
        <View style={styles.productInfoContainer}>
          <Text style={styles.brandName}>{product.brand}</Text>
          <Text style={styles.productName}>{product.name}</Text>

          <View style={styles.ratingContainer}>
            {renderStars(product.rating)}
            <Text style={styles.ratingText}>{product.rating}</Text>
            <Text style={styles.reviewCount}>({product.reviews}개 리뷰)</Text>
          </View>

          <View style={styles.priceContainer}>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>₩{product.originalPrice.toLocaleString()}</Text>
            )}
            <Text style={styles.price}>₩{product.price.toLocaleString()}</Text>
            {product.originalPrice && (
              <Text style={styles.discountRate}>
                {Math.round((1 - product.price / product.originalPrice) * 100)}% 할인
              </Text>
            )}
          </View>

          <View style={styles.skinTypeContainer}>
            <Text style={styles.skinTypeLabel}>추천 피부타입:</Text>
            <View style={styles.skinTypeTags}>
              {product.skinType.map((type, index) => (
                <View key={index} style={styles.skinTypeTag}>
                  <Text style={styles.skinTypeTagText}>{type}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 탭 메뉴 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "info" && styles.activeTabButton]}
            onPress={() => setActiveTab("info")}
          >
            <Text style={[styles.tabButtonText, activeTab === "info" && styles.activeTabButtonText]}>상품정보</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "reviews" && styles.activeTabButton]}
            onPress={() => setActiveTab("reviews")}
          >
            <Text style={[styles.tabButtonText, activeTab === "reviews" && styles.activeTabButtonText]}>
              리뷰 ({product.reviews})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "ingredients" && styles.activeTabButton]}
            onPress={() => setActiveTab("ingredients")}
          >
            <Text style={[styles.tabButtonText, activeTab === "ingredients" && styles.activeTabButtonText]}>
              성분분석
            </Text>
          </TouchableOpacity>
        </View>

        {/* 탭 콘텐츠 */}
        <View style={styles.tabContent}>
          {activeTab === "info" && (
            <View style={styles.infoTab}>
              <View style={styles.infoSection}>
                <Text style={styles.infoSectionTitle}>상품 설명</Text>
                <Text style={styles.infoSectionContent}>{product.description}</Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoSectionTitle}>사용법</Text>
                <Text style={styles.infoSectionContent}>{product.howToUse}</Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoSectionTitle}>주요 성분</Text>
                <View style={styles.keyIngredients}>
                  {product.keyIngredients.map((ingredient, index) => (
                    <View key={index} style={styles.keyIngredientItem}>
                      <Text style={styles.keyIngredientText}>{ingredient}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {activeTab === "reviews" && (
            <View style={styles.reviewsTab}>
              <View style={styles.reviewsSummary}>
                <View style={styles.reviewsRating}>
                  <Text style={styles.reviewsRatingNumber}>{product.rating}</Text>
                  {renderStars(product.rating)}
                </View>
                <Text style={styles.reviewsCount}>{product.reviews}개의 리뷰</Text>
              </View>

              <TouchableOpacity
                style={styles.writeReviewButton}
                onPress={() => navigation.navigate("WriteReviewScreen")}
              >
                <Text style={styles.writeReviewButtonText}>리뷰 작성하기</Text>
              </TouchableOpacity>

              <FlatList
                data={reviews}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderReviewItem}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.reviewSeparator} />}
              />
            </View>
          )}

          {activeTab === "ingredients" && (
            <View style={styles.ingredientsTab}>
              <View style={styles.ingredientsHeader}>
                <Text style={styles.ingredientsTitle}>전체 성분</Text>
                <Text style={styles.ingredientsCount}>{product.allIngredients.length}개 성분</Text>
              </View>

              <View style={styles.ingredientsList}>
                {product.allIngredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientItem}>
                    <Text style={styles.ingredientName}>{ingredient}</Text>
                    <View style={styles.ingredientSafety}>
                      <Text style={styles.ingredientSafetyText}>안전</Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.ingredientsNote}>
                <Text style={styles.ingredientsNoteText}>
                  * 성분 안전도는 일반적인 기준이며, 개인의 피부 상태에 따라 다를 수 있습니다.
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 하단 액션 버튼 */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => Alert.alert("장바구니", "장바구니에 추가되었습니다.")}
        >
          <Text style={styles.cartButtonText}>장바구니</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyButton}>
          <LinearGradient
            colors={["#FF9A9E", "#FAD0C4"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buyButtonGradient}
          >
            <Text style={styles.buyButtonText}>바로 구매</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6C757D",
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
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  shareButtonText: {
    fontSize: 20,
    color: "#212529",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  imageSliderContainer: {
    position: "relative",
    backgroundColor: "#FFFFFF",
  },
  productImage: {
    width: width,
    height: width,
    resizeMode: "cover",
  },
  imageIndicator: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  indicatorDotActive: {
    backgroundColor: "#FFFFFF",
  },
  productInfoContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    marginBottom: 10,
  },
  brandName: {
    fontSize: 14,
    color: "#6C757D",
    marginBottom: 4,
  },
  productName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: "row",
    marginRight: 8,
  },
  starIcon: {
    fontSize: 16,
    color: "#FFC107",
    marginRight: 2,
  },
  emptyStar: {
    color: "#E9ECEF",
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
    marginRight: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: "#6C757D",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  originalPrice: {
    fontSize: 16,
    color: "#ADB5BD",
    textDecorationLine: "line-through",
    marginRight: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#212529",
    marginRight: 8,
  },
  discountRate: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  skinTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  skinTypeLabel: {
    fontSize: 14,
    color: "#6C757D",
    marginRight: 8,
  },
  skinTypeTags: {
    flexDirection: "row",
  },
  skinTypeTag: {
    backgroundColor: "#E3F2FD",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 6,
  },
  skinTypeTagText: {
    fontSize: 12,
    color: "#1976D2",
    fontWeight: "500",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F5",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
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
  tabContent: {
    backgroundColor: "#FFFFFF",
    marginBottom: 100,
  },
  infoTab: {
    padding: 20,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 8,
  },
  infoSectionContent: {
    fontSize: 14,
    color: "#495057",
    lineHeight: 22,
  },
  keyIngredients: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  keyIngredientItem: {
    backgroundColor: "#F8F9FA",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  keyIngredientText: {
    fontSize: 12,
    color: "#495057",
  },
  reviewsTab: {
    padding: 20,
  },
  reviewsSummary: {
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F5",
  },
  reviewsRating: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewsRatingNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#212529",
    marginRight: 12,
  },
  reviewsCount: {
    fontSize: 14,
    color: "#6C757D",
  },
  writeReviewButton: {
    backgroundColor: "#F8F9FA",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  writeReviewButtonText: {
    fontSize: 14,
    color: "#495057",
    fontWeight: "500",
  },
  reviewItem: {
    marginBottom: 20,
  },
  reviewHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  reviewUserImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewUserInfo: {
    flex: 1,
  },
  reviewUserName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 2,
  },
  reviewUserDetails: {
    fontSize: 12,
    color: "#6C757D",
    marginBottom: 4,
  },
  reviewRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewDate: {
    fontSize: 12,
    color: "#ADB5BD",
    marginLeft: 8,
  },
  reviewContent: {
    fontSize: 14,
    color: "#495057",
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  reviewActions: {
    flexDirection: "row",
    marginTop: 12,
  },
  reviewActionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    marginRight: 8,
  },
  reviewActionText: {
    fontSize: 12,
    color: "#6C757D",
  },
  reviewSeparator: {
    height: 1,
    backgroundColor: "#F1F3F5",
    marginVertical: 20,
  },
  ingredientsTab: {
    padding: 20,
  },
  ingredientsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  ingredientsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
  },
  ingredientsCount: {
    fontSize: 14,
    color: "#6C757D",
  },
  ingredientsList: {
    marginBottom: 20,
  },
  ingredientItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F5",
  },
  ingredientName: {
    fontSize: 14,
    color: "#495057",
    flex: 1,
  },
  ingredientSafety: {
    backgroundColor: "#D4EDDA",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  ingredientSafetyText: {
    fontSize: 10,
    color: "#155724",
    fontWeight: "500",
  },
  ingredientsNote: {
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
  },
  ingredientsNoteText: {
    fontSize: 12,
    color: "#6C757D",
    lineHeight: 18,
  },
  bottomActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#F1F3F5",
  },
  cartButton: {
    flex: 1,
    paddingVertical: 15,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  cartButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#495057",
  },
  buyButton: {
    flex: 2,
    borderRadius: 8,
    overflow: "hidden",
  },
  buyButtonGradient: {
    paddingVertical: 15,
    alignItems: "center",
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
})

export default ProductDetailScreen
