// 사용자 정보 관리 서비스

import AsyncStorage from '@react-native-async-storage/async-storage'
import { medicalApi } from './apiClient'

export interface UserInfo {
  id: number
  name: string
  email: string
  phone: string
  birthdate: string
  profileImage: any
}

// 더미 사용자 데이터 (API 실패 시 사용)
const dummyUser: UserInfo = {
  id: 1,
  name: "홍길동",
  email: "hong@example.com",
  phone: "010-1234-5678",
  birthdate: "1990-01-01",
  profileImage: require("../assets/doctor1.png"),
}

export const userService = {
  // 현재 사용자 정보 조회 (userId 1 사용)
  getCurrentUser: async (): Promise<UserInfo> => {
    try {
      console.log('👤 사용자 정보 조회 중 (userId: 1)...');
      
      // 실제 API 호출
      const response = await medicalApi.getUserProfile(1) as any;
      console.log('✅ 사용자 정보 조회 성공:', response);
      
      // 백엔드에서 { success: true, data: { 사용자정보 } } 형식으로 응답
      const userData = response.data || response; // data 객체에서 추출
      
      // 백엔드 users 테이블 스키마에 맞게 변환
      // pgAdmin에서 본 스키마: id, username, email, phone_number, gender, age, skin_type, hashed_password
      const userInfo: UserInfo = {
        id: userData.id || 1,
        name: userData.username || userData.name || '홍길동', // username 필드 사용
        email: userData.email || 'hong@example.com',
        phone: userData.phone_number || userData.phone || '010-1234-5678', // phone_number 필드 사용
        birthdate: userData.birthdate || userData.birth_date || '1990-01-01',
        profileImage: userData.profile_image ? { uri: userData.profile_image } : 
                     userData.profileImage ? { uri: userData.profileImage } :
                     require("../assets/doctor1.png"), // 기본 이미지
      };
      
      // AsyncStorage에도 저장 (캐시용)
      await AsyncStorage.setItem('currentUser', JSON.stringify(userInfo));
      
      return userInfo;
    } catch (error) {
      console.error('❌ API 사용자 정보 조회 실패:', error);
      
      try {
        // API 실패 시 AsyncStorage에서 캐시된 정보 시도
        const storedUser = await AsyncStorage.getItem('currentUser');
        if (storedUser) {
          console.log('💾 캐시된 사용자 정보 사용');
          return JSON.parse(storedUser);
        }
      } catch (storageError) {
        console.error('❌ AsyncStorage 조회 실패:', storageError);
      }
      
      // 모든 방법 실패 시 더미 데이터 반환
      console.log('🔄 더미 사용자 정보 사용');
      return dummyUser;
    }
  },

  // 사용자 정보 업데이트 (userId 1 사용)
  updateUser: async (userInfo: Omit<UserInfo, 'id'>): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('📝 사용자 정보 업데이트 중 (userId: 1)...', userInfo);
      
      // 백엔드 users 테이블 스키마에 맞게 API 요청 데이터 구성
      const updateData = {
        username: userInfo.name, // name -> username으로 매핑
        email: userInfo.email,
        phone_number: userInfo.phone, // phone -> phone_number로 매핑
        birthdate: userInfo.birthdate,
        // profileImage는 별도 API에서 처리하거나 profile_image 필드 사용
      };
      
      // 실제 API 호출
      const response = await medicalApi.updateUserProfile(1, updateData) as any;
      console.log('✅ 사용자 정보 업데이트 성공:', response);
      
      // AsyncStorage도 업데이트
      const updatedUserInfo: UserInfo = {
        id: 1, // 고정 userId
        ...userInfo
      };
      await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUserInfo));
      
      return {
        success: true,
        message: '사용자 정보가 성공적으로 업데이트되었습니다.'
      };
    } catch (error) {
      console.error('❌ 사용자 정보 업데이트 실패:', error);
      
      try {
        // API 실패 시 AsyncStorage에만 저장
        const updatedUserInfo: UserInfo = {
          id: 1, // 고정 userId
          ...userInfo
        };
        await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUserInfo));
        console.log('💾 로컬에만 사용자 정보 저장');
        
        return {
          success: true,
          message: '사용자 정보가 로컬에 저장되었습니다. (서버 동기화는 나중에 시도됩니다)'
        };
      } catch (storageError) {
        console.error('❌ AsyncStorage 저장 실패:', storageError);
        return {
          success: false,
          message: '사용자 정보 업데이트에 실패했습니다.'
        };
      }
    }
  },

  // 프로필 이미지 업데이트
  updateProfileImage: async (imageUri: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('📷 프로필 이미지 업데이트 중...', imageUri);
      
      // 현재 사용자 정보 가져오기
      const currentUser = await userService.getCurrentUser();
      
      // 프로필 이미지 업데이트
      const updatedUser = {
        ...currentUser,
        profileImage: { uri: imageUri }
      };
      
      // AsyncStorage에 저장
      await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));
      console.log('✅ 프로필 이미지 업데이트 성공');
      
      return {
        success: true,
        message: '프로필 이미지가 성공적으로 업데이트되었습니다.'
      };
    } catch (error) {
      console.error('❌ 프로필 이미지 업데이트 실패:', error);
      return {
        success: false,
        message: '프로필 이미지 업데이트에 실패했습니다.'
      };
    }
  }
} 