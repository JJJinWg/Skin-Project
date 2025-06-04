// 제품 관련 서비스

import { medicalApi } from './apiClient'

// Product 타입 정의
export interface Product {
  id: number
  name: string
  brand: string
  category: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  image: any
  description: string
  ingredients: string[]
  skinType: string[]
  benefits: string[]
  volume: string
  isPopular: boolean
  isNew: boolean
  suitableFor: string[]
  notSuitableFor: string[]
  reviews: {
    id: number
    userName: string
    rating: number
    comment: string
    date: string
  }[]
}

// Category 타입 정의
export interface Category {
  id: string
  name: string
  icon: string
}

// ShopInfo 타입 정의
export interface ShopInfo {
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
}

// API 응답 타입 정의
interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

// 기본 카테고리 데이터
const defaultCategories: Category[] = [
  { id: 'skincare', name: '스킨케어', icon: '🧴' },
  { id: 'serum', name: '세럼', icon: '💧' },
  { id: 'moisturizer', name: '모이스처라이저', icon: '🧴' },
  { id: 'cleanser', name: '클렌저', icon: '🧼' },
  { id: 'sunscreen', name: '선크림', icon: '☀️' },
]

// 이미지 매핑 함수
const getProductImage = (imageUrl: string | null, productId: number) => {
  if (imageUrl) {
    return { uri: imageUrl }
  }
  
  // 기본 이미지 URL 반환
  return { uri: `https://via.placeholder.com/150?text=Product+${productId}` }
}

// 제품 목록 조회 (실제 백엔드 API 사용)
export const getProducts = async (
  category?: string,
  searchQuery?: string,
  sortBy?: 'popular' | 'rating' | 'price' | 'newest',
  limit?: number
): Promise<Product[]> => {
  try {
    console.log('📦 제품 목록 조회 중...', { category, searchQuery, sortBy, limit });
    
    // 백엔드 API 호출
    let apiResponse: any;
    
    const params: any = {};
    if (limit) params.limit = limit;
    if (searchQuery) params.search = searchQuery;
    
    if (category) {
      apiResponse = await medicalApi.getProductsByCategory(category);
    } else if (searchQuery) {
      apiResponse = await medicalApi.getProducts(params);
    } else {
      apiResponse = await medicalApi.getProducts(params);
    }
    
    console.log('🔍 API 응답 구조:', apiResponse);
    
    // 백엔드 응답 구조에 따라 데이터 추출
    let products: any[] = [];
    if (Array.isArray(apiResponse)) {
      // 직접 배열인 경우
      products = apiResponse;
    } else if (apiResponse && apiResponse.success && Array.isArray(apiResponse.data)) {
      // {success: true, data: [...]} 구조인 경우
      products = apiResponse.data;
    } else if (apiResponse && Array.isArray(apiResponse.data)) {
      // {data: [...]} 구조인 경우
      products = apiResponse.data;
    } else {
      console.warn('⚠️ 예상하지 못한 API 응답 구조:', apiResponse);
      return [];
    }
    
    console.log('✅ 추출된 제품 배열:', products.length, '개');
    
    // 백엔드 응답을 Product 인터페이스에 맞게 변환
    return products.map((product: any) => ({
      id: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price,
      originalPrice: product.original_price,
      rating: product.rating || 0,
      reviewCount: product.review_count || 0,
      image: getProductImage(product.image || product.image_url, product.id),
      description: product.description || '',
      ingredients: product.ingredients || [],
      skinType: product.skin_types || [],
      benefits: product.benefits || [],
      volume: product.volume || '',
      isPopular: product.is_popular || false,
      isNew: product.is_new || false,
      suitableFor: product.skin_types || [],
      notSuitableFor: [],
      reviews: product.reviews || [] // 백엔드에서 실제 리뷰 데이터를 제공할 것으로 예상
    }));
  } catch (error) {
    console.error('❌ 제품 목록 조회 실패:', error);
    return [];
  }
}

