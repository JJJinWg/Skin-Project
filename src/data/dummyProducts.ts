// 제품 관련 더미 데이터

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
  latestReview?: {
    user: string
    content: string
    date: string
    rating: number
    likes: number
  }
}

export interface Category {
  id: string
  name: string
  icon?: string
}

// 카테고리 데이터
export const categories: Category[] = [
  { id: 'all', name: '전체' },
  { id: 'skincare', name: '스킨케어' },
  { id: 'makeup', name: '메이크업' },
  { id: 'suncare', name: '선케어' },
  { id: 'cleansing', name: '클렌징' },
  { id: 'mask', name: '마스크' },
  { id: 'serum', name: '세럼' },
  { id: 'moisturizer', name: '보습제' },
]

// 제품 더미 데이터
export const dummyProducts: Product[] = [
  {
    id: 1,
    name: 'Beplain 녹두 진정 토너',
    brand: 'Beplain',
    category: 'skincare',
    price: 18000,
    originalPrice: 22000,
    rating: 4.5,
    reviewCount: 128,
    image: require('../assets/product1.png'),
    description: '민감한 피부를 위한 녹두 추출물 함유 진정 토너입니다. 자극 없이 부드럽게 피부를 정돈해줍니다.',
    ingredients: ['녹두 추출물', '판테놀', '나이아신아마이드', '히알루론산'],
    skinType: ['민감성', '건성', '복합성'],
    benefits: ['진정', '보습', '각질케어'],
    volume: '200ml',
    isPopular: true,
    isNew: false,
    latestReview: {
      user: '피부좋아짐',
      content: '민감성 피부에 딱 좋아요! 자극 없이 진정되는 느낌이에요.',
      date: '2일 전',
      rating: 5,
      likes: 24,
    },
  },
  {
    id: 2,
    name: 'Torriden 다이브인 세럼',
    brand: 'Torriden',
    category: 'serum',
    price: 15000,
    rating: 4.2,
    reviewCount: 86,
    image: require('../assets/product2.png'),
    description: '5가지 히알루론산으로 깊은 수분 공급을 해주는 보습 세럼입니다.',
    ingredients: ['히알루론산', '판테놀', '알란토인', '베타글루칸'],
    skinType: ['건성', '복합성', '지성'],
    benefits: ['보습', '수분공급', '탄력'],
    volume: '50ml',
    isPopular: false,
    isNew: true,
    latestReview: {
      user: '화장품매니아',
      content: '수분감이 오래 지속되고 흡수도 잘 돼요. 가성비 좋은 제품입니다.',
      date: '1주일 전',
      rating: 4,
      likes: 18,
    },
  },
  {
    id: 3,
    name: '아이소이 불가리안 로즈 세럼',
    brand: 'isoi',
    category: 'serum',
    price: 35000,
    originalPrice: 42000,
    rating: 4.7,
    reviewCount: 215,
    image: require('../assets/product1.png'),
    description: '불가리안 로즈 오일과 펩타이드가 함유된 안티에이징 세럼입니다.',
    ingredients: ['불가리안 로즈 오일', '펩타이드', '아데노신', '나이아신아마이드'],
    skinType: ['건성', '성숙성', '복합성'],
    benefits: ['안티에이징', '탄력', '영양공급'],
    volume: '30ml',
    isPopular: true,
    isNew: false,
    latestReview: {
      user: '로즈덕후',
      content: '향이 너무 좋고 피부결이 정돈되는 느낌이에요. 꾸준히 쓰고 있어요.',
      date: '3일 전',
      rating: 5,
      likes: 42,
    },
  },
  {
    id: 4,
    name: '라운드랩 자작나무 수분 크림',
    brand: 'Round Lab',
    category: 'moisturizer',
    price: 22000,
    rating: 4.3,
    reviewCount: 167,
    image: require('../assets/product2.png'),
    description: '자작나무 수액으로 만든 깊은 보습 크림입니다. 끈적임 없이 촉촉함을 유지해줍니다.',
    ingredients: ['자작나무 수액', '세라마이드', '스쿠알란', '히알루론산'],
    skinType: ['건성', '복합성', '민감성'],
    benefits: ['보습', '수분공급', '진정'],
    volume: '80ml',
    isPopular: false,
    isNew: false,
    latestReview: {
      user: '수분부족',
      content: '건조한 피부에 수분을 채워주는 느낌이에요. 가볍게 발리고 좋아요.',
      date: '5일 전',
      rating: 4,
      likes: 31,
    },
  },
  {
    id: 5,
    name: '코스알엑스 스네일 무친 에센스',
    brand: 'COSRX',
    category: 'serum',
    price: 25000,
    rating: 4.6,
    reviewCount: 324,
    image: require('../assets/product1.png'),
    description: '96% 달팽이 분비물 여과액으로 만든 진정 에센스입니다.',
    ingredients: ['달팽이 분비물 여과액', '히알루론산', '판테놀', '아르기닌'],
    skinType: ['지성', '복합성', '트러블성'],
    benefits: ['진정', '재생', '트러블케어'],
    volume: '96ml',
    isPopular: true,
    isNew: false,
    latestReview: {
      user: '달팽이덕후',
      content: '트러블 진정에 효과가 좋아요. 꾸준히 사용하면 피부결이 확실히 좋아져요.',
      date: '1일 전',
      rating: 5,
      likes: 56,
    },
  },
  {
    id: 6,
    name: '에뛰드하우스 선프라이즈 마일드 워터리 라이트',
    brand: 'ETUDE HOUSE',
    category: 'suncare',
    price: 12000,
    rating: 4.1,
    reviewCount: 89,
    image: require('../assets/product2.png'),
    description: 'SPF50+ PA+++ 자외선 차단제로 가볍고 촉촉한 사용감을 제공합니다.',
    ingredients: ['징크옥사이드', '티타늄디옥사이드', '히알루론산', '알로에 추출물'],
    skinType: ['모든피부', '민감성'],
    benefits: ['자외선차단', '보습', '진정'],
    volume: '50ml',
    isPopular: false,
    isNew: true,
    latestReview: {
      user: '자외선차단필수',
      content: '끈적이지 않고 백탁현상도 없어서 매일 사용하기 좋아요.',
      date: '4일 전',
      rating: 4,
      likes: 15,
    },
  },
  {
    id: 7,
    name: '이니스프리 그린티 클렌징 폼',
    brand: 'innisfree',
    category: 'cleansing',
    price: 8000,
    rating: 4.0,
    reviewCount: 203,
    image: require('../assets/product1.png'),
    description: '제주 녹차 추출물이 함유된 순한 클렌징 폼입니다.',
    ingredients: ['녹차 추출물', '글리세린', '코코일 글루타민산', '살리실산'],
    skinType: ['지성', '복합성', '트러블성'],
    benefits: ['클렌징', '진정', '모공케어'],
    volume: '150ml',
    isPopular: false,
    isNew: false,
    latestReview: {
      user: '클렌징마니아',
      content: '거품이 풍성하고 세정력이 좋아요. 세안 후 당김도 없어서 만족해요.',
      date: '1주일 전',
      rating: 4,
      likes: 22,
    },
  },
  {
    id: 8,
    name: '메디힐 티트리 케어 솔루션 마스크',
    brand: 'MEDIHEAL',
    category: 'mask',
    price: 2500,
    rating: 4.4,
    reviewCount: 156,
    image: require('../assets/product2.png'),
    description: '티트리 추출물로 트러블 진정에 도움을 주는 시트 마스크입니다.',
    ingredients: ['티트리 추출물', '살리실산', '나이아신아마이드', '알란토인'],
    skinType: ['지성', '트러블성', '복합성'],
    benefits: ['진정', '트러블케어', '모공케어'],
    volume: '25ml (1매)',
    isPopular: true,
    isNew: false,
    latestReview: {
      user: '마스크덕후',
      content: '트러블이 있을 때 사용하면 다음날 확실히 진정돼요. 가성비 좋아요.',
      date: '3일 전',
      rating: 5,
      likes: 33,
    },
  },
]

