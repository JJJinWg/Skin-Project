// 진료 요청서 관련 더미 데이터

export interface DiagnosisRequest {
  id: number
  symptoms: string
  duration: string
  severity: "mild" | "moderate" | "severe"
  previousTreatment: string
  allergies: string
  medications: string
  additionalNotes: string
  images: Array<{
    uri: string
    type: string
    name: string
  }>
  status: "제출됨" | "검토중" | "완료" | "취소"
  createdAt: string
  updatedAt?: string
  userId?: number
  assignedDoctorId?: number
  assignedDoctorName?: string
}

// 더미 진료 요청서 데이터 (실제 API에서는 JSON 형태로 받아옴)
export const dummyDiagnosisRequests: DiagnosisRequest[] = [
  {
    id: 9001,
    symptoms: "얼굴에 붉은 발진과 가려움증이 지속됩니다",
    duration: "1주일째",
    severity: "moderate",
    previousTreatment: "약국에서 구입한 연고 사용",
    allergies: "특정 화장품에 알레르기 있음",
    medications: "없음",
    additionalNotes: "스트레스를 받을 때 더 심해지는 것 같습니다",
    images: [],
    status: "검토중",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-16T14:20:00Z",
    userId: 1,
    assignedDoctorId: 1,
    assignedDoctorName: "김의사"
  },
  {
    id: 9002,
    symptoms: "여드름이 계속 생기고 흉터가 남습니다",
    duration: "3개월째",
    severity: "severe",
    previousTreatment: "피부과 치료 받았으나 재발",
    allergies: "없음",
    medications: "비타민 C 복용 중",
    additionalNotes: "생리 주기와 관련이 있는 것 같습니다",
    images: [],
    status: "완료",
    createdAt: "2024-01-10T09:15:00Z",
    updatedAt: "2024-01-12T16:45:00Z",
    userId: 1,
    assignedDoctorId: 2,
    assignedDoctorName: "이의사"
  },
  {
    id: 9003,
    symptoms: "아토피로 인한 심한 가려움과 건조함",
    duration: "2주일째",
    severity: "severe",
    previousTreatment: "스테로이드 연고 사용",
    allergies: "먼지, 꽃가루 알레르기",
    medications: "항히스타민제 복용 중",
    additionalNotes: "밤에 가려움이 더 심해져서 잠을 못 잡니다",
    images: [],
    status: "제출됨",
    createdAt: "2024-01-18T15:45:00Z",
    userId: 1
  },
  {
    id: 9004,
    symptoms: "얼굴 전체에 작은 뾰루지가 많이 생겼습니다",
    duration: "5일째",
    severity: "mild",
    previousTreatment: "세안제만 바꿔서 사용",
    allergies: "없음",
    medications: "없음",
    additionalNotes: "새로운 화장품을 사용한 후부터 생긴 것 같습니다",
    images: [],
    status: "검토중",
    createdAt: "2024-01-20T11:20:00Z",
    updatedAt: "2024-01-21T09:30:00Z",
    userId: 1,
    assignedDoctorId: 3,
    assignedDoctorName: "박의사"
  },
  {
    id: 9005,
    symptoms: "입 주변에 헤르페스 같은 물집이 생겼습니다",
    duration: "3일째",
    severity: "moderate",
    previousTreatment: "없음",
    allergies: "없음",
    medications: "없음",
    additionalNotes: "처음 생긴 증상이라 걱정됩니다",
    images: [],
    status: "완료",
    createdAt: "2024-01-08T14:10:00Z",
    updatedAt: "2024-01-09T16:25:00Z",
    userId: 1,
    assignedDoctorId: 1,
    assignedDoctorName: "김의사"
  }
]

// API 응답 시뮬레이션 함수
export const getDiagnosisRequestsFromAPI = async (): Promise<DiagnosisRequest[]> => {
  // 실제 API 호출 시뮬레이션
  await new Promise(resolve => setTimeout(resolve, 1200))
  
  // 실제 구현 시:
  // const response = await fetch('/api/diagnosis/requests')
  // const data = await response.json()
  // return data.requests
  
  return dummyDiagnosisRequests.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

// 사용자별 진료 요청서 조회 API 시뮬레이션
export const getUserDiagnosisRequestsFromAPI = async (userId: number): Promise<DiagnosisRequest[]> => {
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // 실제 구현 시:
  // const response = await fetch(`/api/users/${userId}/diagnosis/requests`)
  // const data = await response.json()
  // return data.requests
  
  return dummyDiagnosisRequests
    .filter(request => request.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// 진료 요청서 상세 조회 API 시뮬레이션
export const getDiagnosisRequestByIdFromAPI = async (requestId: number): Promise<DiagnosisRequest | null> => {
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 실제 구현 시:
  // const response = await fetch(`/api/diagnosis/requests/${requestId}`)
  // const data = await response.json()
  // return data.request
  
  return dummyDiagnosisRequests.find(request => request.id === requestId) || null
}

// 진료 요청서 제출 API 시뮬레이션
export const submitDiagnosisRequestToAPI = async (requestData: Omit<DiagnosisRequest, 'id' | 'status' | 'createdAt' | 'userId'>): Promise<{ success: boolean; requestId?: number; message: string }> => {
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // 실제 구현 시:
  // const response = await fetch('/api/diagnosis/requests', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(requestData)
  // })
  // const data = await response.json()
  // return data
  
  const requestId = Math.floor(Math.random() * 10000) + 10000
  
  return {
    success: true,
    requestId,
    message: '진료 요청서가 성공적으로 제출되었습니다.'
  }
}

// 진료 요청서 상태 업데이트 API 시뮬레이션
export const updateDiagnosisRequestStatusFromAPI = async (requestId: number, status: DiagnosisRequest['status']): Promise<{ success: boolean; message: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 실제 구현 시:
  // const response = await fetch(`/api/diagnosis/requests/${requestId}/status`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ status })
  // })
  // const data = await response.json()
  // return data
  
  return {
    success: true,
    message: `진료 요청서 상태가 '${status}'로 변경되었습니다.`
  }
} 