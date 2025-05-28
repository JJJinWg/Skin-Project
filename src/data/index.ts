// 모든 더미 데이터 중앙 관리 파일

// 기존 데이터 (의사, 제품, 전문분야 등)
export * from './dummyData'

// 리뷰 관련 데이터
export * from './dummyReviews'

// 진료 요청서 관련 데이터
export * from './dummyDiagnosis'

// 예약 관련 데이터 (중복 방지를 위해 명시적으로 re-export)
export { 
  dummyAppointments as newDummyAppointments,
  type Appointment as NewAppointment,
  type AppointmentStatus as NewAppointmentStatus,
  getAppointmentsFromAPI,
  getUserAppointmentsFromAPI,
  createAppointmentToAPI,
  updateAppointmentStatusFromAPI,
  cancelAppointmentToAPI,
  getAppointmentByIdFromAPI
} from './dummyAppointments'

// API 시뮬레이션 함수들을 하나의 객체로 묶어서 export
export const mockAPI = {
  // 리뷰 API
  reviews: {
    getAll: () => import('./dummyReviews').then(m => m.getReviewsFromAPI()),
    getByUser: (userId: number) => import('./dummyReviews').then(m => m.getUserReviewsFromAPI(userId)),
    getByProduct: (productId: number) => import('./dummyReviews').then(m => m.getProductReviewsFromAPI(productId)),
  },
  
  // 진료 요청서 API
  diagnosis: {
    getAll: () => import('./dummyDiagnosis').then(m => m.getDiagnosisRequestsFromAPI()),
    getByUser: (userId: number) => import('./dummyDiagnosis').then(m => m.getUserDiagnosisRequestsFromAPI(userId)),
    getById: (requestId: number) => import('./dummyDiagnosis').then(m => m.getDiagnosisRequestByIdFromAPI(requestId)),
    submit: (data: any) => import('./dummyDiagnosis').then(m => m.submitDiagnosisRequestToAPI(data)),
    updateStatus: (id: number, status: any) => import('./dummyDiagnosis').then(m => m.updateDiagnosisRequestStatusFromAPI(id, status)),
  },
  
  // 예약 API
  appointments: {
    getAll: () => import('./dummyAppointments').then(m => m.getAppointmentsFromAPI()),
    getByUser: (userId: number) => import('./dummyAppointments').then(m => m.getUserAppointmentsFromAPI(userId)),
    getById: (appointmentId: number) => import('./dummyAppointments').then(m => m.getAppointmentByIdFromAPI(appointmentId)),
    create: (data: any) => import('./dummyAppointments').then(m => m.createAppointmentToAPI(data)),
    updateStatus: (id: number, status: any) => import('./dummyAppointments').then(m => m.updateAppointmentStatusFromAPI(id, status)),
    cancel: (id: number) => import('./dummyAppointments').then(m => m.cancelAppointmentToAPI(id)),
  }
}

// 실제 API 연동 시 사용할 베이스 URL 및 설정
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'https://api.skincare-app.com',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
}

// API 응답 타입 정의
export interface APIResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
  code?: number
}

// 페이지네이션 타입
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 실제 API 연동 시 사용할 헬퍼 함수들
export const apiHelpers = {
  // GET 요청
  get: async <T>(endpoint: string): Promise<APIResponse<T>> => {
    // 실제 구현 시:
    // const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
    //   method: 'GET',
    //   headers: API_CONFIG.HEADERS,
    // })
    // return await response.json()
    
    throw new Error('실제 API 연동이 필요합니다.')
  },
  
  // POST 요청
  post: async <T>(endpoint: string, data: any): Promise<APIResponse<T>> => {
    // 실제 구현 시:
    // const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
    //   method: 'POST',
    //   headers: API_CONFIG.HEADERS,
    //   body: JSON.stringify(data),
    // })
    // return await response.json()
    
    throw new Error('실제 API 연동이 필요합니다.')
  },
  
  // PUT 요청
  put: async <T>(endpoint: string, data: any): Promise<APIResponse<T>> => {
    // 실제 구현 시:
    // const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
    //   method: 'PUT',
    //   headers: API_CONFIG.HEADERS,
    //   body: JSON.stringify(data),
    // })
    // return await response.json()
    
    throw new Error('실제 API 연동이 필요합니다.')
  },
  
  // DELETE 요청
  delete: async <T>(endpoint: string): Promise<APIResponse<T>> => {
    // 실제 구현 시:
    // const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
    //   method: 'DELETE',
    //   headers: API_CONFIG.HEADERS,
    // })
    // return await response.json()
    
    throw new Error('실제 API 연동이 필요합니다.')
  }
} 