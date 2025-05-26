 

// 제품 목록 임시 데이터 (HomeScreen용)
export const dummyProducts = [
  { id: 1, name: "Beplain", rating: 4.44, reviews: 128, image: require("../assets/product1.png") },
  { id: 2, name: "Torriden", rating: 3.57, reviews: 86, image: require("../assets/product2.png") },
];

// 전문분야 목록 임시 데이터
export const dummySpecialties = [
  { id: "all", name: "전체" },
  { id: "dermatology", name: "피부과" },
  { id: "allergy", name: "알레르기" },
  { id: "cosmetic", name: "성형외과" },
  { id: "internal", name: "내과" },
];

// 통합된 의사 목록 임시 데이터 (상세 정보 포함)
export const dummyDoctors = [
  {
    id: 1,
    name: "김의사",
    specialty: "피부과",
    hospital: "서울피부과",
    rating: 4.9,
    reviews: 124,
    available: true,
    nextAvailable: "오늘 17:30",
    image: require("../assets/doctor1.png"),
    description: "10년 이상의 피부과 전문의 경력을 가진 의사입니다.",
    education: ["서울대학교 의과대학", "서울대학교 대학원 피부과학"],
    experience: ["서울대학교병원 피부과", "삼성서울병원 피부과"],
    unavailableDates: ["2024-03-25", "2024-03-30"], // 휴진일
    workingHours: {
      weekday: { start: "19:00", end: "22:00" }, // 평일: 저녁 7시 ~ 10시 (3시간)
      saturday: { start: "14:00", end: "18:00" }, // 토요일: 오후 2시 ~ 6시
      sunday: { start: "10:00", end: "16:00" }, // 일요일: 오전 10시 ~ 오후 4시
      holiday: { start: "09:00", end: "17:00" } // 공휴일: 오전 9시 ~ 오후 5시
    }
  },
  {
    id: 2,
    name: "이의사",
    specialty: "알레르기",
    hospital: "연세피부과",
    rating: 4.7,
    reviews: 98,
    available: true,
    nextAvailable: "내일 10:00",
    image: require("../assets/doctor2.png"),
    description: "여드름과 아토피 치료에 특화된 피부과 전문의입니다.",
    education: ["연세대학교 의과대학", "연세대학교 대학원 피부과학"],
    experience: ["연세대학교병원 피부과", "세브란스병원 피부과"],
    unavailableDates: ["2024-03-24", "2024-03-31"], // 휴진일
    workingHours: {
      weekday: { start: "20:00", end: "23:00" }, // 평일: 저녁 8시 ~ 11시 (늦은 시간 전문)
      saturday: { start: "15:00", end: "19:00" }, // 토요일: 오후 3시 ~ 7시
      sunday: { start: "13:00", end: "18:00" }, // 일요일: 오후 1시 ~ 6시
      holiday: { start: "10:00", end: "15:00" } // 공휴일: 오전 10시 ~ 오후 3시
    }
  },
  {
    id: 3,
    name: "박의사",
    specialty: "피부과",
    hospital: "강남피부과",
    rating: 4.8,
    reviews: 156,
    available: false,
    nextAvailable: "모레 13:30",
    image: require("../assets/doctor3.png"),
    description: "피부 미용과 치료를 전문으로 하는 의사입니다.",
    education: ["고려대학교 의과대학", "고려대학교 대학원 피부과학"],
    experience: ["고려대학교병원 피부과", "강남세브란스병원 피부과"],
    unavailableDates: ["2024-03-26", "2024-04-01"], // 휴진일
    workingHours: {
      weekday: { start: "18:30", end: "21:30" }, // 평일: 저녁 6시 30분 ~ 9시 30분
      saturday: { start: "13:30", end: "17:30" }, // 토요일: 오후 1시 30분 ~ 5시 30분
      sunday: { start: "14:00", end: "19:00" }, // 일요일: 오후 2시 ~ 7시
      holiday: { start: "11:00", end: "16:00" } // 공휴일: 오전 11시 ~ 오후 4시
    }
  },
  {
    id: 4,
    name: "최의사",
    specialty: "성형외과",
    hospital: "청담성형외과",
    rating: 4.6,
    reviews: 87,
    available: true,
    nextAvailable: "오늘 15:00",
    image: require("../assets/doctor4.png"),
    description: "성형외과 전문의로 안전한 시술을 제공합니다.",
    education: ["성균관대학교 의과대학", "성균관대학교 대학원 성형외과학"],
    experience: ["삼성서울병원 성형외과", "청담성형외과"],
    unavailableDates: ["2024-03-27", "2024-04-02"], // 휴진일
    workingHours: {
      weekday: { start: "18:00", end: "02:00" }, // 평일: 저녁 6시 ~ 새벽 2시 (야간 전문)
      saturday: { start: "13:00", end: "22:00" }, // 토요일: 오후 1시 ~ 10시
      sunday: { start: "15:00", end: "21:00" }, // 일요일: 오후 3시 ~ 9시
      holiday: { start: "12:00", end: "20:00" } // 공휴일: 낮 12시 ~ 저녁 8시
    }
  },
  {
    id: 5,
    name: "정의사",
    specialty: "내과",
    hospital: "서울내과",
    rating: 4.5,
    reviews: 112,
    available: true,
    nextAvailable: "내일 11:30",
    image: require("../assets/doctor1.png"),
    description: "내과 전문의로 종합적인 건강 관리를 제공합니다.",
    education: ["서울대학교 의과대학", "서울대학교 대학원 내과학"],
    experience: ["서울대학교병원 내과", "서울내과"],
    unavailableDates: ["2024-03-28", "2024-04-03"], // 휴진일
    workingHours: {
      weekday: { start: "19:30", end: "01:00" }, // 평일: 저녁 7시 30분 ~ 새벽 1시 (야간 진료)
      saturday: { start: "14:30", end: "20:30" }, // 토요일: 오후 2시 30분 ~ 8시 30분
      sunday: { start: "16:00", end: "22:00" }, // 일요일: 오후 4시 ~ 10시
      holiday: { start: "13:00", end: "19:00" } // 공휴일: 오후 1시 ~ 7시
    }
  },
  {
    id: 6,
    name: "강의사",
    specialty: "알레르기",
    hospital: "알레르기클리닉",
    rating: 4.3,
    reviews: 76,
    available: false,
    nextAvailable: "모레 09:00",
    image: require("../assets/doctor2.png"),
    description: "알레르기 질환 전문 치료를 제공하는 의사입니다.",
    education: ["연세대학교 의과대학", "연세대학교 대학원 알레르기학"],
    experience: ["세브란스병원 알레르기내과", "알레르기클리닉"],
    unavailableDates: ["2024-03-29", "2024-04-04"], // 휴진일
    workingHours: {
      weekday: { start: "21:00", end: "24:00" }, // 평일: 밤 9시 ~ 자정 (늦은 시간 특화)
      saturday: { start: "16:00", end: "20:00" }, // 토요일: 오후 4시 ~ 8시
      sunday: { start: "18:00", end: "23:00" }, // 일요일: 저녁 6시 ~ 11시
      holiday: { start: "14:00", end: "18:00" } // 공휴일: 오후 2시 ~ 6시
    }
  }
];

