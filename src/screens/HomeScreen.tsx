import React from 'react';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const doctors = [
    { id: 1, name: 'Dr. Kim', image: require('../assets/doctor1.png') },
    { id: 2, name: 'Dr. Lee', image: require('../assets/doctor2.png') },
    { id: 3, name: 'Dr. Park', image: require('../assets/doctor3.png') },
    { id: 4, name: 'Dr. Choi', image: require('../assets/doctor4.png') },
  ];

  const products = [
    { id: 1, name: 'Beplain', rating: 4.44, image: require('../assets/product1.png') },
    { id: 2, name: 'Torriden', rating: 3.57, image: require('../assets/product2.png') },
  ];

  return (
    <View style={styles.container}>
      {/* 상단 */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Welcome, 홍길동</Text>
        <TouchableOpacity>
          <Text style={styles.icon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* 진료 예약 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>진료 예약</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ReservationScreen')}>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={doctors}
          horizontal
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.doctorCard}>
              <Image source={item.image} style={styles.doctorImage} />
              <Text style={styles.doctorName}>{item.name}</Text>
            </View>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* AI 피부 검진 */}
      <View style={styles.section}>
        <View style={styles.aiSection}>
          <TouchableOpacity
            style={styles.aiCard}
            onPress={() => navigation.navigate('SkinDiagnosisScreen')}
          >
            <Text style={styles.aiText}>AI로 피부 검진하기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.aiCard}
            onPress={() => navigation.navigate('FindCosmeticsScreen')}
          >
            <Text style={styles.aiText}>AI로 나만의 화장품 찾기</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 제품 리뷰 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>제품 리뷰</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ProductReviewScreen')}>
            <Text style={styles.arrow}>→</Text>
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
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productRating}>⭐ {item.rating}</Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10 }}
        />
      </View>

      {/* 하단 네비게이션 */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('ProductReviewScreen')}>
          <Text style={styles.navText}>리뷰</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('LoginForm')}>
          <Text style={styles.navText}>홈</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ReservationHistoryScreen')}>
          <Text style={styles.navText}>예약내역</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  icon: {
    fontSize: 24,
    color: '#888',
  },
  section: {
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#444',
  },
  arrow: {
    fontSize: 18,
    color: '#888',
  },
  doctorCard: {
    alignItems: 'center',
    marginHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  doctorName: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  aiSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aiCard: {
    flex: 1,
    marginHorizontal: 5,
    padding: 20,
    backgroundColor: '#e0f7fa',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aiText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00796b',
  },
  productCard: {
    width: 140,
    marginHorizontal: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  productName: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  productRating: {
    fontSize: 12,
    color: '#888',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  navText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00796b',
  },
});

export default HomeScreen;