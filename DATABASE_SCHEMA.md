# AI 피부 분석 데이터베이스 스키마

## 1. AI 피부 분석 결과 테이블 (skin_analysis_results)

AI 분석 결과를 저장하는 메인 테이블입니다.

```sql
CREATE TABLE skin_analysis_results (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '사용자 ID',
    image_url VARCHAR(500) NOT NULL COMMENT '분석된 피부 이미지 URL',
    analysis_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '분석 수행 일시',
    
    -- AI 분석 기본 결과
    skin_type VARCHAR(50) NOT NULL COMMENT '피부 타입 (건성, 지성, 복합성, 민감성 등)',
    skin_disease VARCHAR(100) NULL COMMENT '피부 질환 (있다면)',
    skin_state VARCHAR(100) NULL COMMENT '피부 상태',
    needs_medical_attention BOOLEAN DEFAULT FALSE COMMENT '의료진 상담 필요 여부',
    
    -- AI 분석 점수 (0-100 점수)
    skin_age INT NULL COMMENT '피부 나이',
    moisture_score INT NULL COMMENT '수분 점수',
    wrinkles_score INT NULL COMMENT '주름 점수', 
    pigmentation_score INT NULL COMMENT '색소침착 점수',
    pores_score INT NULL COMMENT '모공 점수',
    acne_score INT NULL COMMENT '여드름 점수',
    
    -- AI 신뢰도 점수 (0.0-1.0)
    skin_type_confidence DECIMAL(3,2) NULL COMMENT '피부 타입 판정 신뢰도',
    disease_confidence DECIMAL(3,2) NULL COMMENT '질환 판정 신뢰도', 
    state_confidence DECIMAL(3,2) NULL COMMENT '상태 판정 신뢰도',
    
    -- JSON 형태의 상세 분석 데이터
    detailed_analysis JSON NULL COMMENT 'AI 모델의 상세 분석 결과 (JSON)',
    
    -- 타임스탬프
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- 인덱스
    INDEX idx_user_id (user_id),
    INDEX idx_analysis_date (analysis_date),
    INDEX idx_skin_type (skin_type),
    INDEX idx_needs_medical_attention (needs_medical_attention),
    
    -- 외래키 (users 테이블이 존재한다고 가정)
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) COMMENT 'AI 피부 분석 결과 저장 테이블';
```

## 2. 피부 고민사항 테이블 (skin_analysis_concerns)

분석된 피부 고민사항을 저장하는 테이블입니다.

```sql
CREATE TABLE skin_analysis_concerns (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    analysis_id BIGINT NOT NULL COMMENT '피부 분석 결과 ID',
    concern VARCHAR(100) NOT NULL COMMENT '피부 고민 (여드름, 주름, 색소침착 등)',
    severity ENUM('low', 'medium', 'high') DEFAULT 'medium' COMMENT '심각도',
    confidence_score DECIMAL(3,2) NULL COMMENT '해당 고민 판정의 신뢰도',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_analysis_id (analysis_id),
    INDEX idx_concern (concern),
    INDEX idx_severity (severity),
    
    FOREIGN KEY (analysis_id) REFERENCES skin_analysis_results(id) ON DELETE CASCADE
) COMMENT '피부 분석 고민사항 저장 테이블';
```

## 3. AI 추천사항 테이블 (skin_analysis_recommendations)

AI가 제안하는 피부 관리 추천사항을 저장하는 테이블입니다.

```sql
CREATE TABLE skin_analysis_recommendations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    analysis_id BIGINT NOT NULL COMMENT '피부 분석 결과 ID',
    recommendation_type ENUM('skincare', 'lifestyle', 'medical', 'product') NOT NULL COMMENT '추천 유형',
    recommendation_text TEXT NOT NULL COMMENT '추천 내용',
    priority INT DEFAULT 1 COMMENT '우선순위 (1=높음, 2=보통, 3=낮음)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_analysis_id (analysis_id),
    INDEX idx_recommendation_type (recommendation_type),
    INDEX idx_priority (priority),
    
    FOREIGN KEY (analysis_id) REFERENCES skin_analysis_results(id) ON DELETE CASCADE
) COMMENT 'AI 피부 관리 추천사항 저장 테이블';
```

## 4. 분석 이미지 메타데이터 테이블 (skin_analysis_images)