// 제품 상세 조회
export const getProductById = async (id: number): Promise<Product | null> => {
  try {
    console.log('🔍 제품 상세 조회 중...', id);
    
    // 실제 API 호출 (getProduct 메서드 사용)
    const product = await medicalApi.getProduct(id) as any;
    
    if (!product) return null;
    
    // 제품별 리뷰 조회
    let reviews: any[] = [];
    try {
      reviews = await medicalApi.getProductReviews(id) as any[];
      console.log(`✅ 제품 ${id} 리뷰 ${reviews.length}개 조회 성공`);
    } catch (reviewError: any) {
      // 404 에러는 리뷰가 없다는 의미이므로 에러로 취급하지 않음
      if (reviewError?.message?.includes('status: 404') || reviewError?.status === 404) {
        console.log(`📝 제품 ${id}에 대한 리뷰가 아직 없습니다.`);
      } else {
        // 다른 에러인 경우에만 경고 로그 출력
        console.warn(`⚠️ 제품 ${id} 리뷰 조회 중 오류:`, reviewError);
      }
      reviews = [];
    }
    
    // API 응답을 Product 인터페이스에 맞게 변환
    return {
      id: product.id,
      name: product.name,
      brand: product.brand || '',
      category: product.category || 'skincare',
      price: product.price || 0,
      originalPrice: product.originalPrice,
      rating: product.rating || 0,
      reviewCount: reviews.length, // 실제 리뷰 개수로 업데이트
      image: getProductImage(product.image || product.image_url, product.id),
      description: product.description || '',
      ingredients: product.ingredients || [],
      skinType: product.skinTypes || product.skin_types || [],
      benefits: product.benefits || [],
      volume: product.volume || '',
      isPopular: product.isPopular || product.is_popular || false,
      isNew: product.isNew || product.is_new || false,
      suitableFor: product.suitableFor || [],
      notSuitableFor: product.notSuitableFor || [],
      reviews: reviews.map((review: any) => ({
        id: review.id,
        userName: review.userName || '익명',
        rating: review.rating || 0,
        comment: review.comment || '',
        date: review.date || ''
      }))
    };
  } catch (error) {
    console.error('❌ 제품 상세 조회 실패:', error)
    return null
  }
}

// 인기 제품 목록 조회
export const getPopularProducts = async (): Promise<Product[]> => {
  try {
    console.log('🔥 인기 제품 목록 조회 중...');
    
    // 실제 API 시도
    const apiProducts = await medicalApi.getPopularProducts() as any[];
    
    // API 응답을 Product 인터페이스에 맞게 변환
    const products = apiProducts.map((product: any) => ({
      id: product.id,
      name: product.name,
      brand: product.brand || '',
      category: product.category || 'skincare',
      price: product.price || 0,
      originalPrice: product.originalPrice,
      rating: product.rating || 0,
      reviewCount: product.reviews || product.review_count || 0,
      image: getProductImage(product.image || product.image_url, product.id),
      description: product.description || '',
      ingredients: [],
      skinType: [],
      benefits: [],
      volume: product.volume || '',
      isPopular: true,
      isNew: false,
      suitableFor: [],
      notSuitableFor: [],
      reviews: []
    }));
    
    console.log(`✅ 인기 제품 목록 조회 성공: ${products.length}개`);
    return products;
  } catch (error) {
    console.error('❌ 인기 제품 목록 조회 실패:', error);
    return [];
  }
}

// 신제품 목록 조회
export const getNewProducts = async (): Promise<Product[]> => {
  try {
    console.log('🆕 신제품 목록 조회 중...');
    
    const apiProducts = await medicalApi.getNewProducts() as any[];
    
    // API 응답을 Product 인터페이스에 맞게 변환
    const products = apiProducts.map((product: any) => ({
      id: product.id,
      name: product.name,
      brand: product.brand || '',
      category: product.category || 'skincare',
      price: product.price || 0,
      originalPrice: product.originalPrice,
      rating: product.rating || 0,
      reviewCount: product.reviews || product.review_count || 0,
      image: getProductImage(product.image || product.image_url, product.id),
      description: product.description || '',
      ingredients: [],
      skinType: [],
      benefits: [],
      volume: product.volume || '',
      isPopular: false,
      isNew: true,
      suitableFor: [],
      notSuitableFor: [],
      reviews: []
    }));
    
    console.log(`✅ 신제품 목록 조회 성공: ${products.length}개`);
    return products;
  } catch (error) {
    console.error('❌ 신제품 목록 조회 실패:', error);
    return [];
  }
}

