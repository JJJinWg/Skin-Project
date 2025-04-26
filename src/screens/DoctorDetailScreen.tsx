// 의사 상세 정보 화면
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

const DoctorDetailScreen: React.FC = () => {
  const doctor = {
    id: 1,
    name: 'Dr. Kim',
    specialty: '피부과',
    rating: 4.9,
    reviews: 124,
    description: '피부과 전문의로 10년 이상의 경력을 보유하고 있습니다.',
    image: require('../assets/doctor1.png'),
  };

  const handleReservation = () => {
    console.log('예약 버튼 클릭');
    // 예약 로직 추가
  };

  return (
    <ScrollView style={styles.container}>
      {/* 의사 이미지 */}
      <Image source={doctor.image} style={styles.doctorImage} />

      {/* 의사 정보 */}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{doctor.name}</Text>
        <Text style={styles.specialty}>{doctor.specialty}</Text>
        <Text style={styles.rating}>⭐ {doctor.rating} ({doctor.reviews} 리뷰)</Text>
        <Text style={styles.description}>{doctor.description}</Text>
      </View>

      {/* 예약 버튼 */}
      <TouchableOpacity style={styles.reservationButton} onPress={handleReservation}>
        <Text style={styles.reservationButtonText}>예약하기</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  doctorImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  specialty: {
    fontSize: 18,
    color: '#555',
    marginBottom: 10,
  },
  rating: {
    fontSize: 16,
    color: '#00796b',
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  reservationButton: {
    margin: 20,
    backgroundColor: '#00796b',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  reservationButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default DoctorDetailScreen;