분석에 사용된 이미지의 메타데이터를 저장하는 테이블입니다.

```sql
CREATE TABLE skin_analysis_images (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    analysis_id BIGINT NOT NULL COMMENT '피부 분석 결과 ID',
    original_filename VARCHAR(255) NULL COMMENT '원본 파일명',
    file_size BIGINT NULL COMMENT '파일 크기 (bytes)',
    image_width INT NULL COMMENT '이미지 너비',
    image_height INT NULL COMMENT '이미지 높이',
    image_format VARCHAR(20) NULL COMMENT '이미지 포맷 (jpg, png 등)',
    upload_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '업로드 시간',
    
    INDEX idx_analysis_id (analysis_id),
    
    FOREIGN KEY (analysis_id) REFERENCES skin_analysis_results(id) ON DELETE CASCADE
) COMMENT '피부 분석 이미지 메타데이터 테이블';
```

## 5. API 엔드포인트 정의

### 5.1 피부 분석 결과 저장
```
POST /api/skin-analysis/save
Content-Type: application/json

{
  "user_id": 1,
  "image_url": "https://example.com/skin-image.jpg",
  "skin_type": "복합성",
  "concerns": ["여드름", "색소침착"],
  "recommendations": ["순한 클렌징", "비타민C 세럼 사용"],
  "skin_disease": null,
  "skin_state": "양호",
  "needs_medical_attention": false,
  "confidence": {
    "skinType": 0.95,
    "disease": 0.80,
    "state": 0.90
  },
  "detailed_analysis": {
    "analyzed_regions": ["T존", "볼", "턱"],
    "detected_issues": [...]
  },
  "skin_age": 28,
  "moisture": 65,
  "wrinkles": 20,
  "pigmentation": 30,
  "pores": 45,
  "acne": 25,
  "analysis_date": "2024-01-01T10:00:00Z"
}
```

### 5.2 사용자 피부 분석 내역 조회
```
GET /api/skin-analysis/history/{user_id}
Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "image_url": "https://example.com/skin-image.jpg",
      "analysis_date": "2024-01-01T10:00:00Z",
      "skin_type": "복합성",
      "skin_age": 28,
      "moisture": 65,
      "wrinkles": 20,
      "pigmentation": 30,
      "pores": 45,
      "acne": 25,
      "concerns": ["여드름", "색소침착"],
      "recommendations": ["순한 클렌징", "비타민C 세럼 사용"],
      "skin_disease": null,
      "skin_state": "양호",
      "needs_medical_attention": false,
      "confidence": {
        "skinType": 0.95,
        "disease": 0.80,
        "state": 0.90
      },
      "detailed_analysis": { ... },
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### 5.3 특정 분석 결과 상세 조회
```
GET /api/skin-analysis/{analysis_id}
Response: (위와 동일한 구조의 단일 객체)
```

### 5.4 분석 결과 삭제
```
DELETE /api/skin-analysis/{analysis_id}
Response:
{
  "success": true,
  "message": "분석 결과가 삭제되었습니다."
}
```

## 6. 인덱스 최적화 권장사항

성능 향상을 위한 추가 인덱스:

```sql
-- 사용자별 최근 분석 결과 조회용
CREATE INDEX idx_user_recent_analysis ON skin_analysis_results(user_id, analysis_date DESC);

-- 의료진 상담이 필요한 케이스 조회용  
CREATE INDEX idx_medical_attention_cases ON skin_analysis_results(needs_medical_attention, analysis_date DESC);

-- 피부 타입별 통계 조회용
CREATE INDEX idx_skin_type_stats ON skin_analysis_results(skin_type, analysis_date);
```

## 7. 주의사항

1. **개인정보 보호**: 이미지 URL과 분석 결과는 민감한 개인정보이므로 적절한 보안 조치가 필요합니다.
2. **데이터 보존**: 사용자가 계정을 삭제할 경우 관련 데이터의 처리 방침을 명확히 해야 합니다.
3. **백업**: 정기적인 데이터 백업과 복구 계획이 필요합니다.
4. **성능**: 대용량 이미지 데이터 처리를 위한 CDN 사용을 고려해야 합니다.
5. **AI 모델 버전**: AI 모델이 업데이트될 경우 이전 분석 결과와의 호환성을 고려해야 합니다. 