// 카테고리 목록 조회
export const getCategories = async (): Promise<Category[]> => {
  try {
    console.log('📂 카테고리 목록 조회 중...');
    
    // 먼저 백엔드 API 시도
    try {
      const response = await medicalApi.getCategories() as ApiResponse<Category[]>;
      if (response && response.data) {
        return response.data;
      }
    } catch (apiError) {
      console.log('💡 백엔드 카테고리 API가 없어 제품에서 카테고리를 추출합니다.');
    }
    
    // API가 없으면 제품 목록에서 카테고리 추출
    const products = await getProducts();
    const categorySet = new Set<string>();
    
    products.forEach(product => {
      if (product.category) {
        categorySet.add(product.category);
      }
    });
    
    // 카테고리 배열 생성 (아이콘 포함)
    const categoryIcons: {[key: string]: string} = {
      'skincare': '🧴',
      'serum': '💧',
      'moisturizer': '🧴',
      'cleanser': '🧼',
      'sunscreen': '☀️',
      'toner': '💦',
      'ampoule': '✨',
      'cream': '🫧',
      'essence': '💎',
      'mask': '😷'
    };
    
    const categories: Category[] = Array.from(categorySet).map(categoryName => ({
      id: categoryName,
      name: categoryName === 'skincare' ? '스킨케어' :
            categoryName === 'serum' ? '세럼' :
            categoryName === 'moisturizer' ? '모이스처라이저' :
            categoryName === 'cleanser' ? '클렌저' :
            categoryName === 'sunscreen' ? '선크림' :
            categoryName === 'toner' ? '토너' :
            categoryName === 'ampoule' ? '앰플' :
            categoryName === 'cream' ? '크림' :
            categoryName === 'essence' ? '에센스' :
            categoryName === 'mask' ? '마스크' :
            categoryName, // 기본값
      icon: categoryIcons[categoryName] || '🏷️'
    }));
    
    console.log(`✅ 제품에서 추출된 카테고리: ${categories.length}개`);
    return categories;
  } catch (error) {
    console.error('❌ 카테고리 조회 실패:', error);
    // 최종 폴백: 기본 카테고리 반환
    return defaultCategories;
  }
}

// 제품 검색 (자동완성용)
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    if (!query.trim()) return []
    
    console.log('🔍 제품 검색 중...', query);
    
    // 실제 API 호출
    const products = await getProducts(undefined, query)
    return products.slice(0, 10) // 최대 10개만 반환
  } catch (error) {
    console.error('❌ 제품 검색 실패:', error)
    return []
  }
}

// 브랜드별 제품 조회
export const getProductsByBrand = async (brand: string): Promise<Product[]> => {
  try {
    console.log('🏷️ 브랜드별 제품 조회 중...', brand);
    
    // 실제 API 호출
    const allProducts = await getProducts()
    const brandProducts = allProducts.filter(product => 
      product.brand.toLowerCase() === brand.toLowerCase()
    )
    
    return brandProducts
  } catch (error) {
    console.error('❌ 브랜드별 제품 조회 실패:', error)
    return []
  }
}

// 가격대별 제품 조회
export const getProductsByPriceRange = async (minPrice: number, maxPrice: number): Promise<Product[]> => {
  try {
    console.log('💰 가격대별 제품 조회 중...', { minPrice, maxPrice });
    
    // 실제 API 호출
    const allProducts = await getProducts()
    const filteredProducts = allProducts.filter(product => 
      product.price >= minPrice && product.price <= maxPrice
    )
    
    return filteredProducts
  } catch (error) {
    console.error('❌ 가격대별 제품 조회 실패:', error)
    return []
  }
}

