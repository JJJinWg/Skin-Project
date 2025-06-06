// 이미지 업로드 공통 서비스
import { Alert, Platform } from 'react-native';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';

// 이미지 업로드 옵션 타입
export interface ImageUploadOptions {
  mediaType?: MediaType;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  includeBase64?: boolean;
  allowsEditing?: boolean;
}

// 이미지 선택 결과 타입
export interface ImageUploadResult {
  success: boolean;
  uri?: string;
  fileName?: string;
  type?: string;
  fileSize?: number;
  base64?: string;
  error?: string;
}

// 기본 옵션
const defaultOptions: ImageUploadOptions = {
  mediaType: 'photo',
  quality: 0.8,
  maxWidth: 1024,
  maxHeight: 1024,
  includeBase64: false,
  allowsEditing: true,
};

// 이미지 선택 방법 선택 Alert
export const showImagePickerAlert = (
  onGallery: () => void,
  onCamera: () => void,
  onCancel?: () => void
) => {
  Alert.alert(
    '이미지 선택',
    '이미지를 어떻게 선택하시겠습니까?',
    [
      {
        text: '갤러리',
        onPress: onGallery,
      },
      {
        text: '카메라',
        onPress: onCamera,
      },
      {
        text: '취소',
        style: 'cancel',
        onPress: onCancel,
      },
    ],
    { cancelable: true }
  );
};

// 갤러리에서 이미지 선택
export const pickImageFromGallery = (
  options: ImageUploadOptions = {}
): Promise<ImageUploadResult> => {
  return new Promise((resolve) => {
    const pickerOptions = { ...defaultOptions, ...options };
    
    launchImageLibrary(pickerOptions, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        resolve({ success: false, error: '사용자가 취소했습니다.' });
        return;
      }
      
      if (response.errorMessage) {
        console.error('갤러리 이미지 선택 오류:', response.errorMessage);
        resolve({ success: false, error: response.errorMessage });
        return;
      }
      
      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        resolve({
          success: true,
          uri: asset.uri,
          fileName: asset.fileName,
          type: asset.type,
          fileSize: asset.fileSize,
          base64: asset.base64,
        });
      } else {
        resolve({ success: false, error: '이미지를 선택하지 못했습니다.' });
      }
    });
  });
};

// 카메라로 이미지 촬영
export const takePhotoWithCamera = (
  options: ImageUploadOptions = {}
): Promise<ImageUploadResult> => {
  return new Promise((resolve) => {
    const pickerOptions = { ...defaultOptions, ...options };
    
    launchCamera(pickerOptions, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        resolve({ success: false, error: '사용자가 취소했습니다.' });
        return;
      }
      
      if (response.errorMessage) {
        console.error('카메라 촬영 오류:', response.errorMessage);
        resolve({ success: false, error: response.errorMessage });
        return;
      }
      
      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        resolve({
          success: true,
          uri: asset.uri,
          fileName: asset.fileName,
          type: asset.type,
          fileSize: asset.fileSize,
          base64: asset.base64,
        });
      } else {
        resolve({ success: false, error: '사진을 촬영하지 못했습니다.' });
      }
    });
  });
};

// 이미지 선택 (갤러리 또는 카메라 선택 Alert 포함)
export const selectImage = (
  options: ImageUploadOptions = {}
): Promise<ImageUploadResult> => {
  return new Promise((resolve) => {
    showImagePickerAlert(
      // 갤러리 선택
      async () => {
        const result = await pickImageFromGallery(options);
        resolve(result);
      },
      // 카메라 선택
      async () => {
        const result = await takePhotoWithCamera(options);
        resolve(result);
      },
      // 취소
      () => {
        resolve({ success: false, error: '사용자가 취소했습니다.' });
      }
    );
  });
};

// 서버에 이미지 업로드
export const uploadImageToServer = async (
  imageUri: string,
  uploadEndpoint: string = 'http://10.0.2.2:8080/api/upload/image'
): Promise<{ success: boolean; imageUrl?: string; error?: string }> => {
  try {
    console.log('📤 이미지 서버 업로드 시작...', imageUri);
    
    // FormData 생성
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: `image_${Date.now()}.jpg`,
    } as any);
    
    // 서버에 업로드
    const response = await fetch(uploadEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`서버 응답 오류: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.imageUrl) {
      console.log('✅ 이미지 업로드 성공:', result.imageUrl);
      return {
        success: true,
        imageUrl: result.imageUrl,
      };
    } else {
      throw new Error(result.message || '이미지 업로드에 실패했습니다.');
    }
  } catch (error) {
    console.error('❌ 이미지 업로드 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '이미지 업로드 중 오류가 발생했습니다.',
    };
  }
};

// 이미지 선택부터 서버 업로드까지 한번에 처리
export const selectAndUploadImage = async (
  options: ImageUploadOptions = {},
  uploadEndpoint?: string
): Promise<{ success: boolean; imageUrl?: string; error?: string }> => {
  try {
    // 1. 이미지 선택
    const selectResult = await selectImage(options);
    
    if (!selectResult.success || !selectResult.uri) {
      return {
        success: false,
        error: selectResult.error || '이미지를 선택하지 못했습니다.',
      };
    }
    
    // 2. 서버에 업로드
    const uploadResult = await uploadImageToServer(selectResult.uri, uploadEndpoint);
    
    return uploadResult;
  } catch (error) {
    console.error('❌ 이미지 선택 및 업로드 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '이미지 처리 중 오류가 발생했습니다.',
    };
  }
};

// 여러 이미지 선택 (리뷰용)
export const selectMultipleImages = async (
  maxCount: number = 5,
  options: ImageUploadOptions = {}
): Promise<ImageUploadResult[]> => {
  const results: ImageUploadResult[] = [];
  
  for (let i = 0; i < maxCount; i++) {
    const result = await selectImage(options);
    
    if (result.success) {
      results.push(result);
      
      // 더 추가할지 사용자에게 물어보기
      if (i < maxCount - 1) {
        const continueAdding = await new Promise<boolean>((resolve) => {
          Alert.alert(
            '이미지 추가',
            `${i + 1}개의 이미지를 선택했습니다.\n더 추가하시겠습니까? (최대 ${maxCount}개)`,
            [
              { text: '완료', onPress: () => resolve(false) },
              { text: '더 추가', onPress: () => resolve(true) },
            ]
          );
        });
        
        if (!continueAdding) {
          break;
        }
      }
    } else {
      break; // 사용자가 취소하거나 오류 발생 시 중단
    }
  }
  
  return results;
};

export const imageUploadService = {
  showImagePickerAlert,
  pickImageFromGallery,
  takePhotoWithCamera,
  selectImage,
  uploadImageToServer,
  selectAndUploadImage,
  selectMultipleImages,
}; 