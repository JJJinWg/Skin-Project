import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from './store';
import axios from 'axios';

// API 기본 설정
const BASE_URL = 'https://your-backend.example.com/api';

// Axios 인스턴스 생성 (토큰 갱신용)
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 토큰 갱신 함수
const refreshToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token');

    const response = await axiosInstance.post('/auth/refresh', { refreshToken });
    const { token } = response.data;
    await AsyncStorage.setItem('token', token);
    return token;
  } catch (error) {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('refreshToken');
    throw error;
  }
};

// 커스텀 baseQuery 생성
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: async (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// 토큰 갱신 로직이 포함된 baseQuery 래퍼
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    try {
      const token = await refreshToken();
      result = await baseQuery(args, api, extraOptions);
    } catch (error) {
      // 토큰 갱신 실패 시 로그아웃 처리
      api.dispatch({ type: 'auth/logout' });
    }
  }

  return result;
};

// API 정의
export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Doctor', 'Reservation', 'SkinDiagnosis', 'Product', 'Auth'],
  endpoints: (builder) => ({
    // 로그인 엔드포인트 (목업 데이터 사용)
    login: builder.mutation<{ token: string }, { email: string; password: string }>({
      queryFn: async (credentials) => {
        console.log('Mock login attempt with:', credentials);
        // 실제 API 호출 대신 목업 데이터 반환
        await new Promise(resolve => setTimeout(resolve, 1000)); // 네트워크 지연 시뮬레이션

        if (credentials.email === 'test@example.com' && credentials.password === 'password') {
          const mockToken = 'mock-access-token-12345';
          await AsyncStorage.setItem('token', mockToken);
          return { data: { token: mockToken } };
        } else {
          return { error: { status: 401, data: 'Invalid credentials' } };
        }
      },
      invalidatesTags: ['Auth'],
    }),

    // 회원가입 엔드포인트 (목업 데이터 사용)
    register: builder.mutation<{ message: string }, any>({
      queryFn: async (userInfo) => {
        console.log('Mock register attempt with:', userInfo);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockResponse = {
          message: '회원가입이 성공적으로 완료되었습니다.',
        };
        return { data: mockResponse };
      },
    }),

    // 로그아웃 엔드포인트
    logout: builder.mutation<void, void>({
      queryFn: async () => {
        console.log('Mock logout attempt');
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('refreshToken');
        await new Promise(resolve => setTimeout(resolve, 500));
        return { data: undefined };
      },
      invalidatesTags: ['Auth'],
    }),

    // 토큰 갱신 엔드포인트
    refreshToken: builder.mutation<{ token: string }, void>({
      queryFn: async () => {
        console.log('Mock refreshToken attempt');
        const currentRefreshToken = await AsyncStorage.getItem('refreshToken');

        if (!currentRefreshToken) {
          return { error: { status: 401, data: 'No refresh token available' } };
        }

        await new Promise(resolve => setTimeout(resolve, 500));
        const newToken = `mock-new-access-token-${Date.now()}`;
        await AsyncStorage.setItem('token', newToken);
        
        return { data: { token: newToken } };
      },
      invalidatesTags: ['Auth'],
    }),
  }),
});

// RTK Query 훅 내보내기
export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
} = api; 