// 피부타입별 제품 조회
export const getProductsBySkinType = async (skinType: string): Promise<Product[]> => {
  try {
    console.log('🧴 피부타입별 제품 조회 중...', skinType);
    
    // 실제 API 호출
    const allProducts = await getProducts()
    const filteredProducts = allProducts.filter(product => 
      product.skinType.some(type => type.toLowerCase().includes(skinType.toLowerCase()))
    )
    
    return filteredProducts
  } catch (error) {
    console.error('❌ 피부타입별 제품 조회 실패:', error)
    return []
  }
}

// 쇼핑몰 로고 매핑
const shopLogoMap: { [key: string]: any } = {
  '올리브영': require('../assets/shop_ohouse.png'), // 임시로 오하우스 로고 사용
  '화해': require('../assets/shop_gmarket.png'), // 임시로 지마켓 로고 사용
  '네이버쇼핑': require('../assets/shop_naver.png'),
  '쿠팡': require('../assets/shop_coupang.png'),
};
const defaultShopLogo = require('../assets/shop_11st.png');

// 제품의 쇼핑몰 정보 조회
export const getProductShops = async (productId: number): Promise<ShopInfo[]> => {
  try {
    console.log('🛍️ 제품 쇼핑몰 정보 조회 중...', productId);
    
    // API 호출
    const response = await medicalApi.getProductShops(productId) as any;
    
    console.log('🔍 백엔드 응답:', response);
    
    // 백엔드 응답 구조 확인: { success: true, data: [...] }
    let shops = [];
    if (response && response.success && Array.isArray(response.data)) {
      shops = response.data;
    } else if (Array.isArray(response)) {
      // 만약 직접 배열로 응답하는 경우
      shops = response;
    } else {
      console.warn('⚠️ 예상과 다른 응답 구조:', response);
      return [];
    }
    
    console.log('🔍 파싱된 쇼핑몰 데이터:', shops);
    
    // API 응답을 ShopInfo 인터페이스에 맞게 변환
    return shops.map((shop: any) => ({
      id: shop.id,
      name: shop.name,
      logo: shopLogoMap[shop.name?.toLowerCase()] || defaultShopLogo,
      price: shop.price || 0,
      shipping: shop.shipping || '무료배송',
      shippingFee: shop.shippingFee || 0,
      installment: shop.installment,
      isFreeShipping: shop.isFreeShipping || true,
      isLowestPrice: shop.isLowestPrice || false,
      isCardDiscount: shop.isCardDiscount || false
    }));
  } catch (error) {
    console.error('❌ 제품 쇼핑몰 정보 조회 실패:', error);
    console.error('💡 백엔드에 /api/products/{id}/shops 엔드포인트가 구현되지 않았습니다.');
    return [];
  }
}

// 화장품 추천 요청 타입 정의 (백엔드 스키마에 맞게 수정)
export interface CosmeticRecommendationRequest {
  diagnosis: string[];     // 피부 고민 (기존 concerns)
  skin_type: string;      // 피부 타입 (기존 skinType)
  sensitivity: string;    // 피부 민감도 (새로 추가)
  additionalInfo?: string; // 추가 정보 (선택사항)
}

// 화장품 추천 결과 타입 정의
export interface CosmeticRecommendation {
  products: Product[];
  explanation: string;
}

