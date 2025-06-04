// 리뷰 전체 확인 및 검색,작성
import React, { useState, useEffect } from 'react';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  StatusBar,
  SafeAreaView,
  TextInput,
  Dimensions,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { getProducts, Product, getCategories, Category, productService } from '../services/productService';

const { width } = Dimensions.get('window');

// 리뷰 데이터 인터페이스
interface ReviewData {
  id: number;
  productName: string;
  brand: string;
  category: string;
  rating: number;
  reviewCount: number;
  image: any;
  latestReview: {
    user: string;
    content: string;
    date: string;
    rating: number;
    likes: number;
  };
  expanded?: boolean;
  allReviews?: Review[];
  loadingReviews?: boolean;
}

// 개별 리뷰 인터페이스
interface Review {
  id: number;
  userName: string;
  comment: string;
  rating: number;
  date: string;
  helpful: number;
  images?: string[];
}

// 이미지 매핑 함수 (productService와 동일)
const getProductImage = (imageUrl: string | null, productId: number) => {
  if (imageUrl) {
    return { uri: imageUrl }
  }
  
  // 기본 이미지 URL 반환
  return { uri: `https://via.placeholder.com/150?text=Product+${productId}` }
}

const ProductReviewScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [scrollY] = useState(new Animated.Value(0));
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  // 카테고리 데이터 로드
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories([{ id: 'all', name: '전체', icon: '🏷️' }, ...categoriesData]);
      } catch (error) {
        console.error('카테고리 로드 실패:', error);
        Alert.alert('오류', '카테고리 정보를 불러오는데 실패했습니다.');
      }
    };

    loadCategories();
  }, []);

  // 제품 데이터 로드
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        console.log('📦 제품 리뷰 데이터 로드 중...');
        
        // productService의 getProducts 사용 (limit=30으로 설정)
        const products = await getProducts(undefined, undefined, undefined, 30);
        
        // 각 제품별로 리뷰 데이터 불러오기
        const reviewData: ReviewData[] = [];
        
        for (const product of products) {
          try {
            // 간단한 이미지 디버깅
            const productAny = product as any;
            console.log(`🖼️ 제품 ${product.id} 이미지:`, product.image);
            
            // getProductImage 함수 사용
            const productImage = getProductImage(product.image?.uri || productAny.image_url || productAny.imageUrl, product.id);
            console.log(`✅ 제품 ${product.id} 최종 이미지:`, productImage);
            
            // 각 제품의 리뷰 조회
            const reviewResponse = await fetch(`http://10.0.2.2:8000/api/reviews/product/${product.id}`);
            const reviews = await reviewResponse.json();
            
            // 리뷰가 있는 경우
            if (Array.isArray(reviews) && reviews.length > 0) {
              const latestReview = reviews[0]; // 첫 번째 리뷰를 최신으로 간주
              
              reviewData.push({
                id: product.id,
                productName: product.name,
                brand: product.brand,
                category: product.category,
                rating: product.rating,
                reviewCount: reviews.length,
                image: productImage,
                latestReview: {
                  user: latestReview.userName || '익명 사용자',
                  content: latestReview.comment || latestReview.content || '좋은 제품입니다.',
                  date: latestReview.date || new Date().toISOString().split('T')[0],
                  rating: latestReview.rating || 4.0,
                  likes: latestReview.helpful || 0,
                },
              });
            } else {
              // 리뷰가 없는 경우에도 표시
              reviewData.push({
                id: product.id,
                productName: product.name,
                brand: product.brand,
                category: product.category,
                rating: product.rating,
                reviewCount: 0,
                image: productImage,
                latestReview: {
                  user: '첫 리뷰 작성자',
                  content: '이 제품에 대한 첫 번째 리뷰를 작성해보세요! 실제 사용 후기를 공유해주시면 다른 분들에게 큰 도움이 됩니다.',
                  date: new Date().toISOString().split('T')[0],
                  rating: 0,
                  likes: 0,
                },
              });
            }
          } catch (reviewError) {
            console.warn(`⚠️ 제품 ${product.id} 리뷰 조회 실패:`, reviewError);
            
            // 실제 이미지 URL 사용 (HomeScreen과 동일한 로직)
            const productAny = product as any;
            const productImage = getProductImage(product.image?.uri || productAny.image_url || productAny.imageUrl, product.id);
            
            // 리뷰 조회 실패 시에도 제품은 표시
            reviewData.push({
          id: product.id,
          productName: product.name,
          brand: product.brand,
              category: product.category,
          rating: product.rating,
              reviewCount: 0,
              image: productImage,
          latestReview: {
                user: '첫 리뷰 작성자',
                content: '이 제품에 대한 첫 번째 리뷰를 작성해보세요! 실제 사용 후기를 공유해주시면 다른 분들에게 큰 도움이 됩니다.',
                date: new Date().toISOString().split('T')[0],
                rating: 0,
                likes: 0,
          },
            });
          }
        }
        
        setReviews(reviewData);
        console.log(`✅ 제품 리뷰 데이터 로드 성공: ${reviewData.length}개`);
      } catch (error) {
        console.error('❌ 제품 리뷰 데이터 로드 실패:', error);
        Alert.alert('오류', '제품 리뷰를 불러오는데 실패했습니다.');
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // 검색 기능
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           review.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 헤더 애니메이션
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [200, 80],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [1, 0.3, 0],
    extrapolate: 'clamp',
  });

  const searchBarTranslate = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  // 제품별 리뷰 목록 로드 함수
  const loadProductReviews = async (productId: number) => {
    try {
      console.log(`📡 제품 ${productId} 리뷰 요청 시작...`);
      
      // 10초 타임아웃 설정
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`http://10.0.2.2:8000/api/reviews/product/${productId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`📡 제품 ${productId} 응답 상태:`, response.status);

      if (!response.ok) {
        if (response.status === 404) {
          console.log(`📋 제품 ${productId}에 대한 리뷰가 없습니다.`);
          return [];
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      const allReviews = await response.json();
      console.log(`✅ 제품 ${productId} 리뷰 로드 성공:`, allReviews.length, '개');
      
      if (Array.isArray(allReviews)) {
        return allReviews.map((review: any) => ({
          id: review.id,
          userName: review.userName || '익명 사용자',
          comment: review.comment || review.content || '',
          rating: review.rating || 0,
          date: review.date || new Date().toISOString().split('T')[0],
          helpful: review.helpful || 0,
          images: review.images || [],
        }));
      }
      return [];
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        console.error(`🌐 제품 ${productId} 네트워크 연결 실패 - 서버가 응답하지 않습니다.`);
      } else if (error instanceof Error && error.name === 'AbortError') {
        console.error(`⏰ 제품 ${productId} 요청 타임아웃 (10초 초과)`);
      } else if (error instanceof Error) {
        console.error(`❌ 제품 ${productId} 리뷰 로드 실패:`, error.message);
      } else {
        console.error(`❌ 제품 ${productId} 알 수 없는 오류:`, error);
      }
      return [];
    }
  };

  // 아코디언 토글 함수
  const toggleProductReviews = async (productId: number) => {
    const targetReview = reviews.find(r => r.id === productId);
    
    if (targetReview?.expanded) {
      // 이미 펼쳐져 있으면 접기
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review.id === productId 
            ? { ...review, expanded: false, allReviews: undefined, loadingReviews: false }
            : review
        )
      );
    } else {
      // 접혀있으면 펼치기 - 로딩 시작
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review.id === productId 
            ? { ...review, expanded: true, loadingReviews: true }
            : review
        )
      );

      // 리뷰 데이터 로드
      try {
        const allReviews = await loadProductReviews(productId);
        
        setReviews(prevReviews => 
          prevReviews.map(review => 
            review.id === productId 
              ? { ...review, allReviews, loadingReviews: false }
              : review
          )
        );
      } catch (error) {
        console.error('리뷰 로드 중 오류:', error);
        setReviews(prevReviews => 
          prevReviews.map(review => 
            review.id === productId 
              ? { ...review, loadingReviews: false, expanded: false }
              : review
          )
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#FF9A9E" />
      
      {/* 헤더 */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <LinearGradient
          colors={['#FF9A9E', '#FAD0C4']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            
            <Animated.View style={[styles.headerTitleContainer, { opacity: headerOpacity }]}>
              <Text style={styles.headerTitle}>제품 리뷰</Text>
              <Text style={styles.headerSubtitle}>다양한 화장품 리뷰를 확인해보세요</Text>
            </Animated.View>
          </View>
        </LinearGradient>
      </Animated.View>
      
      {/* 검색 바 */}
      <Animated.View 
        style={[
          styles.searchBarContainer, 
          { transform: [{ translateY: searchBarTranslate }] }
        ]}
      >
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="제품명 또는 브랜드 검색"
            placeholderTextColor="#ADB5BD"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
      
      {/* 카테고리 필터 */}
      <View style={styles.categoryContainer}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <Text 
                style={[
                  styles.categoryButtonText,
                  selectedCategory === item.id && styles.categoryButtonTextActive
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoryList}
        />
      </View>
      
      {/* 리뷰 목록 */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>제품 리뷰를 불러오는 중...</Text>
        </View>
      ) : filteredReviews.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>등록된 리뷰가 없습니다</Text>
          <Text style={styles.emptySubText}>
            {searchQuery ? '다른 검색어를 시도해보세요' : '아직 작성된 리뷰가 없습니다.\n첫 번째 리뷰를 작성해보세요!'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredReviews}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.reviewList}
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          renderItem={({ item }) => (
            <View style={styles.reviewCard}>
              {/* 제품 정보 헤더 - 클릭 시 아코디언 토글 */}
            <TouchableOpacity 
                style={styles.reviewCardHeader}
                onPress={() => toggleProductReviews(item.id)}
            >
                <Image source={item.image} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <Text style={styles.brandName}>{item.brand}</Text>
                  <Text style={styles.productName}>{item.productName}</Text>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingText}>⭐ {item.rating}</Text>
                    <Text style={styles.reviewCount}>리뷰 {item.reviewCount}개</Text>
                  </View>
                </View>
                {/* 펼침/접힘 아이콘 */}
                <View style={styles.expandIcon}>
                  <Text style={styles.expandIconText}>
                    {item.expanded ? '🔼' : '🔽'}
                  </Text>
              </View>
              </TouchableOpacity>
              
              {/* 최신 리뷰 미리보기 (항상 표시) */}
              <View style={styles.divider} />
              <View style={styles.latestReviewContainer}>
                <Text style={styles.previewLabel}>최신 리뷰</Text>
                <View style={styles.reviewerInfo}>
                  <Text style={styles.reviewerName}>{item.latestReview.user}</Text>
                  <View style={styles.reviewRating}>
                    {Array(5).fill(0).map((_, index) => (
                      <Text key={index} style={styles.starIcon}>
                        {index < Math.floor(item.latestReview.rating) ? '★' : '☆'}
                      </Text>
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewContent} numberOfLines={2}>
                  {item.latestReview.content}
                </Text>
                <View style={styles.reviewFooter}>
                  <Text style={styles.reviewDate}>{item.latestReview.date}</Text>
                  <View style={styles.reviewActions}>
                    <TouchableOpacity style={styles.likeButton}>
                      <Text style={styles.likeIcon}>♥</Text>
                      <Text style={styles.likeCount}>{item.latestReview.likes}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* 아코디언 펼쳐진 내용 - 모든 리뷰 목록 */}
              {item.expanded && (
                <View style={styles.expandedContent}>
                  <View style={styles.divider} />
                  <Text style={styles.allReviewsTitle}>모든 리뷰 ({item.reviewCount}개)</Text>
                  
                  {item.loadingReviews ? (
                    <View style={styles.loadingReviewsContainer}>
                      <ActivityIndicator size="small" color="#FF9A9E" />
                      <Text style={styles.loadingReviewsText}>리뷰를 불러오는 중...</Text>
                    </View>
                  ) : item.allReviews && item.allReviews.length > 0 ? (
                    <View style={styles.allReviewsList}>
                      {item.allReviews.map((review, index) => (
                        <View key={review.id} style={styles.individualReview}>
                          <View style={styles.reviewerInfo}>
                            <Text style={styles.reviewerName}>{review.userName}</Text>
                            <View style={styles.reviewRating}>
                              {Array(5).fill(0).map((_, starIndex) => (
                                <Text key={starIndex} style={styles.starIcon}>
                                  {starIndex < Math.floor(review.rating) ? '★' : '☆'}
                                </Text>
                              ))}
                            </View>
                          </View>
                          <Text style={styles.reviewContent}>{review.comment}</Text>
                          {review.images && review.images.length > 0 && (
                            <View style={styles.reviewImages}>
                              {review.images.slice(0, 3).map((imageUri, imgIndex) => (
                                <Image 
                                  key={imgIndex} 
                                  source={{ uri: imageUri }} 
                                  style={styles.reviewImage} 
                                />
                              ))}
                              {review.images.length > 3 && (
                                <View style={styles.moreImagesIndicator}>
                                  <Text style={styles.moreImagesText}>+{review.images.length - 3}</Text>
                                </View>
                              )}
                            </View>
                          )}
                          <View style={styles.reviewFooter}>
                            <Text style={styles.reviewDate}>{review.date}</Text>
                            <View style={styles.reviewActions}>
                              <TouchableOpacity style={styles.likeButton}>
                                <Text style={styles.likeIcon}>♥</Text>
                                <Text style={styles.likeCount}>{review.helpful}</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                          {index < item.allReviews!.length - 1 && (
                            <View style={styles.reviewDivider} />
                          )}
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.noMoreReviewsContainer}>
                      <Text style={styles.noMoreReviewsText}>다른 리뷰가 없습니다</Text>
                    </View>
                  )}
                  
                  {/* 제품 상세 보기 버튼 */}
                  <TouchableOpacity 
                    style={styles.productDetailButton}
                    onPress={() => navigation.navigate('ProductDetailScreen', { id: item.id })}
                  >
                    <Text style={styles.productDetailButtonText}>제품 상세 보기</Text>
            </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      )}
      
      {/* 리뷰 작성 버튼 */}
      <TouchableOpacity 
        style={styles.writeReviewButton}
        onPress={() => navigation.navigate('WriteReviewScreen')}
      >
        <LinearGradient
          colors={['#FF9A9E', '#FAD0C4']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.writeReviewButtonGradient}
        >
          <Text style={styles.writeReviewButtonText}>+</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
  },
  headerGradient: {
    flex: 1,
    paddingTop: 20,
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitleContainer: {
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  searchBarContainer: {
    position: 'absolute',
    top: 140,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 16,
    color: '#ADB5BD',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#212529',
    height: '100%',
  },
  clearButton: {
    padding: 5,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#ADB5BD',
  },
  categoryContainer: {
    marginTop: 200,
    zIndex: 5,
    paddingVertical: 5,
  },
  categoryList: {
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  categoryButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#F1F3F5',
    minWidth: 60,
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: '#FF9A9E',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  reviewList: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 80,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
  },
  brandName: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#212529',
    marginRight: 8,
  },
  reviewCount: {
    fontSize: 12,
    color: '#6C757D',
  },
  divider: {
    height: 1,
    backgroundColor: '#E9ECEF',
    marginVertical: 15,
  },
  latestReviewContainer: {
    paddingHorizontal: 5,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 10,
  },
  reviewerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212529',
  },
  reviewRating: {
    flexDirection: 'row',
  },
  starIcon: {
    fontSize: 14,
    color: '#FFC107',
    marginLeft: 2,
  },
  reviewContent: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    marginBottom: 10,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewDate: {
    fontSize: 12,
    color: '#ADB5BD',
  },
  reviewActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  likeIcon: {
    fontSize: 14,
    color: '#FF9A9E',
    marginRight: 4,
  },
  likeCount: {
    fontSize: 12,
    color: '#6C757D',
  },
  writeReviewButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  writeReviewButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  writeReviewButtonText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#6C757D',
  },
  expandIcon: {
    marginLeft: 'auto',
  },
  expandIconText: {
    fontSize: 14,
    color: '#6C757D',
  },
  expandedContent: {
    padding: 15,
  },
  allReviewsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 10,
  },
  loadingReviewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingReviewsText: {
    fontSize: 14,
    color: '#6C757D',
    marginLeft: 10,
  },
  allReviewsList: {
    marginVertical: 10,
  },
  individualReview: {
    marginBottom: 15,
    paddingBottom: 15,
  },
  reviewDivider: {
    height: 1,
    backgroundColor: '#E9ECEF',
    marginTop: 15,
  },
  noMoreReviewsContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noMoreReviewsText: {
    fontSize: 14,
    color: '#6C757D',
    fontStyle: 'italic',
  },
  productDetailButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FF9A9E',
    borderRadius: 8,
    alignItems: 'center',
  },
  productDetailButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  reviewImages: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 5,
  },
  moreImagesIndicator: {
    padding: 5,
    backgroundColor: '#FF9A9E',
    borderRadius: 8,
  },
  moreImagesText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default ProductReviewScreen;