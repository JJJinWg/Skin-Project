// 백엔드 API 클라이언트
import { Platform } from 'react-native';

// 환경별 API URL 설정
const getApiBaseUrl = () => {
  if (__DEV__) {
    // 개발 환경: React Native에서는 localhost 대신 실제 IP 주소 사용
    
    if (Platform.OS === 'android') {
      // 환경변수가 설정되어 있으면 우선 사용
      if (process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
      }
      
      // Port forwarding 사용 시: adb port-forward 8000 8000
      // 또는 ADB reverse 사용 시: adb reverse tcp:8000 tcp:8000
      // 그러면 실제 기기에서도 localhost:8000 사용 가능
      // return 'http://localhost:8000';
      
      // 에뮬레이터 전용 주소 (port forwarding 미사용 시)
      return 'http://10.0.2.2:8000';
    } else {
      // iOS 시뮬레이터에서는 localhost 사용 가능
      return process.env.REACT_APP_API_URL || 'http://localhost:8000';
    }
  } else {
    // 운영 환경: 실제 운영 서버
    return process.env.REACT_APP_PROD_API_URL || 'https://your-production-api.com';
  }
};

const API_BASE_URL = getApiBaseUrl();

interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // FormData인 경우 Content-Type을 설정하지 않음 (브라우저가 자동으로 multipart/form-data로 설정)
    const isFormData = options.body instanceof FormData;
    
    const config: RequestInit = {
      headers: isFormData ? {
        ...options.headers,
      } : {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`🌐 API 요청: ${config.method || 'GET'} ${url}`);
      if (isFormData) {
        console.log('📎 FormData 전송');
      }
      
      // 30초 타임아웃 설정 (AI 추천을 위해)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ API 응답 성공: ${response.status}`);
      
      return data;
    } catch (error) {
      // 404 에러는 데이터가 없을 수 있는 정상적인 경우이므로 구분하여 처리
      if (error instanceof Error && error.message.includes('status: 404')) {
        console.log(`📭 요청된 리소스가 없습니다: ${url}`);
      } else {
        console.error(`❌ API 요청 실패: ${url}`, error);
      }
      throw error;
    }
  }

  // GET 요청
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', ...options });
  }

  // POST 요청
  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  // PUT 요청
  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // PATCH 요청
  async patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // DELETE 요청
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// API 클라이언트 인스턴스
const apiClient = new ApiClient(API_BASE_URL);

