import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API 기본 URL 설정
const API_BASE_URL = 'https://your-backend.example.com/api'; // TODO: 실제 백엔드 URL로 교체

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: async (headers) => {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Doctor', 'Reservation', 'SkinDiagnosis', 'Product', 'Auth'],
  endpoints: (builder) => ({
    // 로그인 엔드포인트 (목업 데이터 사용)
    login: builder.mutation<LoginResponse, LoginRequest>({
      queryFn: async (credentials) => {
        console.log('Mock login attempt with:', credentials);
        // 실제 API 호출 대신 목업 데이터 반환
        // API가 준비되면 이 부분을 실제 API 호출로 변경합니다.
        await new Promise(resolve => setTimeout(resolve, 1000)); // 네트워크 지연 시뮬레이션

        if (credentials.email === 'test@example.com' && credentials.password === 'password') {
          const mockUserData: LoginResponse = {
            accessToken: 'mock-access-token-12345',
            refreshToken: 'mock-refresh-token-67890',
            user: {
              id: 1,
              email: 'test@example.com',
              name: 'Test User',
              // ... 기타 필요한 유저 정보
            },
          };
          // AsyncStorage에 목업 토큰 저장 (실제 로직과 유사하게)
          await AsyncStorage.setItem('accessToken', mockUserData.accessToken);
          await AsyncStorage.setItem('refreshToken', mockUserData.refreshToken);
          return { data: mockUserData };
        } else {
          return { error: { status: 401, data: 'Invalid credentials' } };
        }
      },
      invalidatesTags: [{ type: 'User', id: 'LIST' }, { type: 'Auth', id: 'ME' }], // 로그인 성공 시 User 목록 및 내 정보 캐시 무효화
    }),

    // 회원가입 엔드포인트 (목업 데이터 사용)
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      queryFn: async (userInfo) => {
        console.log('Mock register attempt with:', userInfo);
        // 실제 API 호출 대신 목업 데이터 반환
        await new Promise(resolve => setTimeout(resolve, 1000)); // 네트워크 지연 시뮬레이션

        // 간단한 성공 시나리오 (실제로는 이메일 중복 체크 등 필요)
        const mockResponse: RegisterResponse = {
          success: true,
          message: '회원가입이 성공적으로 완료되었습니다.',
          user: {
            id: Math.floor(Math.random() * 1000) + 1, // 임의의 ID 생성
            email: userInfo.email,
            name: userInfo.name,
            // ... 기타 필요한 유저 정보 (예: gender, age 등은 요청에 따라 추가)
          }
        };
        return { data: mockResponse };
        // TODO: 실패 시나리오 (예: 이메일 중복)
        // return { error: { status: 409, data: '이미 사용 중인 이메일입니다.' } };
      },
      // 회원가입 성공 시 특별히 무효화할 태그가 없을 수도 있지만, 필요에 따라 추가
      // 예: 사용자가 바로 로그인되거나 사용자 목록에 영향을 준다면
      // invalidatesTags: [{ type: 'User', id: 'LIST' }], 
    }),

    // 로그아웃 엔드포인트 (목업)
    logout: builder.mutation<LogoutResponse, void>({
      queryFn: async () => {
        console.log('Mock logout attempt');
        // AsyncStorage에서 토큰 삭제
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
        await new Promise(resolve => setTimeout(resolve, 500)); // 약간의 지연 시뮬레이션
        return { data: { success: true, message: '로그아웃 되었습니다.' } };
      },
      // 로그아웃 성공 시 인증 상태 및 사용자 정보 캐시 무효화
      invalidatesTags: [{ type: 'Auth', id: 'ME' }, { type: 'User', id: 'LIST' }], 
    }),

    // 토큰 갱신 엔드포인트 (목업)
    refreshToken: builder.mutation<RefreshTokenResponse, void>({
      queryFn: async () => {
        console.log('Mock refreshToken attempt');
        const currentRefreshToken = await AsyncStorage.getItem('refreshToken');

        if (!currentRefreshToken) {
          return { error: { status: 401, data: 'No refresh token available' } };
        }

        // 실제 API 호출 대신 목업 새 액세스 토큰 발급
        await new Promise(resolve => setTimeout(resolve, 500)); // 네트워크 지연 시뮬레이션
        const newAccessToken = `mock-new-access-token-${Date.now()}`;
        await AsyncStorage.setItem('accessToken', newAccessToken);
        
        return { data: { success: true, accessToken: newAccessToken } };
      },
      // 토큰 갱신 성공 시 인증 상태 캐시 무효화 (prepareHeaders가 새 토큰을 사용하도록)
      invalidatesTags: [{ type: 'Auth', id: 'ME' }], 
    })
  }),
});

// 로그인 요청 및 응답 타입 정의 (authService.ts 참고 또는 새로운 타입 정의)
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    name: string; // authService.ts에는 없었지만 추가
    // …필요한 유저 정보
  };
}

// 회원가입 요청 및 응답 타입 정의
interface RegisterRequest {
  email: string;
  password: string; // 실제로는 비밀번호 확인 필드도 필요할 수 있음
  name: string;
  gender?: string; // 선택적 필드로 추가 (기존 RegisterUser.tsx의 formData 참고)
  age?: string;    // 선택적 필드로 추가
  address?: string; // 선택적 필드로 추가
  phone?: string;   // 선택적 필드로 추가
}

interface RegisterResponse {
  success: boolean;
  message: string;
  user?: { // 성공 시 사용자 정보 반환 (선택적)
    id: number;
    email: string;
    name: string;
  };
}

// 로그아웃 응답 타입 정의
interface LogoutResponse {
  success: boolean;
  message: string;
}

// 토큰 갱신 응답 타입 정의
interface RefreshTokenResponse {
  success: boolean;
  accessToken: string;
}

// RTK Query는 자동으로 엔드포인트에 대한 훅을 생성합니다.
// 예: export const { useLoginMutation } = api;
// 이 훅을 컴포넌트에서 사용하여 API 요청을 보낼 수 있습니다.
export const { 
  useLoginMutation, 
  useRegisterMutation, 
  useLogoutMutation, 
  useRefreshTokenMutation 
} = api; 