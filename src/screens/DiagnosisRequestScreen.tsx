import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { type NavigationProp, useNavigation, type RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation';
import LinearGradient from 'react-native-linear-gradient';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { diagnosisService } from '../services/diagnosisService';

type DiagnosisRequestScreenProps = {
  route: RouteProp<RootStackParamList, 'DiagnosisRequestScreen'>;
};

type ImageType = {
  uri: string
  type: string
  name: string
}

const DiagnosisRequestScreen = ({ route }: DiagnosisRequestScreenProps) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { prefilledData } = route.params || {};

  // 폼 상태
  const [formData, setFormData] = useState({
    symptoms: prefilledData?.symptoms || '',
    duration: '',
    severity: 'moderate' as 'mild' | 'moderate' | 'severe',
    previousTreatment: '',
    allergies: '',
    medications: '',
    medicalHistory: '',
    additionalNotes: '',
    images: [] as ImageType[],
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.symptoms.trim()) {
      Alert.alert('오류', '증상을 입력해주세요.');
      return false;
    }
    return true;
  };

  const submitDiagnosisRequest = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const requestData = {
        symptoms: formData.symptoms,
        duration: formData.duration,
        severity: formData.severity,
        previousTreatment: formData.previousTreatment,
        allergies: formData.allergies,
        medications: formData.medications,
        medicalHistory: formData.medicalHistory,
        additionalNotes: formData.additionalNotes,
        images: formData.images,
      };

      // diagnosisService를 사용하여 제출 (기존 진료요청서와 동일)
      const result = await diagnosisService.submitDiagnosisRequest(requestData);

      if (result.success) {
        Alert.alert(
          '저장 완료',
          `${result.message} ${result.requestId ? `요청서 번호: ${result.requestId}` : ''}`,
          [
            {
              text: '확인',
              onPress: () => {
                // 홈 화면으로 이동하고 스택을 리셋하여 뒤로가기 방지
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                });
              }
            }
          ]
        );
      } else {
        Alert.alert('오류', result.message);
      }
    } catch (error) {
      console.error('진료 요청서 제출 실패:', error);
      Alert.alert('오류', '진료 요청서 제출에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const SeveritySelector = () => (
    <View style={styles.severityContainer}>
      <Text style={styles.fieldLabel}>심각도</Text>
      <View style={styles.severityButtons}>
        {[
          { key: 'mild', label: '경미함' },
          { key: 'moderate', label: '보통' },
          { key: 'severe', label: '심각함' }
        ].map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.severityButton,
              formData.severity === item.key && styles.severityButtonActive
            ]}
            onPress={() => handleInputChange('severity', item.key)}
          >
            <Text style={[
              styles.severityButtonText,
              formData.severity === item.key && styles.severityButtonTextActive
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const handleAddPhoto = () => {
    Alert.alert(
      "사진 추가",
      "사진을 어떻게 추가하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        { text: "카메라", onPress: () => openCamera() },
        { text: "갤러리", onPress: () => openGallery() },
      ]
    );
  };

  // 카메라 열기
  const openCamera = () => {
    launchCamera(
      {
        mediaType: "photo",
        includeBase64: false,
        maxHeight: 1200,
        maxWidth: 1200,
        quality: 0.8,
      },
      (response) => {
        if (response.didCancel || response.errorCode) return;
        
        if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];
          if (asset.uri && asset.type && asset.fileName) {
            const newImage: ImageType = {
              uri: asset.uri,
              type: asset.type,
              name: asset.fileName,
            };
            setFormData(prev => ({
              ...prev,
              images: [...prev.images, newImage]
            }));
          }
        }
      }
    );
  };

  // 갤러리 열기
  const openGallery = () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        includeBase64: false,
        maxHeight: 1200,
        maxWidth: 1200,
        quality: 0.8,
        selectionLimit: 5 - formData.images.length, // 최대 5장까지
      },
      (response) => {
        if (response.didCancel || response.errorCode) return;
        
        if (response.assets && response.assets.length > 0) {
          const newImages: ImageType[] = response.assets
            .filter(asset => asset.uri && asset.type && asset.fileName)
            .map(asset => ({
              uri: asset.uri!,
              type: asset.type!,
              name: asset.fileName!,
            }));
          
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...newImages]
          }));
        }
      }
    );
  };

  const handleRemovePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.placeholder} />
        <Text style={styles.headerTitle}>진료 요청서 작성</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* AI 분석 결과 표시 (AI에서 연동된 경우만) */}
        {prefilledData?.aiAnalysisResult && (
          <View style={styles.aiResultCard}>
            <Text style={styles.cardTitle}>🤖 AI 분석 결과</Text>
            <View style={styles.aiResultItem}>
              <Text style={styles.aiResultLabel}>피부 타입:</Text>
              <Text style={styles.aiResultValue}>{prefilledData.aiAnalysisResult.skinType}</Text>
            </View>
            {prefilledData.aiAnalysisResult.skinDisease && (
              <View style={styles.aiResultItem}>
                <Text style={styles.aiResultLabel}>피부 질환:</Text>
                <Text style={styles.aiResultValue}>{prefilledData.aiAnalysisResult.skinDisease}</Text>
              </View>
            )}
            {prefilledData.aiAnalysisResult.skinState && (
              <View style={styles.aiResultItem}>
                <Text style={styles.aiResultLabel}>피부 상태:</Text>
                <Text style={styles.aiResultValue}>{prefilledData.aiAnalysisResult.skinState}</Text>
              </View>
            )}
          </View>
        )}

        {/* 진료 요청서 작성 안내 (AI 연동이 아닌 경우) */}
        {!prefilledData?.aiAnalysisResult && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>📋 진료 요청서 작성</Text>
            <Text style={styles.infoText}>
              정확한 진단을 위해 증상과 관련 정보를 자세히 작성해주
              세요. 의료진이 정보 후 적절한 치료 방향을 제시해드릴
              니다.
            </Text>
          </View>
        )}

        {/* 주요 증상 */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>주요 증상 *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="현재 겪고 있는 증상을 자세히 설명해주세요"
            value={formData.symptoms}
            onChangeText={(value) => handleInputChange('symptoms', value)}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* 증상 지속 기간 */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>증상 지속 기간 *</Text>
          <TextInput
            style={styles.textInputSingle}
            placeholder="예: 3일 전부터, 1주일, 한 달 이상"
            value={formData.duration}
            onChangeText={(value) => handleInputChange('duration', value)}
          />
        </View>

        {/* 심각도 선택 */}
        <SeveritySelector />

        {/* 이전 치료 경험 */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>이전 치료 경험</Text>
          <TextInput
            style={styles.textInput}
            placeholder="이전에 받은 치료나 사용한 약물이 있다면 설명해주세요"
            value={formData.previousTreatment}
            onChangeText={(value) => handleInputChange('previousTreatment', value)}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* 알레르기 정보 */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>알레르기</Text>
          <TextInput
            style={styles.textInputSingle}
            placeholder="알려진 알레르기가 있다면 입력해주세요"
            value={formData.allergies}
            onChangeText={(value) => handleInputChange('allergies', value)}
          />
        </View>

        {/* 복용 약물 */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>복용 중인 약물</Text>
          <TextInput
            style={styles.textInputSingle}
            placeholder="현재 복용 중인 약물이 있다면 입력해주세요"
            value={formData.medications}
            onChangeText={(value) => handleInputChange('medications', value)}
          />
        </View>

        {/* 과거 병력 */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>과거 병력</Text>
          <TextInput
            style={styles.textInput}
            placeholder="관련된 과거 병력이나 수술 경험을 입력해주세요"
            value={formData.medicalHistory}
            onChangeText={(value) => handleInputChange('medicalHistory', value)}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* 추가 메모 */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>추가 설명</Text>
          <TextInput
            style={styles.textInput}
            placeholder="의사에게 전달하고 싶은 추가 정보를 입력해주세요"
            value={formData.additionalNotes}
            onChangeText={(value) => handleInputChange('additionalNotes', value)}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* 사진 첨부 (추후 구현) */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>사진 첨부 (선택사항)</Text>
          <TouchableOpacity style={styles.photoUploadContainer} onPress={handleAddPhoto}>
            <View style={styles.photoUploadPlaceholder}>
              <Text style={styles.photoUploadIcon}>📷</Text>
              <Text style={styles.photoUploadText}>사진 추가</Text>
              <Text style={styles.photoUploadSubtext}>
                증상 부위의 사진을 첨부하면 더 정확한 진단에 도움이 됩니다.
              </Text>
            </View>
          </TouchableOpacity>
          
          {/* 첨부된 사진들 표시 */}
          {formData.images.length > 0 && (
            <View style={styles.attachedPhotosContainer}>
              <Text style={styles.attachedPhotosTitle}>첨부된 사진 ({formData.images.length}장)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScrollView}>
                {formData.images.map((image, index) => (
                  <View key={index} style={styles.photoContainer}>
                    <Image source={{ uri: image.uri }} style={styles.attachedPhoto} />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => handleRemovePhoto(index)}
                    >
                      <Text style={styles.removePhotoText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* 제출 버튼 */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={submitDiagnosisRequest}
          disabled={loading}
        >
          <LinearGradient
            colors={['#FF9A9E', '#FAD0C4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitButtonGradient}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>진료 요청서 제출</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* 안내 메시지 */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📝 안내사항</Text>
          <Text style={styles.infoText}>
            • 제출된 요청서는 의료진이 검토한 후 연락드립니다.{'\n'}
            • 응급상황인 경우 즉시 응급실을 방문해주세요.{'\n'}
            • 모든 정보는 의료법에 따라 안전하게 보호됩니다.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  placeholder: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  aiResultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
  },
  aiResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiResultLabel: {
    fontSize: 14,
    color: '#6C757D',
    flex: 1,
  },
  aiResultValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    flex: 1,
    textAlign: 'right',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#212529',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  textInputSingle: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#212529',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    height: 48,
  },
  severityContainer: {
    marginBottom: 20,
  },
  severityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  severityButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    alignItems: 'center',
  },
  severityButtonActive: {
    backgroundColor: '#FF9A9E',
    borderColor: '#FF9A9E',
  },
  severityButtonText: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },
  severityButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 20,
    marginBottom: 20,
  },
  submitButtonGradient: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#17A2B8',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#6C757D',
    lineHeight: 18,
  },
  photoUploadContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  photoUploadPlaceholder: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderStyle: 'dashed',
    backgroundColor: '#F8F9FA',
  },
  photoUploadIcon: {
    fontSize: 32,
    color: '#6C757D',
    marginBottom: 8,
  },
  photoUploadText: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  photoUploadSubtext: {
    fontSize: 12,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 16,
  },
  attachedPhotosContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  attachedPhotosTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
  },
  photosScrollView: {
    flexDirection: 'row',
  },
  photoContainer: {
    marginRight: 12,
  },
  attachedPhoto: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  removePhotoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default DiagnosisRequestScreen; 