// 의료진/예약 시스템 API
export const medicalApi = {
  // 인증 관련 API
  login: (credentials: { email: string; password: string }) => 
    apiClient.post('/api/auth/login', credentials),
  logout: () => apiClient.post('/api/auth/logout', {}),
  register: (userData: { email: string; password: string; name: string; phone: string }) => 
    apiClient.post('/api/auth/register', userData),
  verifyToken: (token: string) => 
    apiClient.get('/api/auth/verify'),

  // 사용자 관련 API
  getUserProfile: (userId: number) => apiClient.get(`/api/users/${userId}`),
  updateUserProfile: (userId: number, data: any) => 
    apiClient.put(`/api/users/${userId}`, data),

  // 병원 관련 API
  getHospitals: () => apiClient.get('/api/medical/hospitals'),
  getHospital: (id: number) => apiClient.get(`/api/medical/hospitals/${id}`),

  // 의사 관련 API
  getDoctors: (params?: any) => apiClient.get('/api/medical/doctors'),
  getDoctor: (id: number) => apiClient.get(`/api/medical/doctors/${id}`),
  getDoctorAvailableTimes: (doctorId: number, date: string) => 
    apiClient.get(`/api/medical/doctors/${doctorId}/available-times?date=${date}`),
  getDoctorReviews: (doctorId: number) => apiClient.get(`/api/medical/doctors/${doctorId}/reviews`),

  // 예약 관련 API
  createAppointment: (data: any) => apiClient.post('/api/medical/appointments', data),
  getAppointments: (userId?: number) => apiClient.get(`/api/medical/appointments${userId ? `?user_id=${userId}` : ''}`),
  getAppointment: (id: number) => apiClient.get(`/api/medical/appointments/${id}`),
  updateAppointmentStatus: (id: number, status: string) => 
    apiClient.patch(`/api/medical/appointments/${id}`, { status }),
  cancelAppointment: (id: number) => apiClient.delete(`/api/medical/appointments/${id}`),
  cancelAppointmentWithReason: (id: number, cancellationReason: string) => 
    apiClient.delete(`/api/medical/appointments/${id}?reason=${encodeURIComponent(cancellationReason)}`),

  // 진료 요청서 관련 API
  createDiagnosisRequest: (data: any) => apiClient.post('/api/medical/diagnosis-requests', data),
  submitDiagnosisRequest: (data: any) => apiClient.post('/api/medical/diagnosis-requests', data),
  getDiagnosisRequests: (userId?: number) => 
    apiClient.get(`/api/medical/diagnosis-requests${userId ? `?user_id=${userId}` : ''}`),
  getUserDiagnosisRequests: (userId: number) => 
    apiClient.get(`/api/medical/diagnosis-requests?user_id=${userId}`),
  getDiagnosisRequest: (id: number) => apiClient.get(`/api/medical/diagnosis-requests/${id}`),
  getDiagnosisRequestDetail: (id: number) => apiClient.get(`/api/medical/diagnosis-requests/${id}`),
  updateDiagnosisRequestStatus: (id: number, status: string) => 
    apiClient.patch(`/api/medical/diagnosis-requests/${id}`, { status }),
  cancelDiagnosisRequest: (id: number) => 
    apiClient.patch(`/api/medical/diagnosis-requests/${id}`, { status: 'cancelled' }),

  // 진단 내역 관련 API
  getUserDiagnoses: (userId: number) => apiClient.get(`/api/medical/diagnoses/user/${userId}`),
  getDiagnosisDetail: (diagnosisId: number) => apiClient.get(`/api/medical/diagnoses/${diagnosisId}`),
  analyzeSkin: (formData: FormData) => apiClient.post('/api/ai/analyze-skin', formData),

  // 리뷰 관련 API
  createReview: (data: any) => apiClient.post('/api/reviews', data),
  getReviews: (params?: any) => apiClient.get('/api/reviews', params),
  getUserReviews: (userId: number) => apiClient.get(`/api/reviews/user/${userId}`),
  getProductReviews: (productId: number) => apiClient.get(`/api/reviews/product/${productId}`),
  updateReview: (id: number, data: any) => apiClient.put(`/api/reviews/${id}`, data),
  deleteReview: (id: number) => apiClient.delete(`/api/reviews/${id}`),

  // 제품 관련 API (실제 백엔드 데이터 사용)
  getProducts: (params?: any) => apiClient.get('/api/products', params),
  getProduct: (id: number) => apiClient.get(`/api/products/${id}`),
  getPopularProducts: () => apiClient.get('/api/products/popular'),
  getNewProducts: () => apiClient.get('/api/products/new'),
  getProductsByCategory: (category: string) => apiClient.get(`/api/products/category/${category}`),
  getProductShops: (productId: number) => apiClient.get(`/api/products/${productId}/shops`),

  // 약국 관련 API
  getPharmacies: (params?: any) => apiClient.get('/api/pharmacies', params),
  getNearbyPharmacies: (lat: number, lng: number, radius?: number) => 
    apiClient.get(`/api/pharmacies/nearby?lat=${lat}&lng=${lng}&radius=${radius || 5}`),

  // 헬스체크
  healthCheck: () => apiClient.get('/health'),

  // 화장품 추천 API
  getRecommendation: (data: any) => apiClient.post('/recommend/ai', data),

  // 카테고리 관련 API
  getCategories: () => apiClient.get('/api/categories'),

  // 피부 옵션 관련 API
  getSkinOptions: () => apiClient.get('/api/skin-options'),
  
  // 추천 내역 관련 API
  saveRecommendationHistory: (data: any) => apiClient.post('/api/recommendations/save', data),
  getRecommendationHistory: (userId: number) => apiClient.get(`/api/recommendations/history/${userId}`),
  deleteRecommendationHistory: (historyId: number) => apiClient.delete(`/api/recommendations/${historyId}`),

  // AI 피부 분석 관련 API
  saveSkinAnalysis: (data: any) => apiClient.post('/api/skin-analysis/save', data),
  getSkinAnalysisHistory: (userId: number) => apiClient.get(`/api/skin-analysis/history/${userId}`),
  getSkinAnalysisDetail: (analysisId: number) => apiClient.get(`/api/skin-analysis/${analysisId}`),
  deleteSkinAnalysis: (analysisId: number) => apiClient.delete(`/api/skin-analysis/${analysisId}`),
};

// 기타 API
export const generalApi = {
  // AI 화장품 추천 (/recommend/ai 엔드포인트 호출)
  getRecommendation: (query: any) => apiClient.post('/recommend/ai', query),
  
  // 크롤링 실행
  runCrawling: () => apiClient.get('/crawl'),
};

export default apiClient; 