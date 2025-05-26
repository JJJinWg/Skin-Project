// 사용자 정보 관리 서비스

import AsyncStorage from '@react-native-async-storage/async-storage'

export interface UserInfo {
  id: number
  name: string
  email: string
  phone: string
  birthdate: string
  profileImage: any
}

// 더미 사용자 데이터 (실제 API 연동 시 제거)
const dummyUser: UserInfo = {
  id: 1,
  name: "홍길동",
  email: "hong@example.com",
  phone: "010-1234-5678",
  birthdate: "1990-01-01",
  profileImage: require("../assets/doctor1.png"),
}

export const userService = {
  // 현재 사용자 정보 조회
  getCurrentUser: async (): Promise<UserInfo> => {
    try {
      // 실제 API 연동 시:
      // const response = await fetch('/api/user/profile', {
      //   headers: { Authorization: `Bearer ${token}` }
      // })
      // return await response.json()
      
      // 임시로 AsyncStorage에서 사용자 정보 조회
      const storedUser = await AsyncStorage.getItem('currentUser')
      if (storedUser) {
        return JSON.parse(storedUser)
      }
      
      // 기본 사용자 정보 반환
      return dummyUser
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error)
      return dummyUser
    }
  },

  // 사용자 정보 업데이트
  updateUser: async (userInfo: UserInfo): Promise<{ success: boolean; message: string }> => {
    try {
      // 실제 API 연동 시:
      // const response = await fetch('/api/user/profile', {
      //   method: 'PUT',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${token}` 
      //   },
      //   body: JSON.stringify(userInfo)
      // })
      // return await response.json()
      
      // 임시로 AsyncStorage에 저장
      await AsyncStorage.setItem('currentUser', JSON.stringify(userInfo))
      
      return {
        success: true,
        message: '사용자 정보가 성공적으로 업데이트되었습니다.'
      }
    } catch (error) {
      console.error('사용자 정보 업데이트 실패:', error)
      return {
        success: false,
        message: '사용자 정보 업데이트에 실패했습니다.'
      }
    }
  },

  // 프로필 이미지 업데이트
  updateProfileImage: async (imageUri: string): Promise<{ success: boolean; message: string }> => {
    try {
      // 실제 API 연동 시:
      // const formData = new FormData()
      // formData.append('profileImage', {
      //   uri: imageUri,
      //   type: 'image/jpeg',
      //   name: 'profile.jpg'
      // })
      // const response = await fetch('/api/user/profile-image', {
      //   method: 'POST',
      //   headers: { Authorization: `Bearer ${token}` },
      //   body: formData
      // })
      // return await response.json()
      
      // 현재 사용자 정보 가져오기
      const currentUser = await userService.getCurrentUser()
      
      // 프로필 이미지 업데이트
      const updatedUser = {
        ...currentUser,
        profileImage: { uri: imageUri }
      }
      
      await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser))
      
      return {
        success: true,
        message: '프로필 이미지가 성공적으로 업데이트되었습니다.'
      }
    } catch (error) {
      console.error('프로필 이미지 업데이트 실패:', error)
      return {
        success: false,
        message: '프로필 이미지 업데이트에 실패했습니다.'
      }
    }
  }
} 