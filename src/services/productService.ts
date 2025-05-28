// 제품 관련 서비스

import { 
  getProductsFromAPI, 
  getProductByIdFromAPI, 
  getPopularProductsFromAPI, 
  getNewProductsFromAPI,
  categories,
  type Product,
  type Category
} from '../data/dummyProducts'

// 제품 목록 조회 (검색, 필터링, 정렬 포함)
export const getProducts = async (
  category?: string,
  searchQuery?: string,
  sortBy?: 'popular' | 'rating' | 'price' | 'newest'
): Promise<Product[]> => {
  try {
    // 실제 API 연동 시: const response = await apiClient.get('/products', { params: { category, search: searchQuery, sort: sortBy } });
    
    const products = await getProductsFromAPI(category, searchQuery, sortBy)
    return products
  } catch (error) {
    console.error('제품 목록 조회 실패:', error)
    return []
  }
}

// 제품 상세 조회
export const getProductById = async (id: number): Promise<Product | null> => {
  try {
    // 실제 API 연동 시: const response = await apiClient.get(`/products/${id}`);
    
    const product = await getProductByIdFromAPI(id)
    return product
  } catch (error) {
    console.error('제품 상세 조회 실패:', error)
    return null
  }
}

// 인기 제품 목록 조회
export const getPopularProducts = async (): Promise<Product[]> => {
  try {
    // 실제 API 연동 시: const response = await apiClient.get('/products/popular');
    
    const products = await getPopularProductsFromAPI()
    return products
  } catch (error) {
    console.error('인기 제품 조회 실패:', error)
    return []
  }
}

// 신제품 목록 조회
export const getNewProducts = async (): Promise<Product[]> => {
  try {
    // 실제 API 연동 시: const response = await apiClient.get('/products/new');
    
    const products = await getNewProductsFromAPI()
    return products
  } catch (error) {
    console.error('신제품 조회 실패:', error)
    return []
  }
}

// 카테고리 목록 조회
export const getCategories = async (): Promise<Category[]> => {
  try {
    // 실제 API 연동 시: const response = await apiClient.get('/categories');
    
    // API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return categories
  } catch (error) {
    console.error('카테고리 조회 실패:', error)
    return []
  }
}

// 제품 검색 (자동완성용)
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    if (!query.trim()) return []
    
    // 실제 API 연동 시: const response = await apiClient.get('/products/search', { params: { q: query } });
    
    const products = await getProductsFromAPI(undefined, query)
    return products.slice(0, 10) // 최대 10개만 반환
  } catch (error) {
    console.error('제품 검색 실패:', error)
    return []
  }
}

// 브랜드별 제품 조회
export const getProductsByBrand = async (brand: string): Promise<Product[]> => {
  try {
    // 실제 API 연동 시: const response = await apiClient.get('/products/brand', { params: { brand } });
    
    const allProducts = await getProductsFromAPI()
    const brandProducts = allProducts.filter(product => 
      product.brand.toLowerCase() === brand.toLowerCase()
    )
    
    return brandProducts
  } catch (error) {
    console.error('브랜드별 제품 조회 실패:', error)
    return []
  }
}

// 가격대별 제품 조회
export const getProductsByPriceRange = async (minPrice: number, maxPrice: number): Promise<Product[]> => {
  try {
    // 실제 API 연동 시: const response = await apiClient.get('/products/price-range', { params: { min: minPrice, max: maxPrice } });
    
    const allProducts = await getProductsFromAPI()
    const filteredProducts = allProducts.filter(product => 
      product.price >= minPrice && product.price <= maxPrice
    )
    
    return filteredProducts
  } catch (error) {
    console.error('가격대별 제품 조회 실패:', error)
    return []
  }
}

// 피부타입별 제품 조회
export const getProductsBySkinType = async (skinType: string): Promise<Product[]> => {
  try {
    // 실제 API 연동 시: const response = await apiClient.get('/products/skin-type', { params: { type: skinType } });
    
    const allProducts = await getProductsFromAPI()
    const filteredProducts = allProducts.filter(product => 
      product.skinType.some(type => type.toLowerCase().includes(skinType.toLowerCase()))
    )
    
    return filteredProducts
  } catch (error) {
    console.error('피부타입별 제품 조회 실패:', error)
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