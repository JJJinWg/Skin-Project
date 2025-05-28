# 📊 데이터 관리 구조

이 폴더는 앱의 모든 더미 데이터와 API 시뮬레이션을 관리합니다.

## 📁 파일 구조

```
src/data/
├── index.ts              # 중앙 관리 파일 (모든 데이터 export)
├── dummyData.ts          # 기본 데이터 (의사, 제품, 전문분야 등)
├── dummyReviews.ts       # 리뷰 관련 데이터 및 API 시뮬레이션
├── dummyDiagnosis.ts     # 진료 요청서 관련 데이터 및 API 시뮬레이션
├── dummyAppointments.ts  # 예약 관련 데이터 및 API 시뮬레이션
└── README.md            # 이 파일
```

## 🔄 데이터 흐름

### 1. 더미 데이터 → API 시뮬레이션 → 서비스 → 화면

```typescript
// 예시: 리뷰 데이터 흐름
dummyReviews (dummyReviews.ts) 
  → getUserReviewsFromAPI() (API 시뮬레이션)
  → reviewService.getUserReviews() (서비스 레이어)
  → ProfileScreen.tsx (화면)
```

### 2. 실제 API 연동 시 변경 사항

```typescript
// 현재 (더미 데이터)
const reviews = await getUserReviewsFromAPI(userId)

// 실제 API 연동 시
const response = await fetch(`/api/users/${userId}/reviews`)
const reviews = await response.json()
```

## 📋 데이터 타입

### 리뷰 (Review)
```typescript
interface Review {
  id: number
  productId: number
  productName: string
  productImage: any
  rating: number
  content: string
  date: string
  images?: string[]
  likes: number
  helpful: number
  userId?: number
  userName?: string
}
```

### 진료 요청서 (DiagnosisRequest)
```typescript
interface DiagnosisRequest {
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
```

### 예약 (Appointment)
```typescript
interface Appointment {
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
```

## 🚀 API 시뮬레이션 함수들

### 리뷰 API
- `getReviewsFromAPI()`: 모든 리뷰 조회
- `getUserReviewsFromAPI(userId)`: 사용자별 리뷰 조회
- `getProductReviewsFromAPI(productId)`: 제품별 리뷰 조회

### 진료 요청서 API
- `getDiagnosisRequestsFromAPI()`: 모든 진료 요청서 조회
- `getUserDiagnosisRequestsFromAPI(userId)`: 사용자별 진료 요청서 조회
- `getDiagnosisRequestByIdFromAPI(requestId)`: 진료 요청서 상세 조회
- `submitDiagnosisRequestToAPI(data)`: 진료 요청서 제출
- `updateDiagnosisRequestStatusFromAPI(id, status)`: 상태 업데이트

### 예약 API
- `getAppointmentsFromAPI()`: 모든 예약 조회
- `getUserAppointmentsFromAPI(userId)`: 사용자별 예약 조회
- `getAppointmentByIdFromAPI(appointmentId)`: 예약 상세 조회
- `createAppointmentToAPI(data)`: 예약 생성
- `updateAppointmentStatusFromAPI(id, status)`: 예약 상태 업데이트
- `cancelAppointmentToAPI(id)`: 예약 취소

## 🔧 사용 방법

### 1. 중앙 관리 파일에서 import
```typescript
import { dummyReviews, getUserReviewsFromAPI, type Review } from '../data'
```

### 2. 개별 파일에서 import
```typescript
import { getUserReviewsFromAPI, type Review } from '../data/dummyReviews'
```

### 3. mockAPI 객체 사용
```typescript
import { mockAPI } from '../data'

const reviews = await mockAPI.reviews.getByUser(userId)
const appointments = await mockAPI.appointments.getByUser(userId)
```

## 🌐 실제 API 연동 준비

### 1. API 설정
```typescript
// src/data/index.ts
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'https://api.skincare-app.com',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
}
```

### 2. API 헬퍼 함수
```typescript
import { apiHelpers } from '../data'

// GET 요청
const reviews = await apiHelpers.get<Review[]>('/reviews')

// POST 요청
const result = await apiHelpers.post<{success: boolean}>('/reviews', reviewData)
```

## 📝 주의사항

1. **타입 안정성**: 모든 데이터는 TypeScript 타입으로 정의되어 있습니다.
2. **API 시뮬레이션**: 실제 네트워크 지연을 시뮬레이션하기 위해 `setTimeout`을 사용합니다.
3. **데이터 일관성**: 모든 더미 데이터는 현실적이고 일관된 형태로 작성되었습니다.
   - 의사 이름: 김의사, 이의사, 박의사, 최의사, 정의사, 강의사 (한국어 통일)
   - 병원 이름: 서울피부과, 연세피부과, 강남피부과, 청담성형외과, 서울내과, 알레르기클리닉
   - 전문분야: 피부과, 알레르기, 성형외과, 내과
4. **확장성**: 새로운 데이터 타입이나 API가 필요한 경우 동일한 패턴으로 추가할 수 있습니다.

## 🔄 실제 API 연동 시 변경 사항

1. **서비스 파일 수정**: 각 서비스 파일에서 더미 API 호출을 실제 API 호출로 변경
2. **에러 처리**: 실제 네트워크 에러 및 HTTP 상태 코드 처리 추가
3. **인증**: JWT 토큰 등 인증 헤더 추가
4. **환경 변수**: API URL 및 설정을 환경 변수로 관리

이 구조를 통해 프론트엔드 개발을 완료한 후, 백엔드 API가 준비되면 최소한의 변경으로 실제 API와 연동할 수 있습니다. 