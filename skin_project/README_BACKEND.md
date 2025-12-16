# 🔬 AI 피부 분석 백엔드 구현 가이드

AI 피부 분석 결과를 저장하고 조회하는 백엔드 API가 구현되었습니다.

---

## 📋 구현된 기능

### 1. **데이터베이스 테이블**
- `skin_analysis_results`: AI 분석 결과 메인 테이블
- `skin_analysis_concerns`: 피부 고민사항 저장
- `skin_analysis_recommendations`: AI 추천사항 저장  
- `skin_analysis_images`: 분석 이미지 메타데이터

### 2. **API 엔드포인트**
- `POST /api/skin-analysis/save`: 분석 결과 저장
- `GET /api/skin-analysis/history/{user_id}`: 사용자 분석 내역 조회
- `GET /api/skin-analysis/{analysis_id}`: 특정 분석 결과 상세 조회
- `DELETE /api/skin-analysis/{analysis_id}`: 분석 결과 삭제

### 3. **기존 AI 분석 API**
- `POST /api/ai/analyze-skin`: 실시간 AI 피부 분석 (이미지 업로드)

---

## 🚀 설정 및 실행 방법

### 방법 1: 기존 `init` 엔드포인트 사용 (권장) ⭐
가장 간단한 방법으로, AI 피부 분석 테이블이 자동으로 포함됩니다:

```bash
# 백엔드 서버 실행
cd skin_project
python main.py

# POST 요청으로 데이터베이스 완전 초기화
curl -X POST http://localhost:8000/api/database/init
```

✅ **init 엔드포인트가 자동으로 처리하는 것들:**
- 기존 데이터 완전 삭제
- 모든 테이블 생성 (AI 피부 분석 테이블 포함)
- 기본 데이터 추가
- 실제 크롤링 제품 및 리뷰 데이터 import
- 인덱스 최적화

### 방법 2: 수동으로 AI 피부 분석 테이블만 생성

AI 피부 분석 관련 테이블들만 따로 생성하고 싶다면:

```bash
cd skin_project
python create_skin_analysis_tables.py
```

성공하면 다음과 같은 메시지가 출력됩니다:
```
🎉 AI 피부 분석 테이블 생성 완료!
🎉 모든 설정이 완료되었습니다!
```

### 3. **백엔드 서버 실행**

```bash
cd skin_project
python main.py
```

서버가 시작되면 AI 모델도 자동으로 로딩됩니다:
```
🚀 서버 시작 - AI 모델 로딩 중...
✅ AI 모델 로딩 완료!
 * Running on http://0.0.0.0:8000
```

---

## 🧪 테스트

### 1. **AI 피부 분석 테이블 생성 확인**
```bash
curl http://localhost:8000/api/skin-analysis/history/1
```

### 2. **AI 피부 분석 실행**
```bash
curl -X POST -F "image=@test_skin_image.jpg" http://localhost:8000/api/ai/analyze-skin
```

### 3. **분석 결과 저장 테스트**
```bash
curl -X POST http://localhost:8000/api/skin-analysis/save \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "image_url": "test.jpg",
    "skin_type": "지성",
    "concerns": ["여드름", "모공"],
    "recommendations": ["순한 세안제 사용", "보습 필수"]
  }'
```

---

## 📊 데이터베이스 상세 스키마

### `skin_analysis_results` (메인 테이블)
- **id**: 분석 결과 고유 ID
- **user_id**: 사용자 ID  
- **image_url**: 분석한 이미지 URL
- **analysis_date**: 분석 수행 일시
- **skin_type**: AI가 판정한 피부 타입
- **skin_age, moisture_score, wrinkles_score** 등: 각종 피부 점수 (0-100)
- **confidence**: AI 판정 신뢰도

### `skin_analysis_concerns` (고민사항)
- **analysis_id**: 분석 결과 ID (FK)
- **concern**: 피부 고민 ("여드름", "색소침착" 등)
- **severity**: 심각도 (low/medium/high)

### `skin_analysis_recommendations` (추천사항)
- **analysis_id**: 분석 결과 ID (FK)
- **recommendation_type**: 추천 타입 (skincare/lifestyle/medical/product)
- **recommendation_text**: 구체적인 추천 내용
- **priority**: 우선순위

### `skin_analysis_images` (이미지 메타데이터)
- **analysis_id**: 분석 결과 ID (FK)
- **original_filename**: 원본 파일명
- **file_size, image_width, image_height**: 파일 정보

---

## 🔗 프론트엔드 연동

프론트엔드에서는 다음과 같이 사용할 수 있습니다:

```typescript
// src/services/diagnosisService.ts에 이미 구현됨
import { diagnosisService } from '../services/diagnosisService';

// AI 분석 후 결과 저장
await diagnosisService.saveSkinAnalysisResult({
  user_id: 1,
  image_url: imageUrl,
  skin_type: analysisResult.skinType,
  concerns: analysisResult.concerns,
  recommendations: analysisResult.recommendations
});

// 사용자 분석 내역 조회
const history = await diagnosisService.getSkinAnalysisHistory(1);
```

---

## ✅ 완료 확인

모든 설정이 완료되면 다음이 가능합니다:

1. **실시간 AI 피부 분석**: 이미지 업로드로 즉시 분석
2. **분석 결과 자동 저장**: 모든 분석 결과가 데이터베이스에 저장
3. **분석 내역 조회**: 과거 분석 결과 조회 및 비교
4. **상세 분석 정보**: 피부 점수, 고민사항, 추천사항 등 체계적 관리

🎉 **이제 완전한 AI 피부 분석 시스템이 준비되었습니다!** 