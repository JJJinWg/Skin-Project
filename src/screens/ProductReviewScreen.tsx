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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { getProducts, Product } from '../services/productService';

const { width } = Dimensions.get('window');

// 카테고리 데이터
const categories = [
  { id: 'all', name: '전체' },
  { id: 'skincare', name: '스킨케어' },
  { id: 'serum', name: '세럼' },
  { id: 'moisturizer', name: '모이스처라이저' },
  { id: 'cleanser', name: '클렌저' },
  { id: 'sunscreen', name: '선크림' },
];

// 리뷰 데이터 인터페이스
interface ReviewData {
  id: number;
  productName: string;
  brand: string;
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
}

const ProductReviewScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [scrollY] = useState(new Animated.Value(0));
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);

  // 제품 데이터 로드
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        console.log('📦 제품 리뷰 데이터 로드 중...');
        
        // 실제 API에서 제품 목록 가져오기
        const products = await getProducts();
        
        // 제품 데이터를 리뷰 형식으로 변환
        const reviewData: ReviewData[] = products.map((product: Product) => ({
          id: product.id,
          productName: product.name,
          brand: product.brand,
          rating: product.rating,
          reviewCount: product.reviewCount,
          image: product.image,
          latestReview: {
            user: '사용자' + (product.id % 10 + 1),
            content: generateSampleReview(product.name),
            date: generateRandomDate(),
            rating: Math.round(product.rating),
            likes: Math.floor(Math.random() * 50) + 10,
          },
        }));
        
        setReviews(reviewData);
        console.log(`✅ 제품 리뷰 데이터 로드 성공: ${reviewData.length}개`);
      } catch (error) {
        console.error('❌ 제품 리뷰 데이터 로드 실패:', error);
        // 에러 시 빈 배열로 설정
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // 샘플 리뷰 생성 함수
  const generateSampleReview = (productName: string): string => {
    const reviews = [
      `${productName} 정말 좋아요! 피부가 촉촉해졌어요.`,
      `민감한 피부에도 자극 없이 사용할 수 있어서 만족해요.`,
      `가성비 좋은 제품이에요. 꾸준히 사용하고 있습니다.`,
      `향이 좋고 발림성도 부드러워요. 추천합니다!`,
      `효과가 빨리 나타나서 놀랐어요. 계속 쓸 예정입니다.`,
    ];
    return reviews[Math.floor(Math.random() * reviews.length)];
  };

  // 랜덤 날짜 생성 함수
  const generateRandomDate = (): string => {
    const dates = ['1일 전', '2일 전', '3일 전', '1주일 전', '2주일 전'];
    return dates[Math.floor(Math.random() * dates.length)];
  };

  // 검색 기능
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           (selectedCategory === 'skincare' && review.brand.toLowerCase().includes('beplain')) ||
                           (selectedCategory === 'serum' && review.productName.toLowerCase().includes('세럼'));
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
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
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
          <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
          <Text style={styles.emptySubText}>다른 검색어를 시도해보세요</Text>
        </View>
      ) : (
        <Animated.FlatList
          data={filteredReviews}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.reviewList}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.reviewCard}
              onPress={() => navigation.navigate('ProductDetailScreen', { id: item.id })}
            >
              <View style={styles.reviewCardHeader}>
                <Image source={item.image} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <Text style={styles.brandName}>{item.brand}</Text>
                  <Text style={styles.productName}>{item.productName}</Text>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingText}>⭐ {item.rating}</Text>
                    <Text style={styles.reviewCount}>리뷰 {item.reviewCount}개</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.latestReviewContainer}>
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
                <Text style={styles.reviewContent}>{item.latestReview.content}</Text>
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
            </TouchableOpacity>
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
  },
  categoryList: {
    paddingHorizontal: 15,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: '#F1F3F5',
  },
  categoryButtonActive: {
    backgroundColor: '#FF9A9E',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#6C757D',
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
});

export default ProductReviewScreen;