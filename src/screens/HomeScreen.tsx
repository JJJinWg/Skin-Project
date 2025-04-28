// 메인 HOME 화면

import React from 'react';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import LinearGradient from 'react-native-linear-gradient';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';



const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const doctors = [
    { id: 1, name: 'Dr. Kim', specialty: '피부과', image: require('../assets/doctor1.png') },
    { id: 2, name: 'Dr. Lee', specialty: '알레르기', image: require('../assets/doctor2.png') },
    { id: 3, name: 'Dr. Park', specialty: '피부과', image: require('../assets/doctor3.png') },
    { id: 4, name: 'Dr. Choi', specialty: '피부과', image: require('../assets/doctor4.png') },
  ];

  const products = [
    { id: 1, name: 'Beplain', rating: 4.44, reviews: 128, image: require('../assets/product1.png') },
    { id: 2, name: 'Torriden', rating: 3.57, reviews: 86, image: require('../assets/product2.png') },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>안녕하세요 👋</Text>
            <Text style={styles.headerText}>홍길동님</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Image 
              source={require('../assets/doctor1.png')} 
              style={styles.profileImage} 
            />
          </TouchableOpacity>
        </View>

        {/* 메인 배너 */}
        <TouchableOpacity style={styles.mainBanner}>
          <LinearGradient
            colors={['#FF9A9E', '#FAD0C4']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.bannerGradient}
          >
            <View style={styles.bannerContent}>
              <View>
                <Text style={styles.bannerTitle}>집 근처 약국 찾기</Text>
                <Text style={styles.bannerSubtitle}>빠르고 간편하게 약국을 찾아보세요.</Text>
              </View>
              <View style={styles.bannerIconContainer}>
                <Text style={styles.bannerIcon}>🔍</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* 진료 예약 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>진료 예약</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('ReservationScreen')}
            >
              <Text style={styles.viewAllText}>전체보기</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={doctors}
            horizontal
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.doctorCard}>
                <Image source={item.image} style={styles.doctorImage} />
                <View style={styles.doctorInfo}>
                  <Text style={styles.doctorName}>{item.name}</Text>
                  <Text style={styles.doctorSpecialty}>{item.specialty}</Text>
                </View>
                <TouchableOpacity style={styles.bookButton}>
                  <Text style={styles.bookButtonText}>예약</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.doctorList}
          />
        </View>

        {/* AI 서비스 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI 서비스</Text>
          
          <View style={styles.aiSection}>
            <TouchableOpacity
              style={styles.aiCard}
              onPress={() => navigation.navigate('SkinDiagnosisScreen')}
            >
              <LinearGradient
                colors={['#A18CD1', '#FBC2EB']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.aiCardGradient}
              >
                <View style={styles.aiIconContainer}>
                  <Text style={styles.aiIcon}>🔬</Text>
                </View>
                <Text style={styles.aiTitle}>피부 검진</Text>
                <Text style={styles.aiDescription}>AI로 피부 상태를 분석하세요</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.aiCard}
              onPress={() => navigation.navigate('FindCosmeticsScreen')}
            >
              <LinearGradient
                colors={['#84FAB0', '#8FD3F4']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.aiCardGradient}
              >
                <View style={styles.aiIconContainer}>
                  <Text style={styles.aiIcon}>✨</Text>
                </View>
                <Text style={styles.aiTitle}>화장품 추천</Text>
                <Text style={styles.aiDescription}>나에게 맞는 제품을 찾아보세요</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* 제품 리뷰 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>인기 제품</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('ProductReviewScreen')}
            >
              <Text style={styles.viewAllText}>전체보기</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={products}
            horizontal
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.productCard}
                onPress={() => navigation.navigate('ProductDetailScreen', { id: item.id })}
              >
                <Image source={item.image} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.productRating}>⭐ {item.rating}</Text>
                    <Text style={styles.reviewCount}>({item.reviews})</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
          />
        </View>
      </ScrollView>

      {/* 하단 네비게이션 */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={[styles.navText, styles.activeNavText]}>홈</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('ProductReviewScreen')}
        >
          <Text style={styles.navIcon}>📝</Text>
          <Text style={styles.navText}>리뷰</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📅</Text>
          <Text style={styles.navText}>예약</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navText}>프로필</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 4,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212529',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E9ECEF',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  mainBanner: {
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bannerGradient: {
    padding: 20,
  },
  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  bannerIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerIcon: {
    fontSize: 24,
  },
  section: {
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  viewAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#F1F3F5',
  },
  viewAllText: {
    fontSize: 12,
    color: '#6C757D',
  },
  doctorList: {
    paddingRight: 20,
  },
  doctorCard: {
    width: width * 0.65,
    marginLeft: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  doctorImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 12,
    color: '#6C757D',
  },
  bookButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FF9A9E',
    borderRadius: 12,
  },
  bookButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  aiSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  aiCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  aiCardGradient: {
    padding: 20,
    height: 160,
    justifyContent: 'flex-end',
  },
  aiIconContainer: {
    position: 'absolute',
    top: 15,
    left: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiIcon: {
    fontSize: 20,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  aiDescription: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  productList: {
    paddingRight: 20,
  },
  productCard: {
    width: width * 0.4,
    marginLeft: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productRating: {
    fontSize: 12,
    color: '#6C757D',
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#ADB5BD',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
    paddingBottom: 25, // 아이폰 하단 영역 고려
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: '#ADB5BD',
  },
  activeNavText: {
    color: '#FF9A9E',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
