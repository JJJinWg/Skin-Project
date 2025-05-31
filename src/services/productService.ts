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
}

// Category 타입 정의
export interface Category {
  id: string
  name: string
  icon: string
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
  // 로컬 이미지 매핑
  const imageMap: { [key: string]: any } = {
    'product1.png': require('../assets/product1.png'),
    'product2.png': require('../assets/product2.png'),
  }
  
  if (imageUrl && imageMap[imageUrl]) {
    return imageMap[imageUrl]
  }
  
  // 기본 이미지 (ID에 따라)
  return productId % 2 === 1 
    ? require('../assets/product1.png') 
    : require('../assets/product2.png')
}

// 제품 목록 조회 (검색, 필터링, 정렬 포함)
export const getProducts = async (
  category?: string,
  searchQuery?: string,
  sortBy?: 'popular' | 'rating' | 'price' | 'newest'
): Promise<Product[]> => {
  try {
    console.log('📦 제품 목록 조회 중...', { category, searchQuery, sortBy });
    
    // 실제 API 호출
    const response = await medicalApi.getProducts({ category, search: searchQuery, sort: sortBy }) as any;
    
    // API 응답 형식 확인 및 데이터 추출
    const apiProducts = response?.data || response || [];
    
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
      ingredients: product.ingredients || [],
      skinType: product.skinTypes || product.skin_types || [],
      benefits: product.benefits || [],
      volume: product.volume || '',
      isPopular: product.isPopular || product.is_popular || false,
      isNew: product.isNew || product.is_new || false
    }));
    
    console.log(`✅ 제품 목록 조회 성공: ${products.length}개`);
    return products;
  } catch (error) {
    console.error('❌ 제품 목록 조회 실패:', error)
    return []
  }
}

// 제품 상세 조회
export const getProductById = async (id: number): Promise<Product | null> => {
  try {
    console.log('🔍 제품 상세 조회 중...', id);
    
    // 실제 API 호출 (getProduct 메서드 사용)
    const product = await medicalApi.getProduct(id) as any;
    
    if (!product) return null;
    
    // API 응답을 Product 인터페이스에 맞게 변환
    return {
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
      ingredients: product.ingredients || [],
      skinType: product.skinTypes || product.skin_types || [],
      benefits: product.benefits || [],
      volume: product.volume || '',
      isPopular: product.isPopular || product.is_popular || false,
      isNew: product.isNew || product.is_new || false
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
      isNew: false
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
      isNew: true
    }));
    
    console.log(`✅ 신제품 목록 조회 성공: ${products.length}개`);
    return products;
  } catch (error) {
    console.error('❌ 신제품 목록 조회 실패:', error);
    return [];
  }
}

// 카테고리 목록 조회 (기본 카테고리만 사용)
export const getCategories = async (): Promise<Category[]> => {
  try {
    console.log('📂 카테고리 목록 조회 중...');
    
    // API에 카테고리 엔드포인트가 없으므로 기본 카테고리 반환
    return defaultCategories;
  } catch (error) {
    console.error('❌ 카테고리 조회 실패:', error)
    return defaultCategories
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
}