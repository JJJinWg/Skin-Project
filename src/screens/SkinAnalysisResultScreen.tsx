//AI 피부 분석 결과 화면

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { type NavigationProp, useNavigation, type RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation';
import LinearGradient from 'react-native-linear-gradient';
import { productService } from '../services/productService';

type SkinAnalysisResultScreenProps = {
  route: RouteProp<RootStackParamList, 'SkinAnalysisResultScreen'>;
};

const SkinAnalysisResultScreen = ({ route }: SkinAnalysisResultScreenProps) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { imageUri, analysisResult } = route.params;

  // 영어 상태를 한국어로 매핑하는 함수 (SkinHistoryScreen과 동일)
  const translateSkinType = (englishType: string): string => {
    const typeMap: { [key: string]: string } = {
      'oily': '지성',
      'dry': '건성', 
      'combination': '복합성',
      'sensitive': '민감성',
      'normal': '정상',
      'lesion': '병변', // 질환이 있는 경우
      'mixed': '복합성',
      'dehydrated': '수분부족',
      // 기타 상태들도 추가 가능
    };
    return typeMap[englishType.toLowerCase()] || englishType;
  };

  const translateConcern = (englishConcern: string): string => {
    const concernMap: { [key: string]: string } = {
      'acne': '여드름',
      'pores': '모공',
      'lesion': '병변',
      'wrinkles': '주름',
      'pigmentation': '색소침착',
      'dryness': '건조함',
      'oiliness': '유분',
      'sensitivity': '민감성',
      'redness': '홍조',
      'blackheads': '블랙헤드',
      'whiteheads': '화이트헤드',
      'wrinkle': '주름',
      'inflammation': '염증',
      'roughness': '거칠음',
      // 추가 고민사항들...
    };
    return concernMap[englishConcern.toLowerCase()] || englishConcern;
  };

  // 피부 상태를 한국어로 번역하는 함수 추가
  const translateSkinState = (englishState: string): string => {
    const stateMap: { [key: string]: string } = {
      'lesion': '병변',
      'wrinkle': '주름',
      'lip_dryness': '입술 건조',
      'chin_sagging': '턱 처짐',
      'normal': '정상',
      'healthy': '건강함',
      'problematic': '문제있음',
      'good': '양호',
      'fair': '보통',
      'poor': '나쁨',
      'excellent': '우수',
    };
    return stateMap[englishState.toLowerCase()] || englishState;
  };

  // 피부 질환을 한국어로 번역하는 함수 추가
  const translateSkinDisease = (englishDisease: string): string => {
    const diseaseMap: { [key: string]: string } = {
      'acne': '여드름',
      'dermatitis': '피부염',
      'eczema': '습진',
      'psoriasis': '건선',
      'rosacea': '주사',
      'melasma': '기미',
      'hyperpigmentation': '과색소침착',
      'age spots': '노인성 반점',
      'sun damage': '광노화',
      'seborrheic dermatitis': '지루성 피부염',
      'contact dermatitis': '접촉성 피부염',
      'keratosis': '각화증',
      'folliculitis': '모낭염',
      'cellulitis': '봉와직염',
      'hives': '두드러기',
      'warts': '사마귀',
      'moles': '점',
      'skin cancer': '피부암',
      'basal cell carcinoma': '기저세포암',
      'melanoma': '흑색종',
      'squamous cell carcinoma': '편평세포암',
      'normal': '정상',
      'healthy': '건강함',
      'no disease detected': '질환 없음',
      'inflammatory': '염증성',
      'lesion': '병변',
      'benign': '양성',
      'malignant': '악성',
    };
    return diseaseMap[englishDisease.toLowerCase()] || englishDisease;
  };

  // 분석 결과를 한국어로 번역 (SkinHistoryScreen과 동일한 로직)
  const translatedSkinType = translateSkinType(analysisResult?.skinType || '');
  const translatedSkinDisease = translateSkinDisease(analysisResult?.skinDisease || '');
  const translatedSkinState = translateSkinState(analysisResult?.skinState || '');

  // 진료 요청서 작성하기
  const handleCreateDiagnosisRequest = () => {
    if (analysisResult?.needsMedicalAttention) {
      Alert.alert(
        '진료 요청서 작성',
        'AI 분석 결과를 바탕으로 진료 요청서를 작성하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          { 
            text: '작성하기', 
            onPress: () => {
              // 증상 설명 생성 (번역된 값 사용)
              const symptomParts = [];
              if (translatedSkinDisease && translatedSkinDisease !== '알 수 없음') {
                symptomParts.push(`피부 질환: ${translatedSkinDisease}`);
              }
              if (translatedSkinState && translatedSkinState !== '알 수 없음') {
                symptomParts.push(`피부 상태: ${translatedSkinState}`);
              }
              
              const symptomsText = symptomParts.length > 0 
                ? symptomParts.join(', ') 
                : 'AI 분석을 통해 피부 문제가 감지되어 전문의 상담이 필요합니다.';

              // 분석 결과를 진료 요청서 화면으로 전달 (번역된 값 사용)
              navigation.navigate('DiagnosisRequestScreen', {
                prefilledData: {
                  symptoms: symptomsText,
                  skinType: translatedSkinType,
                  aiAnalysisResult: {
                    skinType: translatedSkinType,
                    skinDisease: translatedSkinDisease,
                    skinState: translatedSkinState,
                    needsMedicalAttention: analysisResult.needsMedicalAttention,
                    confidence: analysisResult.confidence,
                    detailedAnalysis: analysisResult.detailedAnalysis,
                  },
                  imageUri: imageUri,
                }
              });
            }
          }
        ]
      );
    } else {
      Alert.alert('알림', '현재 피부 상태가 양호하여 즉시 진료가 필요하지 않습니다.');
    }
  };

  // AI 화장품 추천 받기
  const handleCosmeticRecommendation = () => {
    Alert.alert(
      'AI 화장품 추천',
      '현재 피부 분석 결과를 바탕으로 맞춤형 화장품을 추천받으시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '추천받기', 
          onPress: () => {
            // 피부 민감도 설정 (기본값: 보통)
            let sensitivity = '보통';
            if (translatedSkinType === '민감성') {
              sensitivity = '높음';
            } else if (translatedSkinType === '건성') {
              sensitivity = '보통';
            } else if (translatedSkinType === '지성') {
              sensitivity = '낮음';
            }

            // AI 분석 결과를 피부 고민으로 매핑 (번역된 값 사용)
            const mappedConcerns = productService.mapAiResultToConcerns({
              ...analysisResult,
              skinType: translatedSkinType,
              skinDisease: translatedSkinDisease,
              skinState: translatedSkinState
            });
            console.log('🔬 AI 분석 결과 매핑:', {
              skinDisease: translatedSkinDisease,
              skinState: translatedSkinState,
              mappedConcerns: mappedConcerns
            });

            // 추가 정보: AI 추천사항을 모두 포함
            const additionalInfo = analysisResult?.recommendations && Array.isArray(analysisResult.recommendations) 
              ? analysisResult.recommendations.join('\n• ')
              : '피부 건강을 위한 전문적인 관리가 필요합니다.';

            // 화장품 추천 화면으로 이동하며 번역된 분석 결과 전달
            navigation.navigate('FindCosmeticsScreen', {
              prefilledData: {
                skinType: translatedSkinType || '정상',
                sensitivity: sensitivity,
                concerns: mappedConcerns, // AI 분석 결과에서 매핑된 피부 고민들
                additionalInfo: `• ${additionalInfo}`,
                fromAnalysis: true, // 분석 결과에서 온 것임을 표시
              }
            });
          }
        }
      ]
    );
  };

  // 신뢰도에 따른 색상 결정
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#28A745'; // 초록
    if (confidence >= 0.6) return '#FFC107'; // 노랑
    return '#DC3545'; // 빨강
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.placeholder} />
        <Text style={styles.headerTitle}>분석 결과</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* 분석한 이미지 */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.analyzedImage} />
        </View>

        {/* 분석 결과 요약 */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>AI 분석 결과</Text>
          
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>피부 타입:</Text>
            <Text style={styles.resultValue}>{translatedSkinType}</Text>
            {analysisResult?.confidence?.skinType && (
              <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(analysisResult.confidence.skinType) }]}>
                <Text style={styles.confidenceText}>
                  {Math.round(analysisResult.confidence.skinType * 100)}%
                </Text>
              </View>
            )}
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>피부 질환:</Text>
            <Text style={styles.resultValue}>{translatedSkinDisease}</Text>
            {analysisResult?.confidence?.disease && (
              <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(analysisResult.confidence.disease) }]}>
                <Text style={styles.confidenceText}>
                  {Math.round(analysisResult.confidence.disease * 100)}%
                </Text>
              </View>
            )}
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>피부 상태:</Text>
            <Text style={styles.resultValue}>{translatedSkinState}</Text>
            {analysisResult?.confidence?.state && (
              <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(analysisResult.confidence.state) }]}>
                <Text style={styles.confidenceText}>
                  {Math.round(analysisResult.confidence.state * 100)}%
                </Text>
              </View>
            )}
          </View>

          {/* 의료진 상담 필요 여부 */}
          {analysisResult?.needsMedicalAttention && (
            <View style={styles.medicalAttentionCard}>
              <Text style={styles.medicalAttentionIcon}>⚠️</Text>
              <Text style={styles.medicalAttentionText}>피부과 전문의 상담을 권장합니다</Text>
            </View>
          )}
        </View>

        {/* 추천사항 */}
        <View style={styles.recommendationsCard}>
          <Text style={styles.cardTitle}>AI 추천사항</Text>
          {analysisResult?.recommendations && Array.isArray(analysisResult.recommendations) && analysisResult.recommendations.length > 0 ? (
            analysisResult.recommendations.map((recommendation, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Text style={styles.recommendationBullet}>•</Text>
                <Text style={styles.recommendationText}>{recommendation}</Text>
              </View>
            ))
          ) : (
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationBullet}>•</Text>
              <Text style={styles.recommendationText}>피부 건강을 위한 상담을 받으시기 바랍니다</Text>
            </View>
          )}
        </View>

        {/* 주의사항 */}
        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>⚠️ 주의사항</Text>
          <Text style={styles.disclaimerText}>
            이 결과는 AI 분석을 통한 참고용 정보입니다. 정확한 진단을 위해서는 반드시 피부과 전문의와 상담하시기 바랍니다.
          </Text>
        </View>

        {/* 버튼 영역 */}
        <View style={styles.buttonContainer}>
          {analysisResult?.needsMedicalAttention ? (
            // 의료진 상담이 필요한 경우
            <>
              {/* 진료 요청서 작성 버튼 */}
              <TouchableOpacity
                style={styles.diagnosisRequestButton}
                onPress={handleCreateDiagnosisRequest}
              >
                <LinearGradient
                  colors={['#FF9A9E', '#FAD0C4']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.diagnosisRequestButtonGradient}
                >
                  <Text style={styles.diagnosisRequestButtonText}>진료 요청서 작성</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* AI 화장품 추천 받기 버튼 */}
              <TouchableOpacity
                style={styles.cosmeticRecommendationButton}
                onPress={handleCosmeticRecommendation}
              >
                <LinearGradient
                  colors={['#84FAB0', '#8FD3F4']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.cosmeticRecommendationButtonGradient}
                >
                  <Text style={styles.cosmeticRecommendationButtonText}>AI 화장품 추천 받기</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* 확인 버튼 (홈으로 이동) */}
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => navigation.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                })}
              >
                <LinearGradient
                  colors={['#4CAF50', '#81C784']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.confirmButtonGradient}
                >
                  <Text style={styles.confirmButtonText}>확인</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* 다시 분석하기 버튼 */}
              <TouchableOpacity
                style={styles.reanalyzeButton}
                onPress={() => navigation.navigate('SkinDiagnosisScreen')}
              >
                <Text style={styles.reanalyzeButtonText}>다시 분석하기</Text>
              </TouchableOpacity>
            </>
          ) : (
            // 피부 상태가 정상인 경우
            <>
              {/* AI 화장품 추천 받기 버튼 */}
              <TouchableOpacity
                style={styles.cosmeticRecommendationButton}
                onPress={handleCosmeticRecommendation}
              >
                <LinearGradient
                  colors={['#84FAB0', '#8FD3F4']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.cosmeticRecommendationButtonGradient}
                >
                  <Text style={styles.cosmeticRecommendationButtonText}>AI 화장품 추천 받기</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* 확인 버튼 (홈으로 이동) */}
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => navigation.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                })}
              >
                <LinearGradient
                  colors={['#4CAF50', '#81C784']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.confirmButtonGradient}
                >
                  <Text style={styles.confirmButtonText}>확인</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* 다시 분석하기 버튼 */}
              <TouchableOpacity
                style={styles.reanalyzeButton}
                onPress={() => navigation.navigate('SkinDiagnosisScreen')}
              >
                <Text style={styles.reanalyzeButtonText}>다시 분석하기</Text>
              </TouchableOpacity>
            </>
          )}
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
  },
  imageContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  analyzedImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 15,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 14,
    color: '#6C757D',
    width: 80,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    flex: 1,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  medicalAttentionCard: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  medicalAttentionIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  medicalAttentionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    flex: 1,
  },
  recommendationsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 15,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  recommendationBullet: {
    fontSize: 16,
    color: '#FF9A9E',
    marginRight: 10,
    marginTop: 2,
  },
  recommendationText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    flex: 1,
  },
  disclaimerCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#6C757D',
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#6C757D',
    lineHeight: 18,
  },
  buttonContainer: {
    marginBottom: 30,
  },
  diagnosisRequestButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
  },
  diagnosisRequestButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  diagnosisRequestButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cosmeticRecommendationButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
  },
  cosmeticRecommendationButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  cosmeticRecommendationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reanalyzeButton: {
    backgroundColor: '#F1F3F5',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  reanalyzeButtonText: {
    color: '#6C757D',
    fontSize: 14,
    fontWeight: 'bold',
  },
  confirmButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
  },
  confirmButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SkinAnalysisResultScreen;