// API 시뮬레이션 함수들
export const getProductsFromAPI = async (
  category?: string,
  searchQuery?: string,
  sortBy?: 'popular' | 'rating' | 'price' | 'newest'
): Promise<Product[]> => {
  // API 호출 시뮬레이션
  await new Promise(resolve => setTimeout(resolve, 800))

  let filteredProducts = [...dummyProducts]

  // 카테고리 필터링
  if (category && category !== 'all') {
    filteredProducts = filteredProducts.filter(product => 
      product.category === category
    )
  }

  // 검색어 필터링
  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    filteredProducts = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.brand.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    )
  }

  // 정렬
  switch (sortBy) {
    case 'popular':
      filteredProducts.sort((a, b) => b.reviewCount - a.reviewCount)
      break
    case 'rating':
      filteredProducts.sort((a, b) => b.rating - a.rating)
      break
    case 'price':
      filteredProducts.sort((a, b) => a.price - b.price)
      break
    case 'newest':
      filteredProducts.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
      break
    default:
      // 기본 정렬: 인기순
      filteredProducts.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0))
  }

  return filteredProducts
}

export const getProductByIdFromAPI = async (id: number): Promise<Product | null> => {
  // API 호출 시뮬레이션
  await new Promise(resolve => setTimeout(resolve, 500))

  const product = dummyProducts.find(p => p.id === id)
  return product || null
}

export const getPopularProductsFromAPI = async (): Promise<Product[]> => {
  // API 호출 시뮬레이션
  await new Promise(resolve => setTimeout(resolve, 600))

  return dummyProducts.filter(product => product.isPopular).slice(0, 5)
}

export const getNewProductsFromAPI = async (): Promise<Product[]> => {
  // API 호출 시뮬레이션
  await new Promise(resolve => setTimeout(resolve, 600))

  return dummyProducts.filter(product => product.isNew).slice(0, 5)
} 