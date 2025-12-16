# 📱 Skin Patient App

환자용 피부 건강 관리 앱 - 피부 상태를 기록하고 의료진의 진단을 받을 수 있는 환자용 앱입니다.

## 📌 프로젝트 개요
### 기획 의도
- 최근 남성들의 화장품 및 피부 미용에 대한 관심이 증가함에 따라 맞춤형 화장품 및 관리 제품 팔요성 증대 
- 정확한 피부 분석 및 의사와의 상담 필요

### 차별화 포인트
- 의사의 비대면 진료를 통한 진료 및 약 처방 가능
- AI를 활용한 피부 분석을 통해 맞춤형 화장품 추천


## ✨ 주요 기능

### 🔬 AI 피부 분석
- **실시간 AI 피부 분석**: 사진 촬영으로 즉시 피부 상태 진단
- **분석 내역 저장**: 모든 AI 분석 결과를 자동으로 데이터베이스에 저장
- **분석 내역 조회**: 과거 분석 결과 조회 및 변화 추이 확인
- **상세 분석 정보**: 피부 타입, 고민사항, 추천사항, 신뢰도 점수 등 제공

### 🏥 의료진 상담
- **진료 요청서 작성**: 증상, 기간, 심각도 등 상세 정보 입력
- **온라인 예약**: 병원 및 의사 선택하여 예약
- **진단 내역 조회**: 과거 진료 기록 및 처방전 확인

### 💄 화장품 추천
- **AI 맞춤 추천**: 피부 분석 결과 기반 제품 추천
- **추천 내역 관리**: 과거 추천 결과 저장 및 조회
- **제품 상세 정보**: 가격, 리뷰, 성분 등 상세 정보 제공

---


## 🎯 기술 스택
- **Frontend**: 
- **Backend**: Python, Fast API, 
- **Database**: PostgreSQL, pinecone
- **보안 및 암호화**: 
- **Deployment**: 
- **AI**: kosebert, 

---
## 🗄️ 데이터베이스 구조

### AI 피부 분석 관련 테이블
- **skin_analysis_results**: AI 분석 결과 메인 테이블
- **skin_analysis_concerns**: 피부 고민사항 저장
- **skin_analysis_recommendations**: AI 추천사항 저장
- **skin_analysis_images**: 분석 이미지 메타데이터

자세한 데이터베이스 스키마는 [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)를 참조하세요.

---

## 🧑‍💻 팀원 및 역할

| 이름 (포지션) | 담당 업무 |
|:-------------|:-----|
| 이동우 (AI) |  |
| 이승현 (Front-end) |  |
| 이충민 (Full-Stack) |  |
| 진완규 (Back-end) | 화장품 추천 알고리즘 및 서버 구축 |

---
## 🛠 시스템 구조
<img width="1112" height="626" alt="Image" src="https://github.com/user-attachments/assets/61a8565f-f926-4a1f-82b3-507316557c99" />

<img width="1122" height="622" alt="Image" src="https://github.com/user-attachments/assets/58ab7807-6e7b-4a1a-a651-61db0996fc63" />

---
## 🔍 주요 기능 화면

<img width="1075" height="485" alt="Image" src="https://github.com/user-attachments/assets/ed79a8b2-a3b6-4d6e-95d1-a51fd3951a52" />

<img width="1080" height="480" alt="Image" src="https://github.com/user-attachments/assets/c78bf23d-74f5-4052-982a-be0151bb6cf8" />

<img width="1070" height="479" alt="Image" src="https://github.com/user-attachments/assets/e8e4650c-4e33-4dfc-adeb-f6f9631b4090" />

<img width="1073" height="481" alt="Image" src="https://github.com/user-attachments/assets/acd9b9cd-7378-4cd9-a6dd-64e4de58d762" />

<img width="1069" height="481" alt="Image" src="https://github.com/user-attachments/assets/7e363194-d420-4d3f-b88c-50195a1efe0e" />

<img width="1082" height="485" alt="Image" src="https://github.com/user-attachments/assets/0f9d4a4f-84f0-4f13-93f2-eeb8a9af4b53" />

<img width="1062" height="476" alt="Image" src="https://github.com/user-attachments/assets/33663bc9-eb63-413c-bc87-d98dbb0124d7" />

<img width="1075" height="475" alt="Image" src="https://github.com/user-attachments/assets/92a7d649-e81f-497b-848c-65ec7ec715b1" />



## 📱 앱 구조

```
src/
├── components/     # 재사용 가능한 UI 컴포넌트
├── screens/       # 화면별 컴포넌트
├── navigation/    # 네비게이션 설정
├── services/      # API 통신 로직
├── config/        # 앱 설정 및 상수
└── types/         # TypeScript 타입 정의
```

## 🚀 개발 환경 실행 가이드

### ✅ 1. 프로젝트 설정

```bash
npm install
```



### ✅ 2. 개발 서버 실행

**처음 설치 시 (한 번만 실행):**
```bash
npm run android:full  # adb reverse + 앱 빌드&설치
```

**개발 중 (매번 실행):**
```bash
npm run dev  # adb reverse + Metro 서버 시작
```

### ✅ 3. 포트 설정

- **환자 앱 Metro 서버**: `8082`
- **백엔드 API**: `8000`
- **의사 앱 Metro 서버**: `8081`

### ✅ 4. 사용 가능한 스크립트

```bash
npm run dev          # 개발 서버 시작 (adb reverse 포함)
npm run setup        # adb reverse 설정만
npm run start:patient # Metro 서버만 시작
npm run android      # 앱 빌드 & 실행
npm run android:full # 포트 설정 + 앱 빌드 & 실행
```

### ✅ 5. 포트 기본 설정
- 안드로이드의 경우
- 에뮬레이터에서 Ctrl + M(또는 Cmd + M on Mac) → Dev Settings → Debug server host & port for device 선택
- 10.0.2.2:8082 입력
- (에뮬레이터라면 10.0.2.2:8082 이지만, 단말기의 경우 localhost:8082)
- iOS의 경우
- 시뮬레이터에서 Cmd + D → Dev Settings → Debug server host & port for device에서 동일하게 설정

---
