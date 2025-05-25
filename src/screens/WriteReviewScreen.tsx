// 리뷰 작성 화면
import React, { useState, useRef } from 'react';
import { NavigationProp, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Keyboard,
  Alert,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

type WriteReviewRouteProps = RouteProp<
  { params: { productId?: number; productName?: string; productImage?: any } },
  'params'
>;

const WriteReviewScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<WriteReviewRouteProps>();
  
  // 제품 정보 (제품 상세 페이지에서 넘어온 경우)
  const productId = route.params?.productId;
  const productName = route.params?.productName || '제품을 선택해주세요';
  const productImage = route.params?.productImage;
  
  // 상태 관리
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isProductModalVisible, setProductModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 애니메이션 값
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;
  
  // 키보드 이벤트 리스너
  React.useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(translateAnim, {
            toValue: 100,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(translateAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [fadeAnim, translateAnim]);
  
  // 샘플 제품 목록 (실제로는 API에서 가져올 것) 우리는 아마 샘플로 몇개 그냥 등록하는식으로해야할거같아요.
  const sampleProducts = [
    { id: 1, name: 'Beplain 녹두 진정 토너', image: require('../assets/product1.png') },
    { id: 2, name: 'Torriden 다이브인 세럼', image: require('../assets/product2.png') },
    { id: 3, name: '아이소이 불가리안 로즈 세럼', image: require('../assets/product1.png') },
    { id: 4, name: '라운드랩 자작나무 수분 크림', image: require('../assets/product2.png') },
    { id: 5, name: '코스알엑스 스네일 무친 에센스', image: require('../assets/product1.png') },
  ];
  
  // 이미지 추가 함수 (실제로는 이미지 피커 구현 필요)
  const handleAddImage = () => {
    // 이미지 피커 로직 구현 필요
    // 여기서는 더미 이미지 추가
    if (images.length < 5) {
      setImages([...images, '../assets/product1.png']);
    } else {
      Alert.alert('알림', '이미지는 최대 5개까지 추가할 수 있습니다.');
    }
  };
  
  // 이미지 삭제 함수
  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };
  
  // 리뷰 제출 함수
  const handleSubmitReview = () => {
    if (rating === 0) {
      Alert.alert('알림', '별점을 선택해주세요.');
      return;
    }
    
    if (!reviewText.trim()) {
      Alert.alert('알림', '리뷰 내용을 입력해주세요.');
      return;
    }
    
    if (!productId) {
      Alert.alert('알림', '제품을 선택해주세요.');
      return;
    }
    
    setIsSubmitting(true);
    
    // 리뷰 제출 로직 (API 호출 등)
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        '리뷰가 등록되었습니다',
        '소중한 리뷰를 작성해주셔서 감사합니다.',
        [
          { 
            text: '확인', 
            onPress: () => navigation.goBack() 
          }
        ]
      );
    }, 1500);
  };
  
  // 제품 선택 함수
  const handleSelectProduct = (product: any) => {
    // 실제로는 navigation.setParams 또는 상태 업데이트
    setProductModalVisible(false);
    Alert.alert('제품 선택', `${product.name}을(를) 선택했습니다.`);
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      {/* 헤더 */}
      <LinearGradient
        colors={['#FF9A9E', '#FAD0C4']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            
          >
            
          </TouchableOpacity>
          <Text style={styles.headerTitle}>리뷰 작성</Text>
          <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmitReview}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? '등록 중...' : '등록'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* 제품 정보 */}
        <TouchableOpacity 
          style={styles.productSelector}
          onPress={() => setProductModalVisible(true)}
        >
          {productImage ? (
            <Image source={productImage} style={styles.productImage} />
          ) : (
            <View style={styles.productImagePlaceholder}>
              <Text style={styles.productImagePlaceholderText}>🔍</Text>
            </View>
          )}
          <View style={styles.productInfo}>
            <Text style={styles.productSelectorLabel}>리뷰할 제품</Text>
            <Text style={styles.productName}>{productName}</Text>
          </View>
          <Text style={styles.productSelectorArrow}>→</Text>
        </TouchableOpacity>
        
        {/* 별점 선택 */}
        <View style={styles.ratingContainer}>
          <Text style={styles.sectionTitle}>별점</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <Text style={[styles.starIcon, star <= rating && styles.starIconActive]}>
                  {star <= rating ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingText}>
            {rating > 0 
              ? `${rating}점 - ${
                  rating === 1 ? '별로예요' : 
                  rating === 2 ? '그저 그래요' : 
                  rating === 3 ? '괜찮아요' : 
                  rating === 4 ? '좋아요' : '최고예요'
                }` 
              : '별점을 선택해주세요'}
          </Text>
        </View>
        
        {/* 리뷰 작성 */}
        <View style={styles.reviewTextContainer}>
          <Text style={styles.sectionTitle}>리뷰 작성</Text>
          <TextInput
            style={styles.reviewTextInput}
            placeholder="이 제품에 대한 솔직한 리뷰를 작성해주세요. (최소 20자)"
            placeholderTextColor="#ADB5BD"
            multiline
            textAlignVertical="top"
            value={reviewText}
            onChangeText={setReviewText}
          />
          <Text style={styles.characterCount}>
            {reviewText.length}/500자
          </Text>
        </View>
        
        {/* 이미지 추가 */}
        <View style={styles.imagesContainer}>
          <Text style={styles.sectionTitle}>사진 추가 (선택)</Text>
          <View style={styles.imagesList}>
            <TouchableOpacity 
              style={styles.addImageButton}
              onPress={handleAddImage}
            >
              <Text style={styles.addImageButtonText}>+</Text>
              <Text style={styles.addImageButtonLabel}>사진 추가</Text>
            </TouchableOpacity>
            
            {images.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={require('../assets/product1.png')} style={styles.uploadedImage} />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => handleRemoveImage(index)}
                >
                  <Text style={styles.removeImageButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <Text style={styles.imagesHelperText}>
            * 최대 5장까지 추가할 수 있어요
          </Text>
        </View>
        
        {/* 리뷰 작성 팁 */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 리뷰 작성 팁</Text>
          <Text style={styles.tipsText}>
            • 제품의 장단점을 구체적으로 작성해주세요{'\n'}
            • 사용 기간과 효과를 함께 작성하면 더 도움이 됩니다{'\n'}
            • 피부 타입을 언급하면 다른 사용자에게 유용해요
          </Text>
        </View>
      </ScrollView>
      
      {/* 하단 버튼 (키보드가 열려있지 않을 때만 표시) */}
      <Animated.View 
        style={[
          styles.bottomButton,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateAnim }]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.submitButtonLarge}
          onPress={handleSubmitReview}
          disabled={isSubmitting}
        >
          <LinearGradient
            colors={['#FF9A9E', '#FAD0C4']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.submitButtonGradient}
          >
            <Text style={styles.submitButtonLargeText}>
              {isSubmitting ? '등록 중...' : '리뷰 등록하기'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
      
      {/* 제품 선택 모달 */}
      <Modal
        visible={isProductModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setProductModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>제품 선택</Text>
              <TouchableOpacity 
                onPress={() => setProductModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.modalSearchInput}
              placeholder="제품명 검색"
              placeholderTextColor="#ADB5BD"
            />
            
            <ScrollView style={styles.productList}>
              {sampleProducts.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productItem}
                  onPress={() => handleSelectProduct(product)}
                >
                  <Image source={product.image} style={styles.productItemImage} />
                  <Text style={styles.productItemName}>{product.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    height: 60,
    width: '100%',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  submitButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  productSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  productImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F1F3F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  productImagePlaceholderText: {
    fontSize: 24,
    color: '#ADB5BD',
  },
  productInfo: {
    flex: 1,
  },
  productSelectorLabel: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
  },
  productSelectorArrow: {
    fontSize: 18,
    color: '#ADB5BD',
  },
  ratingContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 15,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  starButton: {
    padding: 5,
    marginHorizontal: 8,
  },
  starIcon: {
    fontSize: 36,
    color: '#DEE2E6',
  },
  starIconActive: {
    color: '#FFC107',
  },
  ratingText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6C757D',
  },
  reviewTextContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewTextInput: {
    height: 150,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    padding: 15,
    fontSize: 14,
    color: '#212529',
    backgroundColor: '#F8F9FA',
  },
  characterCount: {
    alignSelf: 'flex-end',
    marginTop: 8,
    fontSize: 12,
    color: '#ADB5BD',
  },
  imagesContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imagesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 10,
  },
  addImageButtonText: {
    fontSize: 24,
    color: '#ADB5BD',
  },
  addImageButtonLabel: {
    fontSize: 12,
    color: '#ADB5BD',
    marginTop: 5,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
    position: 'relative',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  imagesHelperText: {
    marginTop: 10,
    fontSize: 12,
    color: '#6C757D',
  },
  tipsContainer: {
    backgroundColor: '#F1F3F5',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9A9E',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 10,
  },
  tipsText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#495057',
  },
  bottomButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
  },
  submitButtonLarge: {
    borderRadius: 12,
    overflow: 'hidden',
    height: 56,
  },
  submitButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonLargeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F3F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    color: '#6C757D',
  },
  modalSearchInput: {
    margin: 20,
    marginTop: 10,
    marginBottom: 10,
    height: 50,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#212529',
    backgroundColor: '#F8F9FA',
  },
  productList: {
    maxHeight: 400,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  productItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
  },
  productItemName: {
    fontSize: 14,
    color: '#212529',
  },
});

export default WriteReviewScreen;