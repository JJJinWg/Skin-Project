// 리뷰 관련 서비스 - 실제 API 연동

// Review 타입 정의 및 export
export type Review = {
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
}

const API_BASE_URL = 'http://localhost:8000';

// 제품 목록 조회
export const getProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products`);
    if (!response.ok) {
      throw new Error('제품 목록을 불러올 수 없습니다.');
    }
    return await response.json();
  } catch (error) {
    console.error('제품 목록 로딩 실패:', error);
    throw error;
  }
};

// 리뷰 작성
export const createReview = async (reviewData: {
  product_id: number;
  rating: number;
  content: string;
  images?: string[];
}): Promise<{ success: boolean; reviewId?: number; message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });
    
    if (!response.ok) {
      throw new Error('리뷰 등록에 실패했습니다.');
    }
    
    const result = await response.json();
    
    return {
      success: true,
      reviewId: result.id,
      message: '리뷰가 성공적으로 작성되었습니다.',
    };
  } catch (error) {
    console.error('리뷰 작성 실패:', error);
    return {
      success: false,
      message: '리뷰 작성에 실패했습니다. 다시 시도해주세요.',
    };
  }
};

// 사용자 리뷰 목록 조회
export const getUserReviews = async (): Promise<Review[]> => {
  try {
    console.log('📝 사용자 리뷰 목록 조회 중...');
    
    // 실제 API 호출 (사용자 ID는 실제로는 인증에서 가져와야 함)
    const response = await fetch(`${API_BASE_URL}/api/reviews/user/1`);
    if (!response.ok) {
      throw new Error('리뷰 목록을 불러올 수 없습니다.');
    }
    
    const reviewsData = await response.json();
    
    // API 응답을 Review 타입에 맞게 변환
    const formattedReviews: Review[] = reviewsData.map((review: any) => ({
      id: review.id,
      productId: review.product_id || review.productId || 0,
      productName: review.product_name || review.productName || '제품명',
      productImage: require("../assets/product1.png"), // 기본 이미지
      rating: review.rating || 0,
      content: review.content || '',
      date: review.created_at ? review.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      images: review.images || [],
      likes: review.likes || 0,
      helpful: review.helpful || 0,
    }));
    
    return formattedReviews;
  } catch (error) {
    console.error('❌ 사용자 리뷰 목록 조회 실패:', error);
    // 폴백: 기본 데이터
    return [
      {
        id: 1,
        productId: 101,
        productName: "Beplain 클렌징 폼",
        productImage: require("../assets/product1.png"),
        rating: 4.5,
        content: "피부가 민감한 편인데 자극없이 순하게 세안할 수 있어요.",
        date: "2023-05-15",
        images: [],
        likes: 24,
        helpful: 18,
      },
    ];
  }
};

// 리뷰 삭제
export const deleteReview = async (reviewId: number): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('리뷰 삭제에 실패했습니다.');
    }
    
    return {
      success: true,
      message: '리뷰가 성공적으로 삭제되었습니다.',
    };
  } catch (error) {
    console.error('리뷰 삭제 실패:', error);
    return {
      success: false,
      message: '리뷰 삭제에 실패했습니다. 다시 시도해주세요.',
    };
  }
};

// 리뷰 수정
export const updateReview = async (reviewId: number, data: { rating: number; content: string; images?: string[] }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('리뷰 수정에 실패했습니다.');
    }
    return { success: true };
  } catch (error) {
    console.error('리뷰 수정 실패:', error);
    return { success: false, message: '리뷰 수정에 실패했습니다. 다시 시도해주세요.' };
  }
};

export const reviewService = {
  getProducts,
  createReview,
  getUserReviews,
  deleteReview,
  updateReview,
};