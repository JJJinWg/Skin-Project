// 리뷰 관련 서비스 - 실제 API 연동
import { medicalApi } from './apiClient';

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

// 제품 목록 조회
export const getProducts = async () => {
  try {
    return await medicalApi.getProducts();
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
    const result: any = await medicalApi.createReview(reviewData);
    
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
    const reviewsData: any = await medicalApi.getUserReviews(1);
    
    // API 응답을 Review 타입에 맞게 변환
    const formattedReviews: Review[] = reviewsData.map((review: any) => ({
      id: review.id,
      productId: review.product_id || review.productId || 0,
      productName: review.product_name || review.productName || '제품명',
      productImage: { uri: 'https://via.placeholder.com/150?text=Product+Image' }, // 기본 이미지
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
        productImage: { uri: 'https://via.placeholder.com/150?text=Product+Image' },
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
    await medicalApi.deleteReview(reviewId);
    
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
    await medicalApi.updateReview(reviewId, data);
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