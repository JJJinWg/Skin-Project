// 리뷰 관련 서비스

import AsyncStorage from '@react-native-async-storage/async-storage'
import { dummyReviews, getUserReviewsFromAPI, type Review } from '../data/dummyReviews'
import { authService } from './authService'

// 사용자 리뷰 목록 조회
export const getUserReviews = async (): Promise<Review[]> => {
  try {
    console.log('📝 사용자 리뷰 목록 조회 중...');
    
    // 실제 API 시도
    const apiReviews = await getUserReviewsFromAPI(authService.getCurrentUserId());
    return apiReviews;
  } catch (error) {
    console.error('❌ 사용자 리뷰 목록 조회 실패:', error);
    throw new Error('리뷰 목록을 불러오는데 실패했습니다.');
  }
}

// 리뷰 작성
export const createReview = async (reviewData: Omit<Review, 'id' | 'date' | 'likes' | 'helpful'>): Promise<{ success: boolean; reviewId?: number; message: string }> => {
  try {
    // API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 실제 API 연동 시: const response = await apiClient.post('/reviews', reviewData);
    
    const reviewId = Math.floor(Math.random() * 10000)
    
    // AsyncStorage에 리뷰 저장 (임시)
    const existingReviews = await AsyncStorage.getItem('userReviews')
    const reviews = existingReviews ? JSON.parse(existingReviews) : []
    
    const newReview: Review = {
      id: reviewId,
      ...reviewData,
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      helpful: 0,
    }
    
    reviews.push(newReview)
    await AsyncStorage.setItem('userReviews', JSON.stringify(reviews))

    return {
      success: true,
      reviewId,
      message: '리뷰가 성공적으로 작성되었습니다.',
    }
  } catch (error) {
    console.error('리뷰 작성 실패:', error)
    return {
      success: false,
      message: '리뷰 작성에 실패했습니다. 다시 시도해주세요.',
    }
  }
}

// 리뷰 수정
export const updateReview = async (reviewId: number, reviewData: Partial<Review>): Promise<{ success: boolean; message: string }> => {
  try {
    // API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 실제 API 연동 시: const response = await apiClient.put(`/reviews/${reviewId}`, reviewData);
    
    // AsyncStorage에서 리뷰 업데이트 (임시)
    const existingReviews = await AsyncStorage.getItem('userReviews')
    const reviews = existingReviews ? JSON.parse(existingReviews) : []
    
    const updatedReviews = reviews.map((review: Review) => 
      review.id === reviewId 
        ? { ...review, ...reviewData }
        : review
    )
    
    await AsyncStorage.setItem('userReviews', JSON.stringify(updatedReviews))

    return {
      success: true,
      message: '리뷰가 성공적으로 수정되었습니다.',
    }
  } catch (error) {
    console.error('리뷰 수정 실패:', error)
    return {
      success: false,
      message: '리뷰 수정에 실패했습니다. 다시 시도해주세요.',
    }
  }
}

// 리뷰 삭제
export const deleteReview = async (reviewId: number): Promise<{ success: boolean; message: string }> => {
  try {
    // API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 800))

    // 실제 API 연동 시: const response = await apiClient.delete(`/reviews/${reviewId}`);
    
    // AsyncStorage에서 리뷰 삭제 (임시)
    const existingReviews = await AsyncStorage.getItem('userReviews')
    const reviews = existingReviews ? JSON.parse(existingReviews) : []
    
    const filteredReviews = reviews.filter((review: Review) => review.id !== reviewId)
    
    await AsyncStorage.setItem('userReviews', JSON.stringify(filteredReviews))

    return {
      success: true,
      message: '리뷰가 성공적으로 삭제되었습니다.',
    }
  } catch (error) {
    console.error('리뷰 삭제 실패:', error)
    return {
      success: false,
      message: '리뷰 삭제에 실패했습니다. 다시 시도해주세요.',
    }
  }
}

// 리뷰 상세 조회
export const getReviewById = async (reviewId: number): Promise<Review | null> => {
  try {
    // API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 500))

    // 실제 API 연동 시: const response = await apiClient.get(`/reviews/${reviewId}`);
    
    const reviews = await getUserReviews()
    const review = reviews.find(r => r.id === reviewId)
    
    return review || null
  } catch (error) {
    console.error('리뷰 상세 조회 실패:', error)
    return null
  }
}

export const reviewService = {
  getUserReviews,
  createReview,
  updateReview,
  deleteReview,
  getReviewById,
} 