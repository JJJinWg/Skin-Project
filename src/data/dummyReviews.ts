// 리뷰 관련 더미 데이터

export interface Review {
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
  userId?: number
  userName?: string
}

// 더미 리뷰 데이터 (실제 API에서는 JSON 형태로 받아옴)
export const dummyReviews: Review[] = [
  {
    id: 1,
    productId: 101,
    productName: "Beplain 클렌징 폼",
    productImage: require("../assets/product1.png"),
    rating: 4.5,
    content: "피부가 민감한 편인데 자극없이 순하게 세안할 수 있어요. 거품도 풍성하고 세정력도 좋습니다. 재구매 의사 있어요!",
    date: "2024-01-15",
    images: [],
    likes: 24,
    helpful: 18,
    userId: 1,
    userName: "홍길동"
  },
  {
    id: 2,
    productId: 102,
    productName: "Torriden 토너",
    productImage: require("../assets/product2.png"),
    rating: 5.0,
    content: "건조한 피부에 수분을 확실하게 채워줍니다. 끈적임 없이 흡수가 빠르고 피부결이 정돈되는 느낌이에요. 향도 은은해서 좋아요.",
    date: "2024-01-10",
    images: [],
    likes: 36,
    helpful: 29,
    userId: 1,
    userName: "홍길동"
  },
  {
    id: 3,
    productId: 103,
    productName: "김의사 피부과 진료",
    productImage: require("../assets/doctor1.png"),
    rating: 4.0,
    content: "친절하게 상담해주시고 치료 과정도 자세히 설명해주셔서 좋았습니다. 처방해주신 약도 효과가 좋았어요.",
    date: "2024-01-05",
    images: [],
    likes: 12,
    helpful: 8,
    userId: 1,
    userName: "홍길동"
  },
  {
    id: 4,
    productId: 104,
    productName: "세라마이드 크림",
    productImage: require("../assets/product1.png"),
    rating: 4.8,
    content: "겨울철 건조한 피부에 정말 좋아요. 발라도 끈적하지 않고 보습력이 오래 지속됩니다.",
    date: "2024-01-20",
    images: [],
    likes: 45,
    helpful: 32,
    userId: 1,
    userName: "홍길동"
  },
  {
    id: 5,
    productId: 105,
    productName: "비타민 C 세럼",
    productImage: require("../assets/product2.png"),
    rating: 3.5,
    content: "브라이트닝 효과는 있지만 민감한 피부에는 조금 자극적일 수 있어요. 점진적으로 사용하는 것을 추천합니다.",
    date: "2024-01-12",
    images: [],
    likes: 18,
    helpful: 15,
    userId: 1,
    userName: "홍길동"
  }
]

// API 응답 시뮬레이션 함수
export const getReviewsFromAPI = async (): Promise<Review[]> => {
  // 실제 API 호출 시뮬레이션
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 실제 구현 시:
  // const response = await fetch('/api/reviews')
  // const data = await response.json()
  // return data.reviews
  
  return dummyReviews
}

// 사용자별 리뷰 조회 API 시뮬레이션
export const getUserReviewsFromAPI = async (userId: number): Promise<Review[]> => {
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // 실제 구현 시:
  // const response = await fetch(`/api/users/${userId}/reviews`)
  // const data = await response.json()
  // return data.reviews
  
  return dummyReviews.filter(review => review.userId === userId)
}

// 제품별 리뷰 조회 API 시뮬레이션
export const getProductReviewsFromAPI = async (productId: number): Promise<Review[]> => {
  await new Promise(resolve => setTimeout(resolve, 600))
  
  // 실제 구현 시:
  // const response = await fetch(`/api/products/${productId}/reviews`)
  // const data = await response.json()
  // return data.reviews
  
  return dummyReviews.filter(review => review.productId === productId)
} 