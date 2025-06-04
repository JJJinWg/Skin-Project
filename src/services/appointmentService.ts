import { medicalApi } from './apiClient';

// 타입 정의
export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  hospital: string;
  rating: number;
  experience: string;
  image: any;
  workingHours?: any;
  unavailableDates?: string[];
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface Appointment {
  id: number;
  doctorId: number;
  userId: number;
  date: string;
  time: string;
  status: string;
  symptoms?: string;
  images?: string[];
}

// ProfileScreen용 예약 타입 (화면에서 사용하는 형태)
export interface ProfileAppointment {
  id: number;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  doctorImage?: any;
  symptoms?: string;
}

// 시간 관련 유틸리티 함수들
const timeUtils = {
  // 시간 문자열을 분으로 변환
  timeToMinutes: (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  },

  // 분을 시간 문자열로 변환
  minutesToTime: (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  },

  // 현재 시간 가져오기
  getCurrentTime: (): string => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  },

  // 날짜가 오늘인지 확인
  isToday: (dateString: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  },

  // 요일 확인 (0: 일요일, 1: 월요일, ..., 6: 토요일)
  getDayOfWeek: (dateString: string): number => {
    return new Date(dateString).getDay();
  },

  // 공휴일 확인 (간단한 예시)
  isHoliday: (dateString: string): boolean => {
    // 실제로는 공휴일 API나 데이터베이스에서 확인
    const holidays = [
      '2024-01-01', // 신정
      '2024-03-01', // 삼일절
      '2024-05-05', // 어린이날
      '2024-06-06', // 현충일
      '2024-08-15', // 광복절
      '2024-10-03', // 개천절
      '2024-10-09', // 한글날
      '2024-12-25', // 크리스마스
    ];
    return holidays.includes(dateString);
  }
};

