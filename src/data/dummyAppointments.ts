// 예약 관련 더미 데이터

export type AppointmentStatus = "예약대기" | "예약완료" | "진료완료" | "예약취소"

export interface Appointment {
  id: number
  doctorId: number
  doctorName: string
  date: string
  time: string
  status: AppointmentStatus
  symptoms: string
  images: string[]
  createdAt: string
  specialty?: string
  updatedAt?: string
  userId?: number
  hospitalName?: string
  appointmentType?: "온라인" | "방문"
}

// 더미 예약 데이터 (실제 API에서는 JSON 형태로 받아옴)
export const dummyAppointments: Appointment[] = [
  {
    id: 1,
    doctorId: 1,
    doctorName: "김의사",
    date: "2024-03-20",
    time: "10:00",
    status: "예약완료",
    symptoms: "여드름 치료 상담",
    images: ["symptom1.jpg"],
    createdAt: "2024-03-15T10:00:00Z",
    specialty: "피부과",
    userId: 1,
    hospitalName: "서울피부과",
    appointmentType: "방문"
  },
  {
    id: 2,
    doctorId: 2,
    doctorName: "이의사",
    date: "2024-03-22",
    time: "14:00",
    status: "예약대기",
    symptoms: "아토피 상담",
    images: ["symptom2.jpg"],
    createdAt: "2024-03-16T15:30:00Z",
    specialty: "알레르기",
    userId: 1,
    hospitalName: "연세피부과",
    appointmentType: "온라인"
  },
  {
    id: 3,
    doctorId: 3,
    doctorName: "박의사",
    date: "2024-03-18",
    time: "16:30",
    status: "진료완료",
    symptoms: "피부 트러블 상담",
    images: [],
    createdAt: "2024-03-10T09:20:00Z",
    updatedAt: "2024-03-18T17:00:00Z",
    specialty: "피부과",
    userId: 1,
    hospitalName: "강남피부과",
    appointmentType: "방문"
  },
  {
    id: 4,
    doctorId: 4,
    doctorName: "최의사",
    date: "2024-03-25",
    time: "11:00",
    status: "예약완료",
    symptoms: "성형 상담",
    images: [],
    createdAt: "2024-03-17T14:15:00Z",
    specialty: "성형외과",
    userId: 1,
    hospitalName: "청담성형외과",
    appointmentType: "방문"
  },
  {
    id: 5,
    doctorId: 1,
    doctorName: "김의사",
    date: "2024-03-12",
    time: "15:00",
    status: "예약취소",
    symptoms: "여드름 재진",
    images: [],
    createdAt: "2024-03-08T11:30:00Z",
    updatedAt: "2024-03-11T10:45:00Z",
    specialty: "피부과",
    userId: 1,
    hospitalName: "서울피부과",
    appointmentType: "온라인"
  },
  {
    id: 6,
    doctorId: 5,
    doctorName: "정의사",
    date: "2024-03-28",
    time: "13:30",
    status: "예약완료",
    symptoms: "건강 검진 상담",
    images: [],
    createdAt: "2024-03-19T16:20:00Z",
    specialty: "내과",
    userId: 1,
    hospitalName: "서울내과",
    appointmentType: "방문"
  }
]

// API 응답 시뮬레이션 함수
export const getAppointmentsFromAPI = async (): Promise<Appointment[]> => {
  // 실제 API 호출 시뮬레이션
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 실제 구현 시:
  // const response = await fetch('/api/appointments')
  // const data = await response.json()
  // return data.appointments
  
  return dummyAppointments.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

// 사용자별 예약 조회 API 시뮬레이션
export const getUserAppointmentsFromAPI = async (userId: number): Promise<Appointment[]> => {
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // 실제 구현 시:
  // const response = await fetch(`/api/users/${userId}/appointments`)
  // const data = await response.json()
  // return data.appointments
  
  return dummyAppointments
    .filter(appointment => appointment.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// 예약 생성 API 시뮬레이션
export const createAppointmentToAPI = async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'userId'>): Promise<{ success: boolean; appointmentId?: number; message: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // 실제 구현 시:
  // const response = await fetch('/api/appointments', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(appointmentData)
  // })
  // const data = await response.json()
  // return data
  
  const appointmentId = Math.floor(Math.random() * 10000) + 1000
  
  return {
    success: true,
    appointmentId,
    message: '예약이 성공적으로 생성되었습니다.'
  }
}

// 예약 상태 업데이트 API 시뮬레이션
export const updateAppointmentStatusFromAPI = async (appointmentId: number, status: AppointmentStatus): Promise<{ success: boolean; message: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 실제 구현 시:
  // const response = await fetch(`/api/appointments/${appointmentId}/status`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ status })
  // })
  // const data = await response.json()
  // return data
  
  return {
    success: true,
    message: `예약 상태가 '${status}'로 변경되었습니다.`
  }
}

// 예약 취소 API 시뮬레이션
export const cancelAppointmentToAPI = async (appointmentId: number): Promise<{ success: boolean; message: string }> => {
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // 실제 구현 시:
  // const response = await fetch(`/api/appointments/${appointmentId}/cancel`, {
  //   method: 'PUT'
  // })
  // const data = await response.json()
  // return data
  
  return {
    success: true,
    message: '예약이 성공적으로 취소되었습니다.'
  }
}

// 예약 상세 조회 API 시뮬레이션
export const getAppointmentByIdFromAPI = async (appointmentId: number): Promise<Appointment | null> => {
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 실제 구현 시:
  // const response = await fetch(`/api/appointments/${appointmentId}`)
  // const data = await response.json()
  // return data.appointment
  
  return dummyAppointments.find(appointment => appointment.id === appointmentId) || null
} 