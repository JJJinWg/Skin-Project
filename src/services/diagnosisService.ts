// 진료 요청서 관련 서비스

import AsyncStorage from '@react-native-async-storage/async-storage'
import { 
  getUserDiagnosisRequestsFromAPI, 
  submitDiagnosisRequestToAPI,
  type DiagnosisRequest 
} from '../data/dummyDiagnosis'
import { authService } from './authService'

// 진료 요청서 제출
export const submitDiagnosisRequest = async (requestData: {
  symptoms: string;
  duration: string;
  severity: "mild" | "moderate" | "severe";
  previousTreatment: string;
  allergies: string;
  medications: string;
  additionalNotes: string;
  images: Array<{
    uri: string;
    type: string;
    name: string;
  }>;
}): Promise<{ success: boolean; requestId?: number; message: string }> => {
  try {
    console.log('📋 진료 요청서 제출 중...');
    
    // 실제 API 호출
    return await submitDiagnosisRequestToAPI(requestData);
  } catch (error) {
    console.error('❌ 진료 요청서 제출 실패:', error);
    throw new Error('진료 요청서 제출에 실패했습니다.');
  }
}

// 진료 요청서 목록 조회
export const getDiagnosisRequests = async (): Promise<DiagnosisRequest[]> => {
  try {
    console.log('📋 진료 요청서 목록 조회 중...');
    
    // 실제 API 시도
    const apiRequests = await getUserDiagnosisRequestsFromAPI(authService.getCurrentUserId());
    return apiRequests;
  } catch (error) {
    console.error('❌ 진료 요청서 목록 조회 실패:', error);
    throw new Error('진료 요청서 목록을 불러오는데 실패했습니다.');
  }
}

// 진료 요청서 상세 조회
export const getDiagnosisRequestById = async (id: number): Promise<DiagnosisRequest | null> => {
  try {
    // API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 500))

    // 실제 API 연동 시: const response = await apiClient.get(`/diagnosis/requests/${id}`);
    
    const requests = await getDiagnosisRequests()
    const request = requests.find(req => req.id === id)
    
    return request || null
  } catch (error) {
    console.error('진료 요청서 상세 조회 실패:', error)
    return null
  }
}

// 진료 요청서 취소
export const cancelDiagnosisRequest = async (id: number): Promise<{ success: boolean; message: string }> => {
  try {
    // API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 실제 API 연동 시: const response = await apiClient.put(`/diagnosis/requests/${id}/cancel`);
    
    // AsyncStorage에서 진료 요청서 상태 업데이트 (임시)
    const existingRequests = await AsyncStorage.getItem('diagnosisRequests')
    const requests = existingRequests ? JSON.parse(existingRequests) : []
    
    const updatedRequests = requests.map((request: DiagnosisRequest) => 
      request.id === id 
        ? { ...request, status: '취소', updatedAt: new Date().toISOString() }
        : request
    )
    
    await AsyncStorage.setItem('diagnosisRequests', JSON.stringify(updatedRequests))

    return {
      success: true,
      message: '진료 요청서가 성공적으로 취소되었습니다.',
    }
  } catch (error) {
    console.error('진료 요청서 취소 실패:', error)
    return {
      success: false,
      message: '진료 요청서 취소에 실패했습니다. 다시 시도해주세요.',
    }
  }
}

export const diagnosisService = {
  submitDiagnosisRequest,
  getDiagnosisRequests,
  getDiagnosisRequestById,
  cancelDiagnosisRequest,
} 