// 예약 가능 시간대 임시 데이터
export const dummyTimeSlots = [
  { id: 1, time: "09:00", available: true },
  { id: 2, time: "10:00", available: true },
  { id: 3, time: "11:00", available: false },
  { id: 4, time: "13:00", available: true },
  { id: 5, time: "14:00", available: true },
  { id: 6, time: "15:00", available: false },
  { id: 7, time: "16:00", available: true }
];

// 예약 내역 임시 데이터
export const dummyAppointments: Appointment[] = [
  {
    id: 1,
    doctorId: 1,
    doctorName: "김의사",
    date: "2024-03-20",
    time: "10:00",
    status: "예약완료" as AppointmentStatus,
    symptoms: "여드름 치료 상담",
    images: ["symptom1.jpg"],
    createdAt: "2024-03-15T10:00:00Z"
  },
  {
    id: 2,
    doctorId: 2,
    doctorName: "이의사",
    date: "2024-03-22",
    time: "14:00",
    status: "예약대기" as AppointmentStatus,
    symptoms: "아토피 상담",
    images: ["symptom2.jpg"],
    createdAt: "2024-03-16T15:30:00Z"
  }
];

// 예약 상태 타입
export type AppointmentStatus = "예약대기" | "예약완료" | "진료완료" | "예약취소";

// 예약 데이터 타입
export interface Appointment {
  id: number;
  doctorId: number;
  doctorName: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  symptoms: string;
  images: string[];
  createdAt: string;
  specialty?: string; // 선택적 필드
  updatedAt?: string; // 선택적 필드
}

// 의사 데이터 타입
export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  hospital: string;
  rating: number;
  reviews: number;
  available: boolean;
  nextAvailable: string;
  image: any;
  description: string;
  education: string[];
  experience: string[];
  unavailableDates: string[]; // 휴진일
  workingHours: {
    weekday: { start: string; end: string };
    saturday: { start: string; end: string };
    sunday: { start: string; end: string };
    holiday: { start: string; end: string };
  };
}

// 시간대 데이터 타입
export interface TimeSlot {
  id: number;
  time: string;
  available: boolean;
} 