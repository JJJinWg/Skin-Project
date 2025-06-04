# 📱 Skin Patient App

환자용 피부 건강 관리 앱 - 피부 상태를 기록하고 의료진의 진단을 받을 수 있는 환자용 앱입니다.

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

## 🗄️ 데이터베이스 구조

### AI 피부 분석 관련 테이블
- **skin_analysis_results**: AI 분석 결과 메인 테이블
- **skin_analysis_concerns**: 피부 고민사항 저장
- **skin_analysis_recommendations**: AI 추천사항 저장
- **skin_analysis_images**: 분석 이미지 메타데이터

자세한 데이터베이스 스키마는 [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)를 참조하세요.

---

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

---

## 🛠 GitHub 협업 가이드: 기능 개발부터 병합까지 (꼭 읽어주세요!)

이 프로젝트는 안정적인 협업을 위해 `main` 브랜치를 보호하고, 모든 작업을 **별도 브랜치 + Pull Request(PR)** 방식으로 관리합니다.

---

### ✅ 1. 기능 개발 시작 전

1. **main 최신화**
```bash
git checkout main
git pull origin main
```

2. **작업용 브랜치 생성**
```bash
git checkout -b feature/이름-작업내용
# 예: feature/jisu-review-cleaning
```
> `feature/`, `fix/`, `docs/` 등 prefix 사용 규칙 지켜주세요.

---

### ✅ 2. 기능 개발 중

1. **코드 작성**
   - 코드 수정/추가
   - 디렉토리 구조 유지

2. **변경사항 저장**
```bash
git add .
git commit -m "작업 내용 요약: mecab 기반 전처리 추가"
```
> 커밋 메시지는 **의미 있는 한 줄 설명**으로 남겨주세요.

3. **원격 브랜치 푸시**
```bash
git push origin feature/이름-작업내용
```

---

### ✅ 3. 기능 완료 후 PR 생성

1. GitHub 웹에서 `Pull Request` 클릭
2. `base`는 `main`, `compare`는 자신의 브랜치로 설정
3. PR 제목은 작업 요약 (예: `리뷰 전처리 기능 추가`)
4. 본문에는 **한 줄 기능 설명**, 참고 이슈, 변경파일 요약 등 작성
5. 팀원 리뷰어 지정

---

### ✅ 4. 코드 리뷰 & 피드백 반영

- 리뷰 요청 받은 팀원은 코드 확인 후 **승인 or 피드백 댓글**
- 필요시 추가 커밋 → PR에 자동 반영됨
```bash
git add .
git commit -m "리뷰 반영: 전처리 로직 분리"
git push
```

---

### ✅ 5. 병합(Merge) & 브랜치 삭제

- 리뷰 승인 ≥ 1명 완료되면 `main` 브랜치로 병합 (Squash 추천)
- 병합 후, 브랜치 삭제 (GitHub에서 버튼 제공됨)

---

### ✅ 6. Pull 후 다음 작업 준비

모든 병합이 끝났으면 다시 main을 pull 받아 최신 상태로 시작하세요:
```bash
git checkout main
git pull origin main
```

---

## 💡 브랜치 명명 규칙

| 작업 유형     | 브랜치 예시                      |
|--------------|----------------------------------|
| 기능 추가     | `feature/jay-login-api`          |
| 버그 수정     | `fix/jisu-db-connection`         |
| 문서/리드미   | `docs/update-readme`             |
| 테스트        | `test/yeon-model-validation`     |

---

## ❗주의 사항

- 절대 `main` 브랜치에서 직접 작업하지 마세요.
- 무조건 **기능 단위로 브랜치 생성 → PR → 머지** 순서로 진행합니다.
- 충돌 방지를 위해 작업 전 항상 `git pull origin main`을 먼저 하세요.
- 개발 시 반드시 `npm run dev`로 Metro 서버를 시작하세요.

---

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

---

이 가이드는 모든 기능 개발의 기본 루틴입니다.  
작업 전에 꼭 확인하고, 팀원 모두 동일한 흐름으로 협업해 주세요 🙏
