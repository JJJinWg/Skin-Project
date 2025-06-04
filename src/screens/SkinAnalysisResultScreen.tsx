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

type SkinAnalysisResultScreenProps = {
  route: RouteProp<RootStackParamList, 'SkinAnalysisResultScreen'>;
};

const SkinAnalysisResultScreen = ({ route }: SkinAnalysisResultScreenProps) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { imageUri, analysisResult } = route.params;

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
              // 증상 설명 생성 (undefined 값 제거)
              const symptomParts = [];
              if (analysisResult.skinDisease && analysisResult.skinDisease !== 'undefined') {
                symptomParts.push(`피부 질환: ${analysisResult.skinDisease}`);
              }
              if (analysisResult.skinState && analysisResult.skinState !== 'undefined') {
                symptomParts.push(`피부 상태: ${analysisResult.skinState}`);
              }
              
              const symptomsText = symptomParts.length > 0 
                ? symptomParts.join(', ') 
                : 'AI 분석을 통해 피부 문제가 감지되어 전문의 상담이 필요합니다.';

              // 분석 결과를 진료 요청서 화면으로 전달
              navigation.navigate('DiagnosisRequestScreen', {
                prefilledData: {
                  symptoms: symptomsText,
                  skinType: analysisResult.skinType,
                  aiAnalysisResult: {
                    skinType: analysisResult.skinType,
                    skinDisease: analysisResult.skinDisease,
                    skinState: analysisResult.skinState,
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
            <Text style={styles.resultValue}>{analysisResult?.skinType}</Text>
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
            <Text style={styles.resultValue}>{analysisResult?.skinDisease}</Text>
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
            <Text style={styles.resultValue}>{analysisResult?.skinState}</Text>
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
