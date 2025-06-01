// 진료 요청서 관련 서비스

import AsyncStorage from '@react-native-async-storage/async-storage'
import { 
  getUserDiagnosisRequestsFromAPI, 
  submitDiagnosisRequestToAPI,
  type DiagnosisRequest 
} from '../data/dummyDiagnosis'
import { authService } from './authService'
import { medicalApi } from './apiClient'

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

// 진단 관련 서비스
export interface Diagnosis {
  id: number
  doctorId: number
  doctorName: string
  doctorImage: any
  specialty: string
  date: string
  symptoms: string
  diagnosisContent: string
  treatment: string
  prescriptions: string[]
  followUpRequired: boolean
  followUpDate?: string
}

export interface DiagnosisRequest {
  id: number
  userId: number
  symptoms: string
  duration: string
  severity: "mild" | "moderate" | "severe"
  previousTreatment: string
  allergies: string
  medications: string
  additionalNotes: string
  images: Array<{
    uri: string
    type: string
    name: string
  }>
  status: string
  createdAt: string
  updatedAt: string
}

export const diagnosisService = {
  // 진료 요청서 제출
  async submitDiagnosisRequest(requestData: {
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
  }): Promise<{ success: boolean; requestId?: number; message: string }> {
    try {
      console.log('📋 진료 요청서 제출 중...');
      
      // 실제 백엔드 API 호출
      const response = await medicalApi.submitDiagnosisRequest(requestData);
      return {
        success: true,
        requestId: response.id,
        message: '진료 요청서가 성공적으로 제출되었습니다.'
      };
    } catch (error) {
      console.error('❌ 진료 요청서 제출 실패:', error);
      return {
        success: false,
        message: '진료 요청서 제출에 실패했습니다.'
      };
    }
  },

  // 진료 요청서 목록 조회
  async getDiagnosisRequests(userId: number): Promise<DiagnosisRequest[]> {
    try {
      console.log('📋 진료 요청서 목록 조회 중...');
      
      const response = await medicalApi.getUserDiagnosisRequests(userId);
      return response;
    } catch (error) {
      console.error('❌ 진료 요청서 목록 조회 실패:', error);
      throw new Error('진료 요청서 목록을 불러오는데 실패했습니다.');
    }
  },

  // 진료 요청서 상세 조회
  async getDiagnosisRequestById(id: number): Promise<DiagnosisRequest | null> {
    try {
      const response = await medicalApi.getDiagnosisRequestDetail(id);
      return response;
    } catch (error) {
      console.error('진료 요청서 상세 조회 실패:', error);
      return null;
    }
  },

  // 진료 요청서 취소
  async cancelDiagnosisRequest(id: number): Promise<{ success: boolean; message: string }> {
    try {
      await medicalApi.cancelDiagnosisRequest(id);
      return {
        success: true,
        message: '진료 요청서가 성공적으로 취소되었습니다.',
      };
    } catch (error) {
      console.error('진료 요청서 취소 실패:', error);
      return {
        success: false,
        message: '진료 요청서 취소에 실패했습니다. 다시 시도해주세요.',
      };
    }
  },

  // 사용자의 진단 내역 조회 (실제 API 사용)
  async getUserDiagnoses(userId: number): Promise<Diagnosis[]> {
    try {
      console.log('📋 진단 내역 조회 중...');
      
      const response = await medicalApi.getUserDiagnoses(userId);
      
      // API 응답을 Diagnosis 타입에 맞게 변환
      const formattedDiagnoses: Diagnosis[] = response.map((diagnosis: any) => ({
        id: diagnosis.id,
        doctorId: diagnosis.doctorId,
        doctorName: diagnosis.doctorName || '의사명',
        doctorImage: diagnosis.doctorImage || require("../assets/doctor1.png"),
        specialty: diagnosis.specialty || '전문분야',
        date: diagnosis.date,
        symptoms: diagnosis.symptoms || '',
        diagnosisContent: diagnosis.diagnosisContent || '',
        treatment: diagnosis.treatment || '',
        prescriptions: diagnosis.prescriptions || [],
        followUpRequired: diagnosis.followUpRequired || false,
        followUpDate: diagnosis.followUpDate,
      }));
      
      return formattedDiagnoses;
    } catch (error) {
      console.error('❌ 진단 내역 조회 실패:', error);
      // 오류 시 빈 배열 반환
      return [];
    }
  },

  // 특정 진단 상세 조회 (실제 API 사용)
  async getDiagnosisDetail(diagnosisId: number): Promise<Diagnosis | null> {
    try {
      const response = await medicalApi.getDiagnosisDetail(diagnosisId);
      
      if (!response) return null;
      
      return {
        id: response.id,
        doctorId: response.doctorId,
        doctorName: response.doctorName || '의사명',
        doctorImage: response.doctorImage || require("../assets/doctor1.png"),
        specialty: response.specialty || '전문분야',
        date: response.date,
        symptoms: response.symptoms || '',
        diagnosisContent: response.diagnosisContent || '',
        treatment: response.treatment || '',
        prescriptions: response.prescriptions || [],
        followUpRequired: response.followUpRequired || false,
        followUpDate: response.followUpDate,
      };
    } catch (error) {
      console.error('❌ 진단 상세 조회 실패:', error);
      return null;
    }
  }
} 