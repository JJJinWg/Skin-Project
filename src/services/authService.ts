// src/utils/authService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    // 실제 네트워크 요청 대신, 임시로 성공 데이터 반환
    if (credentials.email && credentials.password) {
      const dummyToken = 'dummy-token';
      await AsyncStorage.setItem('accessToken', dummyToken);
      return { token: dummyToken };
    } else {
      throw new Error('Login failed');
    }
  },

  async register(data: RegisterData) {
    try {
      // TODO: 실제 API 엔드포인트로 변경
      const response = await fetch('http://your-api-endpoint/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  async logout() {
    try {
      await AsyncStorage.removeItem('accessToken');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  // 4) 토큰 갱신 (필요 시 구현)
  refreshToken: async (): Promise<void> => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) throw new Error('No access token');
    // TODO: 실제 API 엔드포인트로 변경
    const response = await fetch('http://your-api-endpoint/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    await AsyncStorage.setItem('accessToken', data.accessToken);
  },
};
