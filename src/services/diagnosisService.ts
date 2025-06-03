// 진단 관련 서비스

import { medicalApi } from './apiClient'

// 진료 요청서 관련 타입 정의
export interface DiagnosisRequest {
  id: number
  userId: number
  symptoms: string
  duration: string
  severity: "mild" | "moderate" | "severe"
  previousTreatment: string
  allergies: string
  medications: string
  medicalHistory: string
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

// 진단 관련 타입 정의
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

// AI 피부 분석 결과 타입 정의
export interface SkinAnalysisResult {
  skinType: string;
  concerns: string[];
  recommendations: string[];
  imageUrl: string;
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
    medicalHistory: string;
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
      const response: any = await medicalApi.submitDiagnosisRequest(requestData);
      return {
        success: true,
        requestId: response.id || response.data?.id,
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
      
      const response: any = await medicalApi.getUserDiagnosisRequests(userId);
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error('❌ 진료 요청서 목록 조회 실패:', error);
      return [];
    }
  },

  // 진료 요청서 상세 조회
  async getDiagnosisRequestById(id: number): Promise<DiagnosisRequest | null> {
    try {
      const response: any = await medicalApi.getDiagnosisRequestDetail(id);
      return response || response.data || null;
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
      
      const response: any = await medicalApi.getUserDiagnoses(userId);
      const diagnosesData = Array.isArray(response) ? response : response.data || [];
      
      // API 응답을 Diagnosis 타입에 맞게 변환
      const formattedDiagnoses: Diagnosis[] = diagnosesData.map((diagnosis: any) => ({
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
      const response: any = await medicalApi.getDiagnosisDetail(diagnosisId);
      const diagnosisData = response || response.data;
      
      if (!diagnosisData) return null;
      
      return {
        id: diagnosisData.id,
        doctorId: diagnosisData.doctorId,
        doctorName: diagnosisData.doctorName || '의사명',
        doctorImage: diagnosisData.doctorImage || require("../assets/doctor1.png"),
        specialty: diagnosisData.specialty || '전문분야',
        date: diagnosisData.date,
        symptoms: diagnosisData.symptoms || '',
        diagnosisContent: diagnosisData.diagnosisContent || '',
        treatment: diagnosisData.treatment || '',
        prescriptions: diagnosisData.prescriptions || [],
        followUpRequired: diagnosisData.followUpRequired || false,
        followUpDate: diagnosisData.followUpDate,
      };
    } catch (error) {
      console.error('❌ 진단 상세 조회 실패:', error);
      return null;
    }
  },

  // AI 피부 분석
  async analyzeSkin(imageUri: string): Promise<SkinAnalysisResult | null> {
    try {
      console.log('🔬 AI 피부 분석 중...');
      
      // 이미지를 FormData로 변환
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'skin_analysis.jpg',
      });
      
      // 실제 API 호출
      const response: any = await medicalApi.analyzeSkin(formData);
      const result = response || response.data;
      
      if (!result) return null;
      
      return {
        skinType: result.skinType || '알 수 없음',
        concerns: result.concerns || [],
        recommendations: result.recommendations || [],
        imageUrl: imageUri,
      };
    } catch (error) {
      console.error('❌ AI 피부 분석 실패:', error);
      return null;
    }
  }
} 