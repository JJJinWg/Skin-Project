//내 정보 화면, 기본 정보,예약내역,리뷰 내역,진단 내역,설정 탭으로 구성

import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  Switch,
  FlatList,
  Alert,
  TextInput,
  Platform,
} from "react-native"
import { type NavigationProp, useNavigation, useFocusEffect, useRoute, type RouteProp } from "@react-navigation/native"
import type { RootStackParamList } from "../types/navigation"
import LinearGradient from "react-native-linear-gradient"
import { useDispatch } from 'react-redux'
import { logout } from '../store/authSlice'
import { medicalApi } from '../services/apiClient'
import { reviewService } from '../services/reviewService'
import { userService } from '../services/userService'
import { appointmentService } from '../services/appointmentService'
import type { UserInfo } from '../services/userService'
import type { ProfileAppointment } from '../services/appointmentService'
import type { Review } from '../services/reviewService'
import { profileStyles as styles } from '../styles/ProfileScreenStyles'
import { diagnosisService } from '../services/diagnosisService'

interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const route = useRoute<RouteProp<{ params?: { updatedUserInfo?: UserInfo } }, "params">>()
  const [activeTab, setActiveTab] = useState<"info" | "appointments" | "reviews" | "diagnoses" | "settings">("info")
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [darkModeEnabled, setDarkModeEnabled] = useState(false)
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [diagnoses, setDiagnoses] = useState<any[]>([])
  const [diagnosesLoading, setDiagnosesLoading] = useState(true)

  // 사용자 정보 (실제로는 API에서 가져옴)
  const [userInfo, setUserInfo] = useState<UserInfo>({
    id: 1,
    name: "홍길동",
    email: "hong@example.com",
    phone: "010-1234-5678",
    birthdate: "1990-01-01",
    profileImage: require("../assets/doctor1.png"), // 기본 이미지
  })

  // 예약 내역 (실제로는 API에서 가져옴)
  const [appointments, setAppointments] = useState<ProfileAppointment[]>([])

  // 리뷰 내역 (실제로는 API에서 가져옴)
  const [reviews, setReviews] = useState<Review[]>([])

  const dispatch = useDispatch()

  // 사용자 정보 초기화
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const userData = await userService.getCurrentUser();
        setUserInfo(userData);
      } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
        Alert.alert('오류', '사용자 정보를 불러오는데 실패했습니다.');
      }
    };

    loadUserInfo();
  }, []);

  // 예약 내역 가져오기
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true);
        const appointmentsData = await appointmentService.getUserAppointmentsForProfile(1);
        setAppointments(appointmentsData);
      } catch (error) {
        console.error('예약 내역 로드 실패:', error);
        Alert.alert('오류', '예약 내역을 불러오는데 실패했습니다.');
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  // 리뷰 내역 가져오기
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setReviewsLoading(true);
        const response = await medicalApi.getUserReviews(1) as ApiResponse<any[]>;
        const reviewsData = response.data;
        
        // 제품 이미지 처리 함수 (ProductReviewScreen과 동일한 로직)
        const getProductImage = (imageUrl: string | null, productId: number, review?: any) => {
          // 여러 가능한 이미지 소스 확인
          const imageSource = imageUrl || 
                             review?.productImage?.uri || 
                             review?.product?.image?.uri ||
                             review?.product?.image_url ||
                             review?.product?.imageUrl;
                             
          if (imageSource) {
            return { uri: imageSource };
          }
          // 기본 이미지 URL 반환
          return { uri: `https://via.placeholder.com/150?text=Product+${productId}` };
        };
        
        // API 응답을 Review 타입에 맞게 변환 - 각 제품 정보도 함께 조회
        const formattedReviews: Review[] = [];
        
        for (const review of reviewsData) {
          console.log(`🖼️ 리뷰 ${review.id} 제품 이미지 처리:`, {
            productId: review.productId,
            productImage: review.productImage,
            productData: review.product
          });
          
          let productImage;
          
          try {
            // productId를 이용해서 실제 제품 정보 조회
            console.log(`🔍 제품 ${review.productId} 정보 조회 중...`);
            const productData = await medicalApi.getProduct(review.productId) as any;
            console.log(`📦 제품 ${review.productId} 정보:`, productData);
            
            // 이미지 필드 상세 로깅
            console.log(`🖼️ 제품 ${review.productId} 이미지 필드들:`, {
              image: productData.image,
              image_url: productData.image_url,
              imageUrl: productData.imageUrl,
              thumbnail: productData.thumbnail,
              photo: productData.photo
            });
            
            // ProductReviewScreen과 정확히 동일한 방식으로 이미지 처리
            const productAny = productData as any;
            const imageSource = productData.image || productAny.image_url || productAny.imageUrl;
            
            console.log(`🔍 추출된 이미지 소스:`, imageSource);
            
            if (imageSource) {
              productImage = { uri: imageSource };
            } else {
              productImage = { uri: `https://via.placeholder.com/150?text=Product+${review.productId}` };
            }
          } catch (productError) {
            console.warn(`⚠️ 제품 ${review.productId} 정보 조회 실패:`, productError);
            // 제품 정보 조회 실패 시 기본 처리
            productImage = getProductImage(
              review.productImage, 
              review.productId, 
              review
            );
          }
          
          console.log(`✅ 리뷰 ${review.id} 최종 이미지:`, productImage);
          
          formattedReviews.push({
            id: review.id,
            productId: review.productId || 0,
            productName: review.productName || '제품명 없음',
            productImage: productImage,
            rating: isNaN(Number(review.rating)) ? 0 : Number(review.rating),
            content: review.content || '',
            date: review.date || new Date().toISOString().split('T')[0],
            images: review.images || [],
            likes: isNaN(Number(review.likes)) ? 0 : Number(review.likes),
            helpful: isNaN(Number(review.helpful)) ? 0 : Number(review.helpful),
          });
        }
        
        setReviews(formattedReviews);
      } catch (error) {
        console.log('📝 리뷰 내역 조회:', error);
        // 404 에러나 데이터가 없는 경우는 정상적인 상황으로 처리
        if (error instanceof Error && (error.message.includes('404') || error.message.includes('Not Found'))) {
          console.log('📝 아직 작성한 리뷰가 없습니다.');
          setReviews([]);
        } else {
          console.error('리뷰 내역 로드 실패:', error);
          // 네트워크 오류 등 실제 문제가 있는 경우에만 에러 표시
          Alert.alert('오류', '리뷰 내역을 불러오는데 실패했습니다.');
          setReviews([]);
        }
      } finally {
        setReviewsLoading(false);
      }
    };

    loadReviews();
  }, []);

  // 진단 내역 가져오기
  useEffect(() => {
    const loadDiagnoses = async () => {
      try {
        setDiagnosesLoading(true);
        
        // diagnosisService 사용하여 진단 내역 조회
        const diagnosesData = await diagnosisService.getUserDiagnoses(1);
        setDiagnoses(diagnosesData);
      } catch (error) {
        console.error('진단 내역 로드 실패:', error);
        Alert.alert('오류', '진단 내역을 불러오는데 실패했습니다.');
        setDiagnoses([]);
      } finally {
        setDiagnosesLoading(false);
      }
    };

    loadDiagnoses();
  }, []);

  // 화면이 포커스될 때마다 실행되는 효과
  useFocusEffect(
    useCallback(() => {
      // 업데이트된 사용자 정보가 있으면 적용
      if (route.params?.updatedUserInfo) {
        setUserInfo(route.params.updatedUserInfo)

        // 네비게이션 파라미터 초기화 (중복 적용 방지)
        navigation.setParams({ updatedUserInfo: undefined })
      }
    }, [route.params, navigation]),
  )

  // 날짜 포맷 변환 (YYYY-MM-DD -> YYYY년 MM월 DD일)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    return `${year}년 ${month}월 ${day}일`
  }

  // 로그아웃 처리
  const handleLogout = () => {
    Alert.alert(
      "로그아웃",
      "정말 로그아웃 하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "로그아웃",
          onPress: () => {
            dispatch(logout())
          },
        },
      ],
      { cancelable: true },
    )
  }

  // 계정 삭제 처리
  const handleDeleteAccount = () => {
    Alert.alert(
      "계정 삭제",
      "계정을 삭제하시면 모든 데이터가 영구적으로 삭제됩니다. 정말 삭제하시겠습니까?",
      [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => {
            // 실제로는 계정 삭제 API 호출 후 로그인 화면으로 이동
            Alert.alert("계정이 삭제되었습니다.")
            navigation.navigate("LoginForm")
          },
        },
      ],
      { cancelable: true },
    )
  }

  // 예약 취소 처리
  const handleCancelAppointment = async (id: number) => {
    Alert.alert(
      "예약 취소",
      "이 예약을 취소하시겠습니까?",
      [
        {
          text: "아니오",
          style: "cancel",
        },
        {
          text: "예",
          onPress: () => showCancellationReasonInput(id),
        },
      ],
      { cancelable: true }
    );
  }

  // 취소 사유 입력 화면 표시
  const showCancellationReasonInput = (id: number) => {
    // iOS에서만 Alert.prompt 사용
    if (Platform.OS === 'ios') {
      Alert.prompt(
        "취소 사유 입력",
        "취소 사유를 입력해주세요:",
        [
          {
            text: "취소",
            style: "cancel",
          },
          {
            text: "확인",
            onPress: async (inputText) => {
              const cancellationReason = inputText || "취소 사유 없음";
              await performCancellation(id, cancellationReason);
            },
          },
        ],
        "plain-text",
        "", // 기본값
        "default"
      );
    } else {
      // Android에서는 미리 정의된 옵션 중 선택
      Alert.alert(
        "취소 사유 선택",
        "취소 사유를 선택해주세요:",
        [
          {
            text: "개인 사정",
            onPress: () => performCancellation(id, "개인 사정으로 인한 취소")
          },
          {
            text: "일정 변경",
            onPress: () => performCancellation(id, "일정 변경으로 인한 취소")
          },
          {
            text: "증상 호전",
            onPress: () => performCancellation(id, "증상 호전으로 인한 취소")
          },
          {
            text: "기타",
            onPress: () => performCancellation(id, "기타 사유로 인한 취소")
          },
          {
            text: "돌아가기",
            style: "cancel"
          }
        ],
        { cancelable: true }
      );
    }
  }

  // 실제 취소 수행 함수
  const performCancellation = async (id: number, cancellationReason: string) => {
    try {
      // 실제 예약 취소 API 호출 (취소 사유 포함)
      const result = await appointmentService.cancelAppointmentWithReason(id, cancellationReason);
      
      if (result) {
        // API 호출 성공 시 로컬 상태 업데이트
        const updatedAppointments = appointments.map((appointment) =>
          appointment.id === id ? { ...appointment, status: "cancelled" as const } : appointment,
        )
        setAppointments(updatedAppointments)
        Alert.alert("성공", "예약이 취소되었습니다.")
      } else {
        Alert.alert("오류", "예약 취소에 실패했습니다. 다시 시도해주세요.")
      }
    } catch (error) {
      console.error('예약 취소 실패:', error);
      Alert.alert("오류", "예약 취소 중 오류가 발생했습니다.")
    }
  }

  // 리뷰 삭제 처리
  const handleDeleteReview = async (id: number) => {
    Alert.alert(
      "리뷰 삭제",
      "이 리뷰를 삭제하시겠습니까?",
      [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "삭제",
          onPress: async () => {
            try {
              const result = await reviewService.deleteReview(id)
              if (result.success) {
                const updatedReviews = reviews.filter((review) => review.id !== id)
                setReviews(updatedReviews)
                Alert.alert("성공", result.message)
              } else {
                Alert.alert("오류", result.message)
              }
            } catch (error) {
              Alert.alert("오류", "리뷰 삭제에 실패했습니다.")
            }
          },
        },
      ],
      { cancelable: true },
    )
  }

  // 리뷰 수정 화면으로 이동
  const handleEditReview = (review: Review) => {
    navigation.navigate("EditReviewScreen", { review })
  }

  // 예약 상태에 따른 색상 반환
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#FF9800" // 주황색 (대기중)
      case "confirmed":
        return "#4CAF50" // 초록색 (확정됨)
      case "completed":
        return "#2196F3" // 파란색 (완료됨)
      case "cancelled":
      case "canceled":
        return "#F44336" // 빨간색 (취소됨)
      default:
        return "#757575" // 회색
    }
  }

  // 예약 상태 한글 변환
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "대기중"
      case "confirmed":
        return "확정됨"
      case "completed":
        return "완료됨"
      case "cancelled":
      case "canceled":
        return "취소됨"
      default:
        return "알 수 없음"
    }
  }

  // 별점 렌더링 함수
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating)
    const halfStar = rating - fullStars >= 0.5
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0)

    return (
      <View style={styles.starsContainer}>
        {[...Array(fullStars)].map((_, i) => (
          <Text key={`full-${i}`} style={styles.starIcon}>
            ★
          </Text>
        ))}
        {halfStar && <Text style={styles.starIcon}>★</Text>}
        {[...Array(emptyStars)].map((_, i) => (
          <Text key={`empty-${i}`} style={[styles.starIcon, styles.emptyStar]}>
            ★
          </Text>
        ))}
      </View>
    )
  }

  // 프로필 이미지 변경
  const handleChangeProfileImage = () => {
    navigation.navigate("EditProfileScreen", { userInfo })
  }

  // 뒤로가기 처리 - 홈 화면으로 이동
  const handleBackPress = () => {
    navigation.navigate("HomeScreen")
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내 정보</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 프로필 헤더 */}
      <View style={styles.profileHeader}>
        <TouchableOpacity style={styles.profileImageContainer} onPress={handleChangeProfileImage}>
          <Image source={userInfo.profileImage} style={styles.profileImage} />
          <View style={styles.editIconContainer}>
            <Text style={styles.editIcon}>✎</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.profileName}>{userInfo.name}</Text>
        <Text style={styles.profileEmail}>{userInfo.email}</Text>
      </View>

      {/* 탭 메뉴 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "info" && styles.activeTabButton]}
          onPress={() => setActiveTab("info")}
        >
          <Text style={[styles.tabButtonText, activeTab === "info" && styles.activeTabButtonText]}>기본 정보</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "appointments" && styles.activeTabButton]}
          onPress={() => setActiveTab("appointments")}
        >
          <Text style={[styles.tabButtonText, activeTab === "appointments" && styles.activeTabButtonText]}>
            예약 내역
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "reviews" && styles.activeTabButton]}
          onPress={() => setActiveTab("reviews")}
        >
          <Text style={[styles.tabButtonText, activeTab === "reviews" && styles.activeTabButtonText]}>리뷰 내역</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "diagnoses" && styles.activeTabButton]}
          onPress={() => setActiveTab("diagnoses")}
        >
          <Text style={[styles.tabButtonText, activeTab === "diagnoses" && styles.activeTabButtonText]}>진단 내역</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "settings" && styles.activeTabButton]}
          onPress={() => setActiveTab("settings")}
        >
          <Text style={[styles.tabButtonText, activeTab === "settings" && styles.activeTabButtonText]}>설정</Text>
        </TouchableOpacity>
      </View>

      {/* 탭 콘텐츠 */}
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* 기본 정보 탭 */}
        {activeTab === "info" && (
          <View style={styles.infoContainer}>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>이름</Text>
                <Text style={styles.infoValue}>{userInfo.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>이메일</Text>
                <Text style={styles.infoValue}>{userInfo.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>전화번호</Text>
                <Text style={styles.infoValue}>{userInfo.phone}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>생년월일</Text>
                <Text style={styles.infoValue}>{formatDate(userInfo.birthdate)}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate("EditProfileScreen", { userInfo })}
            >
              <LinearGradient
                colors={["#FF9A9E", "#FAD0C4"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.editButtonGradient}
              >
                <Text style={styles.editButtonText}>정보 수정</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* 예약 내역 탭 */}
        {activeTab === "appointments" && (
          <View style={styles.appointmentsContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>예약 내역을 불러오는 중...</Text>
              </View>
            ) : appointments.length > 0 ? (
              <FlatList
                data={appointments}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                nestedScrollEnabled={true}
                renderItem={({ item }) => (
                  <View style={styles.appointmentCard}>
                    <View style={styles.appointmentHeader}>
                      <Image 
                        source={item.doctorImage || require('../assets/doctor1.png')} 
                        style={styles.doctorImageSmall} 
                      />
                      <View style={styles.appointmentHeaderInfo}>
                        <Text style={styles.doctorName}>{item.doctorName}</Text>
                        <Text style={styles.specialty}>{item.specialty}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.appointmentDetails}>
                      <Text style={styles.appointmentDate}>
                        📅 {formatDate(item.date)} {item.time}
                      </Text>
                      {item.symptoms && (
                        <Text style={styles.appointmentSymptoms}>
                          🩺 {item.symptoms}
                        </Text>
                      )}
                    </View>
                    {(item.status === "pending" || item.status === "confirmed") && (
                      <View style={styles.appointmentActions}>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancelAppointment(item.id)}>
                          <Text style={styles.cancelButtonText}>예약 취소</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
                contentContainerStyle={styles.appointmentsList}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.noAppointmentsContainer}>
                <Text style={styles.noAppointmentsText}>예약 내역이 없습니다.</Text>
                <TouchableOpacity
                  style={styles.makeAppointmentButton}
                  onPress={() => navigation.navigate("ReservationScreen")}
                >
                  <LinearGradient
                    colors={["#FF9A9E", "#FAD0C4"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.makeAppointmentButtonGradient}
                  >
                    <Text style={styles.makeAppointmentButtonText}>예약하기</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* 리뷰 내역 탭 */}
        {activeTab === "reviews" && (
          <View style={styles.reviewsContainer}>
            {reviewsLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>리뷰 내역을 불러오는 중...</Text>
              </View>
            ) : reviews.length > 0 ? (
              <FlatList
                data={reviews}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                nestedScrollEnabled={true}
                renderItem={({ item }) => (
                  <View style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <Image source={item.productImage} style={styles.productImage} />
                      <View style={styles.reviewHeaderInfo}>
                        <Text style={styles.productName}>{item.productName}</Text>
                        <View style={styles.ratingContainer}>
                          {renderStars(item.rating)}
                          <Text style={styles.ratingText}>
                            {isNaN(item.rating) ? '0.0' : item.rating.toFixed(1)}
                          </Text>
                        </View>
                        <Text style={styles.reviewDate}>{formatDate(item.date)}</Text>
                      </View>
                    </View>
                    <Text style={styles.reviewContent}>{item.content}</Text>
                    {item.images && item.images.length > 0 && (
                      <View style={styles.reviewImagesContainer}>
                        {item.images.map((image: string, index: number) => (
                          <Image key={index} source={{ uri: image }} style={styles.reviewImage} />
                        ))}
                      </View>
                    )}
                    <View style={styles.reviewStats}>
                      <Text style={styles.reviewStatsText}>
                        👍 {isNaN(item.likes) ? 0 : item.likes} 명이 좋아합니다
                      </Text>
                      <Text style={styles.reviewStatsText}>
                        🙌 {isNaN(item.helpful) ? 0 : item.helpful} 명이 도움됐습니다
                      </Text>
                    </View>
                    <View style={styles.reviewActions}>
                      <TouchableOpacity style={styles.reviewActionButton} onPress={() => handleEditReview(item)}>
                        <Text style={styles.reviewActionButtonText}>수정</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.reviewActionButton, styles.deleteButton]}
                        onPress={() => handleDeleteReview(item.id)}
                      >
                        <Text style={styles.deleteButtonText}>삭제</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                contentContainerStyle={styles.reviewsList}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.noReviewsContainer}>
                <Text style={styles.noReviewsText}>아직 작성한 리뷰가 없어요</Text>
                <Text style={styles.noReviewsSubtext}>
                  제품을 사용해보시고 후기를 남겨주세요!
                </Text>
                <TouchableOpacity
                  style={styles.writeReviewButton}
                  onPress={() => navigation.navigate("ProductReviewScreen")}
                >
                  <LinearGradient
                    colors={["#FF9A9E", "#FAD0C4"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.writeReviewButtonGradient}
                  >
                    <Text style={styles.writeReviewButtonText}>제품 둘러보기</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* 진단 내역 탭 */}
        {activeTab === "diagnoses" && (
          <View style={styles.diagnosesContainer}>
            {diagnosesLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>진단 내역을 불러오는 중...</Text>
              </View>
            ) : diagnoses.length > 0 ? (
              <FlatList
                data={diagnoses}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                nestedScrollEnabled={true}
                renderItem={({ item }) => (
                  <View style={styles.diagnosisCard}>
                    <View style={styles.diagnosisHeader}>
                      <Image source={item.doctorImage} style={styles.doctorImageSmall} />
                      <View style={styles.diagnosisHeaderInfo}>
                        <Text style={styles.doctorName}>{item.doctorName}</Text>
                        <Text style={styles.specialty}>{item.specialty}</Text>
                        <Text style={styles.diagnosisDate}>{formatDate(item.date)}</Text>
                      </View>
                    </View>
                    <View style={styles.diagnosisSummary}>
                      <Text style={styles.diagnosisLabel}>주요 증상:</Text>
                      <Text style={styles.diagnosisText} numberOfLines={2}>
                        {item.symptoms}
                      </Text>
                    </View>
                    <View style={styles.diagnosisSummary}>
                      <Text style={styles.diagnosisLabel}>진단:</Text>
                      <Text style={styles.diagnosisText} numberOfLines={2}>
                        {item.diagnosisContent}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.viewDetailButton}
                      onPress={() => navigation.navigate("DiagnosisDetailScreen", { diagnosisId: item.id })}
                    >
                      <Text style={styles.viewDetailButtonText}>상세 보기</Text>
                    </TouchableOpacity>
                  </View>
                )}
                contentContainerStyle={styles.diagnosisList}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.noDiagnosisContainer}>
                <Text style={styles.noDiagnosisText}>진단 내역이 없습니다.</Text>
                <Text style={styles.noDiagnosisSubtext}>의사의 진단을 받은 후에 이곳에서 확인할 수 있습니다.</Text>
                <TouchableOpacity
                  style={styles.makeAppointmentButton}
                  onPress={() => navigation.navigate("ReservationScreen")}
                >
                  <LinearGradient
                    colors={["#FF9A9E", "#FAD0C4"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.makeAppointmentButtonGradient}
                  >
                    <Text style={styles.makeAppointmentButtonText}>진료 예약하기</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* 설정 탭 */}
        {activeTab === "settings" && (
          <View style={styles.settingsContainer}>
            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>알림 설정</Text>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>알림 받기</Text>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: "#E9ECEF", true: "#FF9A9E" }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>앱 설정</Text>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>다크 모드</Text>
                <Switch
                  value={darkModeEnabled}
                  onValueChange={setDarkModeEnabled}
                  trackColor={{ false: "#E9ECEF", true: "#FF9A9E" }}
                  thumbColor="#FFFFFF"
                />
              </View>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>생체 인증 사용</Text>
                <Switch
                  value={biometricEnabled}
                  onValueChange={setBiometricEnabled}
                  trackColor={{ false: "#E9ECEF", true: "#FF9A9E" }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>계정</Text>
              <TouchableOpacity style={styles.settingButton} onPress={handleLogout}>
                <Text style={styles.settingButtonText}>로그아웃</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingButton} onPress={handleDeleteAccount}>
                <Text style={[styles.settingButtonText, styles.deleteAccountText]}>계정 삭제</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>앱 정보</Text>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>버전</Text>
                <Text style={styles.settingValue}>1.0.0</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}


export default ProfileScreen