// 화장품 추천
export const getCosmeticRecommendations = async (request: CosmeticRecommendationRequest): Promise<CosmeticRecommendation> => {
  try {
    console.log('🔍 AI 화장품 추천 요청 중...', request);
    
    // 백엔드 AI 추천 시스템 호출 (/recommend/ai)
    const response: any = await medicalApi.getRecommendation({
      diagnosis: request.diagnosis,
      skin_type: request.skin_type,
      sensitivity: request.sensitivity
    });
    
    console.log('✅ AI 추천 응답 수신:', response);
    console.log('🔍 응답 타입 및 길이:', typeof response, Array.isArray(response) ? response.length : 'not array');
    
    // 백엔드 응답이 바로 배열 형태인 경우 처리
    let recommendationList = [];
    let analysisText = '분석 결과를 불러올 수 없습니다.';
    
    if (Array.isArray(response)) {
      // 응답이 바로 배열인 경우
      recommendationList = response;
      analysisText = '맞춤형 화장품을 추천해드렸습니다.';
    } else if (response && typeof response === 'object') {
      // 응답이 객체인 경우
      recommendationList = response.추천리스트 || response['추천 리스트'] || response.products || [];
      analysisText = response.분석요약 || response['분석 요약'] || response.explanation || '분석 결과를 불러올 수 없습니다.';
    }
    
    console.log('🔍 처리된 추천리스트:', recommendationList);
    
    // 백엔드 응답을 프론트엔드 형식에 맞게 변환
    return {
      products: recommendationList.map((item: any, index: number) => ({
        id: index + 1,
        name: item.제품명 || '',
        brand: item.제품명?.split(' ')[0] || '',
        category: item.카테고리 || 'skincare',
        price: Math.floor(Math.random() * 50000) + 10000, // 임시 가격
        rating: 4.0 + Math.random() * 1.0,
        reviewCount: Math.floor(Math.random() * 500) + 50,
        image: getProductImage(item.이미지 || null, index + 1),
        description: item.추천이유 || '',
        ingredients: [],
        skinType: [request.skin_type],
        benefits: [item.카테고리],
        volume: '50ml',
        isPopular: false,
        isNew: false,
        suitableFor: request.diagnosis,
        notSuitableFor: [],
        reviews: []
      })),
      explanation: analysisText
    };
  } catch (error) {
    console.error('❌ AI 화장품 추천 실패:', error);
    
    // 타임아웃 에러인지 확인
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        products: [],
        explanation: 'AI 분석 시간이 초과되었습니다. 네트워크 상태를 확인하고 다시 시도해주세요.'
      };
    }
    
    return {
      products: [],
      explanation: '추천 결과를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.'
    };
  }
}

// 피부 타입과 고민 옵션 타입 정의
export interface SkinOptions {
  skinTypes: string[];
  concerns: string[];
}

// 피부 타입과 고민 옵션 조회
export const getSkinOptions = async (): Promise<SkinOptions> => {
  // 기본 피부 타입 옵션들
  const defaultSkinTypes = [
    '건성',
    '지성', 
    '복합성(정상)',
    '민감성'
  ];

  // 핵심 피부 고민 옵션들 (피부 타입과 중복 제거)
  const defaultConcerns = [
    '여드름',
    '모공',
    '주름',
    '기미/색소침착',
    '홍조',
    '블랙헤드',
    '각질',
    '탄력 저하',
    '다크서클',
    '여드름 흉터',
    '광노화',
    '염증'
  ];

  try {
    console.log('🧴 피부 옵션 조회 중...');
    
    try {
      // 백엔드 API 시도
      const response = await medicalApi.getSkinOptions() as any;
      
      // 백엔드 응답이 있으면 백엔드 데이터와 기본 데이터 병합
      if (response.success && response.data) {
        const backendSkinTypes = response.data.skinTypes || [];
        const backendConcerns = response.data.concerns || [];
        
        // 중복 및 유사한 옵션 제거
        const cleanSkinTypes = Array.from(new Set([...defaultSkinTypes, ...backendSkinTypes]))
          .filter((type, index, array) => {
            // 유사한 옵션들 제거 (예: "복합성"과 "복합성(정상)")
            const lowerType = type.toLowerCase().replace(/[()]/g, '');
            return !array.slice(0, index).some(prevType => 
              prevType.toLowerCase().replace(/[()]/g, '').includes(lowerType) ||
              lowerType.includes(prevType.toLowerCase().replace(/[()]/g, ''))
            );
          });
        
        const cleanConcerns = Array.from(new Set([...defaultConcerns, ...backendConcerns]));
        
        return {
          skinTypes: cleanSkinTypes,
          concerns: cleanConcerns
        };
      }
    } catch (apiError) {
      console.log('💡 백엔드 API를 사용할 수 없어 기본 옵션을 사용합니다.');
    }
    
    // 백엔드 API가 실패하거나 없으면 기본값 반환
    return { 
      skinTypes: defaultSkinTypes, 
      concerns: defaultConcerns 
    };
  } catch (error) {
    console.error('❌ 피부 옵션 조회 실패:', error);
    
    // 에러 발생시 최소한의 기본 옵션 반환
    return {
      skinTypes: defaultSkinTypes,
      concerns: defaultConcerns
    };
  }
}

