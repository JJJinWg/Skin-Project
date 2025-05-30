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

const { width } = Dimensions.get('window');

type ShopInfo = {
  id: number;
  name: string;
  logo: any;
  price: number;
  shipping: string;
  shippingFee: number;
  installment: string;
  isFreeShipping: boolean;
  isLowestPrice?: boolean;
  isCardDiscount?: boolean;
};

const ProductDetailScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ProductDetailScreen'>>();
  const { id } = route.params;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [includeShipping, setIncludeShipping] = useState(false);
  const [loading, setLoading] = useState(true);

  // 상품 이미지
  const productImages = [
    require('../assets/product1.png'),
    require('../assets/product2.png'),
    
  ];

  // 쇼핑몰 정보
  const [shops, setShops] = useState<ShopInfo[]>([
    {
      id: 1,
      name: 'HIMART',
      logo: require('../assets/shop_himart.png'),
      price: 239000,
      shipping: '무료배송',
      shippingFee: 0,
      installment: '최대 6개월',
      isFreeShipping: true,
      isLowestPrice: true,
    },
    {
      id: 2,
      name: '네이버쇼핑',
      logo: require('../assets/shop_naver.png'),
      price: 239000,
      shipping: '무료배송',
      shippingFee: 0,
      installment: '최대 24개월',
      isFreeShipping: true,
    },
    
    {
      id: 3,
      name: 'G마켓',
      logo: require('../assets/shop_gmarket.png'),
      price: 239000,
      shipping: '무료배송',
      shippingFee: 0,
      installment: '최대 24개월',
      isFreeShipping: true,
    },
    {
      id: 4,
      name: '11번가',
      logo: require('../assets/shop_11st.png'),
      price: 239000,
      shipping: '무료배송',
      shippingFee: 0,
      installment: '최대 22개월',
      isFreeShipping: true,
    },
    {
      id: 5,
      name: '쿠팡',
      logo: require('../assets/shop_coupang.png'),
      price: 239000,
      shipping: '무료배송',
      shippingFee: 0,
      installment: '',
      isFreeShipping: true,
    },
    {
      id: 6,
      name: '오늘의집',
      logo: require('../assets/shop_ohouse.png'),
      price: 239000,
      shipping: '무료배송',
      shippingFee: 0,
      installment: '최대 6개월',
      isFreeShipping: true,
    },
    {
      id: 7,
      name: '롯데ON',
      logo: require('../assets/shop_lotte.png'),
      price: 239000,
      shipping: '무료배송',
      shippingFee: 0,
      installment: '',
      isFreeShipping: true,
    },
    {
      id: 8,
      name: 'AUCTION',
      logo: require('../assets/shop_auction.png'),
      price: 239000,
      shipping: '무료배송',
      shippingFee: 0,
      installment: '최대 24개월',
      isFreeShipping: true,
    },
    {
      id: 9,
      name: '이마트몰',
      logo: require('../assets/shop_emart.png'),
      price: 239000,
      shipping: '무료배송',
      shippingFee: 0,
      installment: '최대 3개월',
      isFreeShipping: true,
    },
    {
      id: 10,
      name: 'SSG.COM',
      logo: require('../assets/shop_ssg.png'),
      price: 239000,
      shipping: '무료배송',
      shippingFee: 0,
      installment: '최대 3개월',
      isFreeShipping: true,
    },
    
    
  ]);

  // 최저가 계산
  const getLowestPrice = () => {
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
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
        Linking.openURL('https://www.example.com');
      }}
    >
      <View style={styles.shopHeader}>
        <Image source={item.logo} style={styles.shopLogo} />
        <View style={styles.shopInfo}>
          <Text style={styles.shopName}>{item.name}</Text>
          {item.installment ? <Text style={styles.installmentText}>{item.installment}</Text> : null}
        </View>
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
    </TouchableOpacity>
  );

  useEffect(() => {
    // 데이터 로딩 시뮬레이션
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

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
          <View style={styles.productMetaRow}>
            <Text style={styles.productMetaText}>등록일: 2024.11.</Text>
            <Text style={styles.productMetaSeparator}>|</Text>
            <Text style={styles.productMetaText}>제조사: Creative</Text>
          </View>
          
          <TouchableOpacity style={styles.brandButton}>
            <Text style={styles.brandButtonText}>Creative 브랜드로그</Text>
          </TouchableOpacity>
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
          <FlatList
            data={shops}
            renderItem={renderShopItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.shopSeparator} />}
          />
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
  productMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  productMetaText: {
    fontSize: 12,
    color: '#6C757D',
  },
  productMetaSeparator: {
    fontSize: 12,
    color: '#CED4DA',
    marginHorizontal: 8,
  },
  brandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 4,
  },
  brandButtonText: {
    fontSize: 14,
    color: '#4263EB',
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
});

export default ProductDetailScreen;