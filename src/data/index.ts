// API 설정 및 타입 정의

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
    throw new Error('실제 API 연동이 필요합니다.')
  },
  
  // POST 요청
  post: async <T>(endpoint: string, data: any): Promise<APIResponse<T>> => {
    throw new Error('실제 API 연동이 필요합니다.')
  },
  
  // PUT 요청
  put: async <T>(endpoint: string, data: any): Promise<APIResponse<T>> => {
    throw new Error('실제 API 연동이 필요합니다.')
  },
  
  // DELETE 요청
  delete: async <T>(endpoint: string): Promise<APIResponse<T>> => {
    throw new Error('실제 API 연동이 필요합니다.')
  }
} 