export const appointmentService = {
  // 홈화면용 의사 목록 조회 (처음 4명만)
  getHomeDoctors: async (): Promise<Doctor[]> => {
    try {
      console.log('🏠 홈 의사 목록 조회 중...');
      
      // 실제 API 시도
      const doctors = await medicalApi.getDoctors() as Doctor[];
      return doctors.slice(0, 4);
    } catch (error) {
      console.error('❌ 홈 의사 목록 조회 실패:', error);
      return [];
    }
  },

  // 예약화면용 의사 목록 조회 (전체)
  getReservationDoctors: async (): Promise<Doctor[]> => {
    try {
      console.log('📋 예약 의사 목록 조회 중...');
      
      // 실제 API 시도
      const doctors = await medicalApi.getDoctors() as Doctor[];
      return doctors;
    } catch (error) {
      console.error('❌ 예약 의사 목록 조회 실패:', error);
      return [];
    }
  },

  // 제품 목록 조회
  getProducts: async () => {
    try {
      console.log('📦 제품 목록 조회 중...');
      const products = await medicalApi.getProducts();
      return products;
    } catch (error) {
      console.error('❌ 제품 목록 조회 실패:', error);
      return [];
    }
  },

  // 전문분야 목록 조회
  getSpecialties: async () => {
    try {
      console.log('🏥 전문분야 목록 조회 중...');
      // 기본 전문분야 반환 (API에 없는 경우)
      return [
        { id: 1, name: '피부과', icon: '🧴' },
        { id: 2, name: '성형외과', icon: '✨' },
        { id: 3, name: '알레르기내과', icon: '🤧' },
        { id: 4, name: '내과', icon: '🩺' },
      ];
    } catch (error) {
      console.error('❌ 전문분야 목록 조회 실패:', error);
      return [];
    }
  },

  // 병원 목록 조회
  getHospitals: async () => {
    try {
      console.log('🏥 병원 목록 조회 중...');
      
      // 실제 API 시도
      const hospitals = await medicalApi.getHospitals();
      return hospitals;
    } catch (error) {
      console.error('❌ 병원 목록 조회 실패:', error);
      return [];
    }
  },

  // 의사 목록 조회 (전체)
  getDoctors: async (): Promise<Doctor[]> => {
    try {
      console.log('👨‍⚕️ 의사 목록 조회 중...');
      
      // 실제 API 시도
      const doctors = await medicalApi.getDoctors() as Doctor[];
      return doctors;
    } catch (error) {
      console.error('❌ 의사 목록 조회 실패:', error);
      return [];
    }
  },

  // 의사 상세 정보 조회
  getDoctorById: async (id: number): Promise<Doctor | undefined> => {
    try {
      console.log(`👨‍⚕️ 의사 정보 조회 중... ID: ${id}`);
      
      // 실제 API 시도
      const doctor = await medicalApi.getDoctor(id) as Doctor;
      return doctor;
    } catch (error) {
      console.error('❌ 의사 정보 조회 실패:', error);
      return undefined;
    }
  },

  // 예약 가능 시간 조회
  getAvailableTimeSlots: async (doctorId: number, date: string): Promise<string[]> => {
    try {
      console.log(`⏰ 예약 가능 시간 조회 중... 의사 ID: ${doctorId}, 날짜: ${date}`);
      // 실제 API 시도
      const result = await medicalApi.getDoctorAvailableTimes(doctorId, date) as any;
      // 백엔드가 { availableTimes: [{time, available}]} 또는 { availableTimes: string[] } 형태로 반환한다고 가정
      if (Array.isArray(result)) {
        // 구버전: 바로 배열 반환
        return result;
      } else if (result && Array.isArray(result.availableTimes)) {
        // 신버전: availableTimes 필드만 추출
        // [{time, available}] 형태면 time만 추출
        if (typeof result.availableTimes[0] === 'object') {
          return result.availableTimes.filter((t: any) => t.available !== false).map((t: any) => t.time);
        }
        return result.availableTimes;
      }
      return [];
    } catch (error) {
      console.error('❌ 예약 가능 시간 조회 실패:', error);
      return [];
    }
  },

  // 예약 생성
  createAppointment: async (appointmentData: any): Promise<Appointment> => {
    try {
      console.log('📅 예약 생성 중...', appointmentData);
      
      // 실제 API 호출
      const appointment = await medicalApi.createAppointment(appointmentData) as Appointment;
      return appointment;
    } catch (error) {
      console.error('❌ 예약 생성 실패:', error);
      throw new Error('예약 생성에 실패했습니다.');
    }
  },

  // 사용자 예약 목록 조회
  getUserAppointments: async (userId: number): Promise<Appointment[]> => {
    try {
      console.log(`📋 사용자 예약 목록 조회 중... 사용자 ID: ${userId}`);
      
      // 실제 API 호출
      const appointments = await medicalApi.getAppointments(userId) as Appointment[];
      return appointments;
    } catch (error) {
      console.error('❌ 사용자 예약 목록 조회 실패:', error);
      return [];
    }
  },

  // 예약 상태 업데이트
  updateAppointmentStatus: async (appointmentId: number, status: string): Promise<boolean> => {
    try {
      console.log(`📝 예약 상태 업데이트 중... ID: ${appointmentId}, 상태: ${status}`);
      
      // 실제 API 호출
      await medicalApi.updateAppointmentStatus(appointmentId, status);
      return true;
    } catch (error) {
      console.error('❌ 예약 상태 업데이트 실패:', error);
      return false;
    }
  },

  // 예약 취소
  cancelAppointment: async (appointmentId: number): Promise<boolean> => {
    try {
      console.log(`❌ 예약 취소 중... ID: ${appointmentId}`);
      
      // 실제 API 호출
      await medicalApi.cancelAppointment(appointmentId);
      return true;
    } catch (error) {
      console.error('❌ 예약 취소 실패:', error);
      return false;
    }
  },

  // 취소 사유와 함께 예약 취소
  cancelAppointmentWithReason: async (appointmentId: number, cancellationReason: string): Promise<boolean> => {
    try {
      console.log(`❌ 예약 취소 중... ID: ${appointmentId}, 사유: ${cancellationReason}`);
      
      // 취소 사유를 포함한 API 호출
      await medicalApi.cancelAppointmentWithReason(appointmentId, cancellationReason);
      return true;
    } catch (error) {
      console.error('❌ 예약 취소 실패:', error);
      return false;
    }
  },

  // ProfileScreen용 예약 목록 조회 (화면에 맞는 형태로 변환)
  getUserAppointmentsForProfile: async (userId: number): Promise<ProfileAppointment[]> => {
    try {
      console.log(`📋 ProfileScreen용 예약 목록 조회 중... 사용자 ID: ${userId}`);
      
      // 실제 API 호출 - 백엔드에서 바로 배열을 반환
      const appointments = await medicalApi.getAppointments(userId) as any[];
      
      // ProfileAppointment 형태로 변환 (백엔드 응답 구조에 맞게)
      const profileAppointments: ProfileAppointment[] = appointments.map((appointment: any) => {
        console.log(`📋 예약 데이터:`, appointment);

        // 의사 이미지 처리: 기본 이미지 사용
        const doctorImage = require("../assets/doctor1.png");

        // 시간 형식 변환 (16:00:00 -> 16:00)
        const timeFormatted = appointment.appointment_time ? 
          appointment.appointment_time.substring(0, 5) : "시간 정보 없음";

        return {
          id: appointment.id,
          doctorName: appointment.doctor?.name || '의사명 정보 없음',
          specialty: appointment.doctor?.specialization || '전문분야 정보 없음', 
          date: appointment.appointment_date || '날짜 정보 없음', // appointment_date 필드 사용
          time: timeFormatted, // appointment_time 필드 사용하고 포맷팅
          status: appointment.status as "pending" | "confirmed" | "completed" | "cancelled",
          doctorImage: doctorImage,
          symptoms: appointment.symptoms || '증상 정보 없음'
        };
      });
      
      console.log(`📋 변환된 예약 목록:`, profileAppointments);
      return profileAppointments;
    } catch (error) {
      console.error('❌ ProfileScreen용 예약 목록 조회 실패:', error);
      return [];
    }
  }
};