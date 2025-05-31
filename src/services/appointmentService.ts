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
      const timeSlots = await medicalApi.getDoctorAvailableTimes(doctorId, date) as string[];
      return timeSlots;
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
  }
}; 