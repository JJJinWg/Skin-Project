// src/utils/authService.ts

import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    // …필요한 유저 정보
  };
}

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const authService = {
  // 1) 로그인
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    // 토큰 저장
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    return data;
  },

  // 2) 회원가입
  register: async (
    email: string,
    password: string,
    name: string
  ): Promise<void> => {
    await apiClient.post('/auth/register', { email, password, name });
  },

  // 3) 로그아웃
  logout: async (): Promise<void> => {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    // optionally 서버에 로그아웃 알리기
  },

  // 4) 토큰 갱신 (필요 시 구현)
  refreshToken: async (): Promise<void> => {
    const token = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    if (!token) throw new Error('No refresh token');
    const { data } = await apiClient.post<{ accessToken: string }>('/auth/refresh', { refreshToken: token });
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
  },
};