export async function getSkinAnalysisHistory(userId: number): Promise<any[]> {
  try {
    console.log('📋 피부 분석 내역 조회 중... (productService에서 diagnosisService 호출)');
    
    // diagnosisService의 getSkinAnalysisHistory 함수 사용
    const { diagnosisService } = await import('./diagnosisService');
    const history = await diagnosisService.getSkinAnalysisHistory(userId);
    
    // SkinHistoryScreen에서 사용하는 형식에 맞게 변환
    return history.map((analysis: any) => ({
      id: analysis.id,
      date: analysis.analysisDate,
      skinType: analysis.skinType,
      skinAge: analysis.skinAge || 25,
      moisture: analysis.moisture || 50,
      wrinkles: analysis.wrinkles || 30,
      pigmentation: analysis.pigmentation || 20,
      pores: analysis.pores || 40,
      acne: analysis.acne || 10,
      imageUri: analysis.imageUrl,
      issues: analysis.concerns.map((concern: string) => ({
        title: concern,
        severity: 'medium' as const
      })),
      analysisResult: analysis.analysisResult,
      recommendations: analysis.recommendations || []
    }));
  } catch (error) {
    console.error('❌ 피부 분석 내역 조회 실패 (productService):', error);
    return [];
  }
}

// 추천 내역 저장
export const saveRecommendationHistory = async (data: {
  userId: number;
  skinType: string;
  sensitivity: string;
  concerns: string[];
  aiExplanation: string;
  recommendedProducts: any[];
}): Promise<boolean> => {
  try {
    console.log('💾 추천 내역 저장 중...', data);
    
    const response = await medicalApi.saveRecommendationHistory({
      user_id: data.userId,
      skin_type: data.skinType,
      sensitivity: data.sensitivity,
      concerns: data.concerns,
      ai_explanation: data.aiExplanation,
      recommended_products: data.recommendedProducts
    }) as any;
    
    return response.success || false;
  } catch (error) {
    console.error('❌ 추천 내역 저장 실패:', error);
    return false;
  }
};

// 화장품 추천 내역 타입 정의 (SkinHistoryScreen에서 사용)
export interface CosmeticRecommendationHistory {
  id: number;
  date: string;
  skinType: string;
  concerns: string[];
  explanation?: string;
  recommendedProducts: {
    id: number;
    name: string;
    brand: string;
    category: string;
    image: any;
  }[];
}

// 추천 내역 조회
export const getRecommendationHistory = async (userId: number): Promise<CosmeticRecommendationHistory[]> => {
  try {
    console.log('📋 추천 내역 조회 중...', userId);
    
    const response = await medicalApi.getRecommendationHistory(userId) as any;
    
    console.log('🔍 백엔드 추천 내역 응답:', response);
    
    if (response.success && response.data) {
      return response.data.map((item: any) => {
        console.log('🔍 개별 추천 내역 항목:', item);
        
        return {
          id: item.id,
          date: item.date,
          skinType: item.skinType,
          concerns: item.concerns,
          explanation: item.explanation,
          recommendedProducts: item.recommendedProducts.map((product: any) => ({
            id: product.id,
            name: product.name,
            brand: product.brand,
            category: product.category,
            image: getProductImage(null, product.id) // 기본 이미지 사용
          }))
        };
      });
    }
    
    return [];
  } catch (error) {
    console.error('❌ 추천 내역 조회 실패:', error);
    return [];
  }
};

