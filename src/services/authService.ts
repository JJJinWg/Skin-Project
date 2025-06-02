// 사용자 인증 및 상태 관리 서비스
import { medicalApi } from './apiClient';

export interface User {
  id: number;
  email: string;
  name: string;
  phone: string;
  profileImage?: string;
  createdAt: string;
}

interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token?: string;
  };
  message?: string;
}

class AuthService {
  private currentUser: User | null = null;
  private isAuthenticated: boolean = false;

  // 현재 사용자 정보 가져오기
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // 현재 사용자 ID 가져오기 (하드코딩 대신 사용)
  getCurrentUserId(): number {
    if (this.currentUser) {
      return this.currentUser.id;
    }
    
    // 개발 환경에서는 기본 사용자 ID 반환
    if (__DEV__) {
      console.warn('⚠️ 개발 환경: 기본 사용자 ID(1) 사용 중');
      return 1;
    }
    
    throw new Error('사용자가 로그인되지 않았습니다.');
  }

  // 인증 상태 확인
  isLoggedIn(): boolean {
    return this.isAuthenticated && this.currentUser !== null;
  }

  // 로그인
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; message: string }> {
    try {
      console.log('🔐 로그인 시도:', email);
      
      // 실제 API 호출
      const response = await medicalApi.login({ email, password }) as AuthResponse;
      
      if (response.success && response.data) {
        this.currentUser = response.data.user;
        this.isAuthenticated = true;
        
        // 토큰 저장 (실제로는 SecureStore 사용)
        if (response.data.token) {
          await this.saveToken(response.data.token);
        }
        
        console.log('✅ 로그인 성공:', this.currentUser?.name);
        return { success: true, user: this.currentUser || undefined, message: '로그인 성공' };
      }
      
      return { success: false, message: '로그인 실패' };
    } catch (error) {
      console.error('❌ 로그인 실패:', error);
      
      // 개발 환경에서는 더미 사용자로 로그인
      if (__DEV__) {
        console.log('📋 개발 환경: 더미 사용자로 로그인');
        this.currentUser = {
          id: 1,
          email: email,
          name: '테스트 사용자',
          phone: '010-1234-5678',
          profileImage: undefined,
          createdAt: new Date().toISOString()
        };
        this.isAuthenticated = true;
        return { success: true, user: this.currentUser, message: '개발 환경 로그인 성공' };
      }
      
      return { success: false, message: '로그인 중 오류가 발생했습니다.' };
    }
  }

  // 로그아웃
  async logout(): Promise<void> {
    try {
      // 서버에 로그아웃 요청
      await medicalApi.logout();
    } catch (error) {
      console.error('로그아웃 API 호출 실패:', error);
    } finally {
      // 로컬 상태 초기화
      this.currentUser = null;
      this.isAuthenticated = false;
      await this.removeToken();
      console.log('🚪 로그아웃 완료');
    }
  }

  // 회원가입
  async register(userData: {
    email: string;
    password: string;
    name: string;
    phone: string;
  }): Promise<{ success: boolean; user?: User; message: string }> {
    try {
      console.log('📝 회원가입 시도:', userData.email);
      
      const response = await medicalApi.register(userData) as AuthResponse;
      
      if (response.success && response.data) {
        console.log('✅ 회원가입 성공');
        return { success: true, user: response.data.user, message: '회원가입 성공' };
      }
      
      return { success: false, message: '회원가입 실패' };
    } catch (error) {
      console.error('❌ 회원가입 실패:', error);
      return { success: false, message: '회원가입 중 오류가 발생했습니다.' };
    }
  }

  // 토큰 저장
  private async saveToken(token: string): Promise<void> {
    try {
      // 실제로는 react-native-keychain 또는 @react-native-async-storage/async-storage 사용
      // await AsyncStorage.setItem('auth_token', token);
      console.log('💾 토큰 저장됨');
    } catch (error) {
      console.error('토큰 저장 실패:', error);
    }
  }

  // 토큰 제거
  private async removeToken(): Promise<void> {
    try {
      // await AsyncStorage.removeItem('auth_token');
      console.log('🗑️ 토큰 제거됨');
    } catch (error) {
      console.error('토큰 제거 실패:', error);
    }
  }

  // 저장된 토큰으로 자동 로그인
  async autoLogin(): Promise<boolean> {
    try {
      // const token = await AsyncStorage.getItem('auth_token');
      // if (!token) return false;
      
      // const response = await medicalApi.verifyToken(token);
      // if (response.success && response.data) {
      //   this.currentUser = response.data.user;
      //   this.isAuthenticated = true;
      //   return true;
      // }
      
      return false;
    } catch (error) {
      console.error('자동 로그인 실패:', error);
      return false;
    }
  }
}

// 싱글톤 인스턴스
export const authService = new AuthService(); 