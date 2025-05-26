import { 
  dummyDoctors, 
  dummyTimeSlots, 
  dummyProducts,
  dummySpecialties,
  type Doctor, 
  type TimeSlot
} from '../data/dummyData';
import { 
  getUserAppointmentsFromAPI, 
  createAppointmentToAPI,
  type NewAppointment as Appointment,
  type NewAppointmentStatus as AppointmentStatus 
} from '../data/index';

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
  getHomeDoctors: async () => {
    try {
      // 실제 API 연동 시: return apiClient.get('/doctors/featured');
      return dummyDoctors.slice(0, 4);
    } catch (error) {
      console.error('홈 의사 목록 조회 실패:', error);
      throw new Error('의사 목록을 불러오는데 실패했습니다.');
    }
  },

  // 예약화면용 의사 목록 조회 (전체)
  getReservationDoctors: async () => {
    try {
      // 실제 API 연동 시: return apiClient.get('/doctors/all');
      return dummyDoctors;
    } catch (error) {
      console.error('예약 의사 목록 조회 실패:', error);
      throw new Error('의사 목록을 불러오는데 실패했습니다.');
    }
  },

  // 제품 목록 조회
  getProducts: async () => {
    try {
      // 실제 API 연동 시: return apiClient.get('/products/featured');
      return dummyProducts;
    } catch (error) {
      console.error('제품 목록 조회 실패:', error);
      throw new Error('제품 목록을 불러오는데 실패했습니다.');
    }
  },

  // 전문분야 목록 조회
  getSpecialties: async () => {
    try {
      // 실제 API 연동 시: return apiClient.get('/specialties');
      return dummySpecialties;
    } catch (error) {
      console.error('전문분야 목록 조회 실패:', error);
      throw new Error('전문분야 목록을 불러오는데 실패했습니다.');
    }
  },

  // 의사 목록 조회 (전체)
  getDoctors: async (): Promise<Doctor[]> => {
    try {
      // 실제 API 연동 시: return apiClient.get('/doctors');
      return dummyDoctors;
    } catch (error) {
      console.error('의사 목록 조회 실패:', error);
      throw new Error('의사 목록을 불러오는데 실패했습니다.');
    }
  },

  // 의사 상세 정보 조회
  getDoctorById: async (id: number): Promise<Doctor | undefined> => {
    try {
      // 실제 API 연동 시: return apiClient.get(`/doctors/${id}`);
      const doctor = dummyDoctors.find(doctor => doctor.id === id);
      if (!doctor) {
        throw new Error('해당 의사를 찾을 수 없습니다.');
      }
      return doctor;
    } catch (error) {
      console.error('의사 정보 조회 실패:', error);
      throw error;
    }
  },

  // 예약 가능 시간 조회 (닥터나우 스타일)
  getAvailableTimeSlots: async (doctorId: number, date: string): Promise<string[]> => {
    try {
      // 실제 API 연동 시: return apiClient.get(`/doctors/${doctorId}/available-times?date=${date}`);
      const doctor = await appointmentService.getDoctorById(doctorId);
      if (!doctor) {
        throw new Error('해당 의사를 찾을 수 없습니다.');
      }

      // 휴진일 체크
      if (doctor.unavailableDates.includes(date)) {
        return [];
      }

      const dayOfWeek = timeUtils.getDayOfWeek(date);
      const isHoliday = timeUtils.isHoliday(date);
      const isToday = timeUtils.isToday(date);
      const currentTime = timeUtils.getCurrentTime();

      // 요일에 따른 진료 시간 결정
      let workingHours;
      if (isHoliday) {
        workingHours = doctor.workingHours.holiday;
      } else if (dayOfWeek === 0) { // 일요일
        workingHours = doctor.workingHours.sunday;
      } else if (dayOfWeek === 6) { // 토요일
        workingHours = doctor.workingHours.saturday;
      } else { // 평일
        workingHours = doctor.workingHours.weekday;
      }

      const availableTimes: string[] = [];
      const startMinutes = timeUtils.timeToMinutes(workingHours.start);
      const endMinutes = timeUtils.timeToMinutes(workingHours.end);
      const currentMinutes = isToday ? timeUtils.timeToMinutes(currentTime) : 0;

      // 야간 진료 처리 (시작 시간이 종료 시간보다 큰 경우)
      if (startMinutes > endMinutes || (endMinutes <= 360 && startMinutes >= 1080)) { // 새벽 6시 이전 종료 & 오후 6시 이후 시작
        // 당일 시간 (시작 시간부터 자정까지)
        for (let minutes = startMinutes; minutes <= 1439; minutes += 30) { // 23:59까지
          const timeSlot = timeUtils.minutesToTime(minutes);
          
          if (isToday && minutes <= currentMinutes + 60) {
            continue;
          }

          availableTimes.push(timeSlot);
        }

        // 다음날 새벽 시간 (자정부터 종료 시간까지)
        if (endMinutes <= 360) { // 새벽 6시 이전까지만
          for (let minutes = 0; minutes <= endMinutes; minutes += 30) {
            const timeSlot = timeUtils.minutesToTime(minutes);
            availableTimes.push(timeSlot);
          }
        }
      } else {
        // 일반적인 시간 (토요일, 일요일, 공휴일)
        for (let minutes = startMinutes; minutes <= endMinutes; minutes += 30) {
          const timeSlot = timeUtils.minutesToTime(minutes);
          
          if (isToday && minutes <= currentMinutes + 60) {
            continue;
          }

          // 점심시간 제외 (12:00 ~ 13:00) - 24시간 운영이 아닌 경우만
          if (!(startMinutes === 0 && endMinutes === 1439) && minutes >= 720 && minutes < 780) {
            continue;
          }

          availableTimes.push(timeSlot);
        }
      }

      // 이미 예약된 시간 제외 (실제로는 DB에서 확인)
      const bookedTimes = ['20:00', '21:30', '02:00']; // 예시
      const finalTimes = availableTimes.filter(time => !bookedTimes.includes(time));

      return finalTimes.sort();
    } catch (error) {
      console.error('예약 가능 시간 조회 실패:', error);
      throw error;
    }
  },

  // 예약 생성
  createAppointment: async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'userId'>): Promise<{ success: boolean; appointmentId?: number; message: string }> => {
    try {
      // 실제 API 연동 시: return apiClient.post('/appointments', appointmentData);
      return await createAppointmentToAPI(appointmentData);
    } catch (error) {
      console.error('예약 생성 실패:', error);
      throw new Error('예약을 생성하는데 실패했습니다.');
    }
  },

  // 예약 내역 조회
  getAppointments: async (): Promise<Appointment[]> => {
    try {
      // 실제 API 연동 시: return apiClient.get('/appointments');
      return await getUserAppointmentsFromAPI(1); // 현재 사용자 ID = 1
    } catch (error) {
      console.error('예약 내역 조회 실패:', error);
      throw new Error('예약 내역을 불러오는데 실패했습니다.');
    }
  },

  // 예약 상태 업데이트
  updateAppointmentStatus: async (appointmentId: number, status: AppointmentStatus): Promise<{ success: boolean; message: string }> => {
    try {
      // 실제 API 연동 시: return apiClient.patch(`/appointments/${appointmentId}`, { status });
      const { updateAppointmentStatusFromAPI } = await import('../data/dummyAppointments');
      return await updateAppointmentStatusFromAPI(appointmentId, status);
    } catch (error) {
      console.error('예약 상태 업데이트 실패:', error);
      throw new Error('예약 상태를 업데이트하는데 실패했습니다.');
    }
  },

  // 예약 취소
  cancelAppointment: async (appointmentId: number): Promise<{ success: boolean; message: string }> => {
    try {
      // 실제 API 연동 시: return apiClient.delete(`/appointments/${appointmentId}`);
      const { cancelAppointmentToAPI } = await import('../data/dummyAppointments');
      return await cancelAppointmentToAPI(appointmentId);
    } catch (error) {
      console.error('예약 취소 실패:', error);
      throw new Error('예약을 취소하는데 실패했습니다.');
    }
  }
}; 