// 가격 비교 상품 상세 화면
import React, { useState, useEffect } from 'react';
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
  Switch,
  Linking,
} from 'react-native';
import { type NavigationProp, useNavigation, type RouteProp, useRoute } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation';
import LinearGradient from 'react-native-linear-gradient';
import { productService, Product } from '../services/productService';

const { width } = Dimensions.get('window');

interface ShopInfo {
  id: number;
  name: string;
  logo: any;
  price: number;
  shipping: string;
  shippingFee: number;
  installment?: string;
  isFreeShipping: boolean;
  isLowestPrice?: boolean;
  isCardDiscount?: boolean;
  link?: string;
}

const ProductDetailScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ProductDetailScreen'>>();
  const { id } = route.params;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [includeShipping, setIncludeShipping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [priceLoading, setPriceLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [shops, setShops] = useState<ShopInfo[]>([]);

  // 상품 이미지 (API에서 가져온 제품 정보 기반)
  const productImages = product ? [product.image] : [
    { uri: 'https://via.placeholder.com/150?text=Product+Image' }
  ];

  // 제품 정보 로드
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setPriceLoading(true);
        const productData = await productService.getProductById(id);
        if (productData) {
          setProduct(productData);
          // 쇼핑몰 정보 로드
          const shopData = await productService.getProductShops(id);
          setShops(shopData);
        }
      } catch (error) {
        console.error('제품 정보 로드 실패:', error);
      } finally {
        setLoading(false);
        setPriceLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // 최저가 계산
  const getLowestPrice = () => {
    if (!shops || shops.length === 0) {
      console.warn('⚠️ 쇼핑몰 가격 정보가 없어 제품 기본 가격을 사용합니다.');
      return product?.price || 0; // shops가 없으면 제품 가격 사용
    }
    
    if (includeShipping) {
      return shops.reduce((min, shop) => {
        const totalPrice = shop.price + shop.shippingFee;
        return totalPrice < min ? totalPrice : min;
      }, shops[0].price + shops[0].shippingFee);
    } else {
      return shops.reduce((min, shop) => (shop.price < min ? shop.price : min), shops[0].price);
    }
  };

  // 최저가 포맷팅
  const formatPrice = (price: number) => {
    return price.toLocaleString();
  };

  // 썸네일 렌더링
  const renderThumbnail = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={[styles.thumbnailContainer, currentImageIndex === index && styles.activeThumbnail]}
      onPress={() => setCurrentImageIndex(index)}
    >
      <Image source={item} style={styles.thumbnail} />
    </TouchableOpacity>
  );

  // 쇼핑몰 아이템 렌더링
  const renderShopItem = ({ item }: { item: ShopInfo }) => (
    <TouchableOpacity
      style={styles.shopItem}
      onPress={() => {
        // 실제로는 해당 쇼핑몰 상품 페이지로 이동
        if (item.link) {
          Linking.openURL(item.link);
        }
      }}
    >
      <View style={styles.shopHeader}>
        <Image
          source={item.logo}
          style={{
            width: 64,
            height: 64,
            borderRadius: 12,
            backgroundColor: '#fff',
            borderWidth: 1,
            borderColor: '#eee',
            marginRight: 16,
          }}
          resizeMode="contain"
        />
        <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.shopName}>{item.name}</Text>
            {item.installment ? <Text style={styles.installmentText}>{item.installment}</Text> : null}
            {item.isLowestPrice && (
              <View style={styles.lowestPriceBadge}>
                <Text style={styles.lowestPriceText}>최저가</Text>
              </View>
            )}
            {item.isCardDiscount && (
              <View style={styles.cardDiscountBadge}>
                <Text style={styles.cardDiscountText}>카드할인</Text>
              </View>
            )}
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.shopPrice}>{formatPrice(item.price)}원</Text>
            <Text style={styles.shippingText}>{item.shipping}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>상품 정보를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} >
          
        </TouchableOpacity>
        <Text style={styles.headerTitle}>상품 가격비교</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareButtonText}>⋯</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 상품 이미지 */}
        <View style={styles.imageContainer}>
          <Image source={productImages[currentImageIndex]} style={styles.mainImage} />
        </View>

        {/* 썸네일 목록 */}
        <View style={styles.thumbnailsContainer}>
          <FlatList
            data={productImages}
            renderItem={renderThumbnail}
            keyExtractor={(_, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailsList}
          />
        </View>

        {/* 상품 정보 */}
        <View style={styles.productInfoContainer}>
          <Text style={styles.productTitle}>{product?.name || '상품명'}</Text>
          <Text style={styles.brandName}>{product?.brand || '브랜드명'}</Text>
          
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>⭐ {product?.rating || 0}</Text>
            <Text style={styles.reviewCount}>({product?.reviewCount || 0}개 리뷰)</Text>
          </View>
          
          <Text style={styles.priceText}>최저가 {formatPrice(getLowestPrice())}원</Text>
          
          {product?.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>상품 설명</Text>
              <Text style={styles.descriptionText}>{product.description}</Text>
            </View>
          )}
          
          {product?.volume && (
            <View style={styles.specContainer}>
              <Text style={styles.specTitle}>용량</Text>
              <Text style={styles.specText}>{product.volume}</Text>
            </View>
          )}
        </View>

        {/* 최저가 정보 */}
        <View style={styles.lowestPriceContainer}>
          <View style={styles.lowestPriceHeader}>
            <Text style={styles.lowestPriceLabel}>최저가</Text>
            <Text style={styles.lowestPriceValue}>{formatPrice(getLowestPrice())}원</Text>
            
          </View>

          
        </View>

        {/* 쇼핑몰 목록 */}
        <View style={styles.shopsContainer}>
          <Text style={styles.shopsTitle}>쇼핑몰별 가격</Text>
          {priceLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>가격 정보를 불러오는 중...</Text>
            </View>
          ) : shops.length > 0 ? (
            <FlatList
              data={shops}
              renderItem={renderShopItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.shopSeparator} />}
            />
          ) : (
            <View style={styles.noShopsContainer}>
              <Text style={styles.noShopsText}>
                🔍 가격 정보를 찾을 수 없습니다.
              </Text>
              <Text style={styles.noShopsSubText}>
                다른 검색어로 다시 시도해주세요.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6C757D',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
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
    fontWeight: 'bold',
    color: '#212529',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 20,
    color: '#212529',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  imageContainer: {
    width: '100%',
    height: width,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  thumbnailsContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  thumbnailsList: {
    paddingHorizontal: 15,
  },
  thumbnailContainer: {
    width: 60,
    height: 60,
    marginRight: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    overflow: 'hidden',
  },
  activeThumbnail: {
    borderColor: '#4263EB',
    borderWidth: 2,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productInfoContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginBottom: 10,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 10,
  },
  brandName: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingText: {
    fontSize: 14,
    color: '#6C757D',
    marginRight: 5,
  },
  reviewCount: {
    fontSize: 12,
    color: '#6C757D',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4263EB',
    marginBottom: 10,
  },
  descriptionContainer: {
    marginBottom: 10,
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 5,
  },
  descriptionText: {
    fontSize: 12,
    color: '#6C757D',
  },
  specContainer: {
    marginBottom: 10,
  },
  specTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 5,
  },
  specText: {
    fontSize: 12,
    color: '#6C757D',
  },
  lowestPriceContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginBottom: 10,
  },
  lowestPriceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  lowestPriceLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginRight: 10,
  },
  lowestPriceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4263EB',
    flex: 1,
  },
  buyButton: {
    backgroundColor: '#212529',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  buyButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  shippingToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  shippingToggleLabel: {
    fontSize: 14,
    color: '#495057',
    marginRight: 8,
  },
  shopsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginBottom: 80, // 하단 버튼 공간 확보
  },
  shopsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 15,
  },
  shopItem: {
    paddingVertical: 15,
  },
  shopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  shopLogo: {
    width: 60,
    height: 24,
    resizeMode: 'contain',
    marginRight: 10,
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212529',
  },
  installmentText: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 2,
  },
  lowestPriceBadge: {
    backgroundColor: '#E9FAF1',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  lowestPriceText: {
    fontSize: 12,
    color: '#0CA678',
    fontWeight: 'bold',
  },
  cardDiscountBadge: {
    backgroundColor: '#E7F5FF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  cardDiscountText: {
    fontSize: 12,
    color: '#339AF0',
    fontWeight: 'bold',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginRight: 10,
  },
  shippingText: {
    fontSize: 14,
    color: '#6C757D',
  },
  shopSeparator: {
    height: 1,
    backgroundColor: '#F1F3F5',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
  },
  priceAlertButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 4,
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  priceAlertButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#495057',
  },
  bottomBuyButton: {
    flex: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bottomBuyButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  bottomBuyButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  noShopsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noShopsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 10,
  },
  noShopsSubText: {
    fontSize: 12,
    color: '#6C757D',
  },
});

export default ProductDetailScreen;