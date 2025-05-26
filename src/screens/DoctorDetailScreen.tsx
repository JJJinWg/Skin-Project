
// 의사 상세 정보 화면
import React, { useState, useEffect } from 'react
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { appointmentService } from '../services/appointmentService';

const DoctorDetailScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  
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
    navigation.navigate('AppointmentScreen', {
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialty
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} >
          
        </TouchableOpacity>
        <Text style={styles.headerTitle}>의사 정보</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 의사 프로필 섹션 */}
        <View style={styles.profileSection}>
          <Image source={doctor.image} style={styles.doctorImage} />
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
            <Text style={styles.hospitalName}>{doctor.hospital}</Text>
            <View style={styles.ratingContainer}>
              {renderStars(doctor.rating)}
              <Text style={styles.ratingText}>{doctor.rating}</Text>
              <Text style={styles.reviewCountText}>({doctor.reviewCount}개 리뷰)</Text>
            </View>
          </View>
        </View>

        {/* 탭 메뉴 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "info" && styles.activeTabButton]}
            onPress={() => setActiveTab("info")}
          >
            <Text style={[styles.tabButtonText, activeTab === "info" && styles.activeTabButtonText]}>의사 정보</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "reviews" && styles.activeTabButton]}
            onPress={() => setActiveTab("reviews")}
          >
            <Text style={[styles.tabButtonText, activeTab === "reviews" && styles.activeTabButtonText]}>
              리뷰 ({doctor.reviewCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* 탭 콘텐츠 */}
        {activeTab === "info" ? (
          <View style={styles.infoContent}>
            {/* 소개 */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>소개</Text>
              <Text style={styles.description}>{doctor.description}</Text>
            </View>

            {/* 학력 및 경력 */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>학력 및 경력</Text>
              <View style={styles.experienceContainer}>
                <Text style={styles.experienceText}>경력: {doctor.experience}</Text>
              </View>
              {doctor.education.map((edu, index) => (
                <Text key={index} style={styles.educationItem}>
                  • {edu}
                </Text>
              ))}
            </View>

            {/* 진료 정보 */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>진료 정보</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>진료 시간 (평일)</Text>
                <Text style={styles.infoValue}>{doctor.workingHours.weekday}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>진료 시간 (주말)</Text>
                <Text style={styles.infoValue}>{doctor.workingHours.weekend}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>진료비</Text>
                <Text style={styles.infoValue}>{doctor.consultationFee}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.reviewsContent}>
            <FlatList
              data={reviews}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.patientName}>{item.patientName}</Text>
                    <Text style={styles.reviewDate}>{formatDate(item.date)}</Text>
                  </View>
                  <View style={styles.reviewRating}>{renderStars(item.rating)}</View>
                  <Text style={styles.reviewContent}>{item.content}</Text>
                  <View style={styles.reviewFooter}>
                    <Text style={styles.helpfulText}>도움됨 {item.helpful}</Text>
                  </View>
                </View>
              )}
              scrollEnabled={false}
              contentContainerStyle={styles.reviewsList}
            />
          </View>
        )}
      </ScrollView>

      {/* 하단 예약 버튼 */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookAppointment}>
          <LinearGradient
            colors={["#FF9A9E", "#FAD0C4"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bookButtonGradient}
          >
            <Text style={styles.bookButtonText}>예약하기</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F5",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#212529",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6C757D",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  profileSection: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: "#6C757D",
    marginBottom: 2,
  },
  hospitalName: {
    fontSize: 14,
    color: "#6C757D",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starsContainer: {
    flexDirection: "row",
    marginRight: 5,
  },
  starIcon: {
    fontSize: 16,
    color: "#FFC107",
    marginRight: 1,
  },
  emptyStar: {
    color: "#E9ECEF",
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#212529",
    marginRight: 5,
  },
  reviewCountText: {
    fontSize: 12,
    color: "#6C757D",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F5",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: "#FF9A9E",
  },
  tabButtonText: {
    fontSize: 14,
    color: "#6C757D",
  },
  activeTabButtonText: {
    color: "#FF9A9E",
    fontWeight: "bold",
  },
  infoContent: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#495057",
    lineHeight: 20,
  },
  experienceContainer: {
    marginBottom: 10,
  },
  experienceText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF9A9E",
    marginBottom: 8,
  },
  educationItem: {
    fontSize: 14,
    color: "#495057",
    marginBottom: 4,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6C757D",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#212529",
  },
  reviewsContent: {
    padding: 20,
  },
  reviewsList: {
    paddingBottom: 20,
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  patientName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#212529",
  },
  reviewDate: {
    fontSize: 12,
    color: "#6C757D",
  },
  reviewRating: {
    marginBottom: 8,
  },
  reviewContent: {
    fontSize: 14,
    color: "#495057",
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewFooter: {
    alignItems: "flex-end",
  },
  helpfulText: {
    fontSize: 12,
    color: "#6C757D",
  },
  bottomContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F1F3F5",
  },
  bookButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  bookButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default DoctorDetailScreen