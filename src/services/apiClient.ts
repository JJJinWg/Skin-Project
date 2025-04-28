// src/utils/apiClient.ts

import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://your-backend.example.com/api'; // TODO: 실제 백엔드 URL로 교체

// 1) Axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,             // 타임아웃 10초
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2) 요청 인터셉터: JWT가 저장되어 있으면 Authorization 헤더에 붙이기
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 3) 응답 인터셉터: 에러 핸들링 공통 로직 (예: 토큰 만료 시 리프레시 등)
// apiClient.ts 중간 발췌
apiClient.interceptors.response.use(
    response => response,
    async error => {
      if (error.response?.status === 401) {
        // 1) 리프레시 토큰 요청
        await authService.refreshToken();
        // 2) 원래 요청의 Authorization 헤더 갱신
        const config = error.config;
        const newToken = await AsyncStorage.getItem('accessToken');
        if (newToken) config.headers.Authorization = `Bearer ${newToken}`;
        // 3) 실패했던 요청 재실행
        return axios.request(config);
      }
      // 다른 에러는 그대로 던져서 개별 화면에서 catch
      return Promise.reject(error);
    }
  );
  
export default apiClient;