// 추천 내역 삭제
export const deleteRecommendationHistory = async (historyId: number): Promise<boolean> => {
  try {
    console.log('🗑️ 추천 내역 삭제 중...', historyId);
    
    const response = await medicalApi.deleteRecommendationHistory(historyId) as any;
    return response.success || false;
  } catch (error) {
    console.error('❌ 추천 내역 삭제 실패:', error);
    return false;
  }
};

// AI 분석 결과를 피부 고민 옵션으로 매핑하는 함수
export const mapAiResultToConcerns = (analysisResult: any): string[] => {
  const mappedConcerns: string[] = [];
  
  // skinDisease 매핑
  const diseaseMapping: { [key: string]: string[] } = {
    // 영어 키워드
    'acne': ['여드름'],
    'acne_vulgaris': ['여드름'],
    'comedone': ['블랙헤드'],
    'blackhead': ['블랙헤드'],
    'wrinkle': ['주름'],
    'wrinkles': ['주름'],
    'age_spot': ['기미/색소침착'],
    'pigmentation': ['기미/색소침착'],
    'melasma': ['기미/색소침착'],
    'hyperpigmentation': ['기미/색소침착'],
    'rosacea': ['홍조'],
    'redness': ['홍조'],
    'inflammation': ['염증'],
    'dermatitis': ['염증'],
    'dryness': ['각질'],
    'roughness': ['각질'],
    'pore': ['모공'],
    'enlarged_pore': ['모공'],
    'scar': ['여드름 흉터'],
    'acne_scar': ['여드름 흉터'],
    'photoaging': ['광노화'],
    'sun_damage': ['광노화'],
    'dark_circle': ['다크서클'],
    'sagging': ['탄력 저하'],
    
    // 한국어 키워드
    '여드름': ['여드름'],
    '블랙헤드': ['블랙헤드'],
    '주름': ['주름'],
    '기미': ['기미/색소침착'],
    '색소침착': ['기미/색소침착'],
    '홍조': ['홍조'],
    '염증': ['염증'],
    '모공': ['모공'],
    '흉터': ['여드름 흉터'],
    '광노화': ['광노화'],
    '다크서클': ['다크서클'],
    '탄력': ['탄력 저하'],
    '각질': ['각질']
  };

  // skinState 매핑  
  const stateMapping: { [key: string]: string[] } = {
    'oily': ['모공'], // 지성 피부는 모공 문제와 연관
    'dry': ['각질'], // 건성 피부는 각질 문제와 연관
    'rough': ['각질'],
    'inflamed': ['염증'],
    'irritated': ['염증'],
    'pigmented': ['기미/색소침착'],
    'aged': ['주름', '탄력 저하'],
    'wrinkled': ['주름'],
    'enlarged_pores': ['모공']
  };

  // 영어와 한국어 모두 처리
  const processMapping = (value: string, mapping: { [key: string]: string[] }) => {
    if (!value || value === 'undefined') return;
    
    const lowerValue = value.toLowerCase();
    
    // 직접 매핑 확인
    if (mapping[lowerValue]) {
      mappedConcerns.push(...mapping[lowerValue]);
      return;
    }
    
    // 부분 매치 확인
    Object.keys(mapping).forEach(key => {
      if (lowerValue.includes(key) || key.includes(lowerValue)) {
        mappedConcerns.push(...mapping[key]);
      }
    });
  };

  // 분석 결과 매핑
  if (analysisResult?.skinDisease) {
    processMapping(analysisResult.skinDisease, diseaseMapping);
  }
  
  if (analysisResult?.skinState) {
    processMapping(analysisResult.skinState, stateMapping);
  }

  // 중복 제거 및 최대 3개까지만 반환
  return Array.from(new Set(mappedConcerns)).slice(0, 3);
};

export const productService = {
  getProducts,
  getProductById,
  getPopularProducts,
  getNewProducts,
  getCategories,
  searchProducts,
  getProductsByBrand,
  getProductsByPriceRange,
  getProductsBySkinType,
  getProductShops,
  getCosmeticRecommendations,
  getSkinOptions,
  getSkinAnalysisHistory,
  saveRecommendationHistory,
  getRecommendationHistory,
  deleteRecommendationHistory,
  mapAiResultToConcerns,
}