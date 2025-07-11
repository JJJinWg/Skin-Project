from database import Base
from sqlalchemy import Column, Integer, String, Enum, UniqueConstraint, Float, DateTime, Boolean, Text, ForeignKey, JSON, Date
from sqlalchemy.orm import relationship
import enum
from datetime import datetime

class GenderEnum(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"

class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        UniqueConstraint("username"),
        UniqueConstraint("email"),
        UniqueConstraint("phone_number"),
    )

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    phone_number = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)

    gender = Column(Enum(GenderEnum), nullable=False)
    age = Column(Integer, nullable=False)
    skin_type = Column(String, nullable=False)
    birthdate = Column(Date, nullable=True)

# 제품 관련 모델들
class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    brand = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False, index=True)
    price = Column(Integer, nullable=False)
    original_price = Column(Integer, nullable=True)
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    description = Column(Text, nullable=True)
    volume = Column(String, nullable=True)
    is_popular = Column(Boolean, default=False)
    is_new = Column(Boolean, default=False)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 관계 설정
    ingredients = relationship("ProductIngredient", back_populates="product")
    skin_types = relationship("ProductSkinType", back_populates="product")
    benefits = relationship("ProductBenefit", back_populates="product")

class ProductIngredient(Base):
    __tablename__ = "product_ingredients"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    ingredient = Column(String, nullable=False)

    # 관계 설정
    product = relationship("Product", back_populates="ingredients")

class ProductSkinType(Base):
    __tablename__ = "product_skin_types"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    skin_type = Column(String, nullable=False)

    # 관계 설정
    product = relationship("Product", back_populates="skin_types")

class ProductBenefit(Base):
    __tablename__ = "product_benefits"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    benefit = Column(String, nullable=False)

    # 관계 설정
    product = relationship("Product", back_populates="benefits")

class Shop(Base):
    __tablename__ = "shops"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True, index=True)
    url = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)

    # 관계 설정
    product_shops = relationship("ProductShop", back_populates="shop")

class ProductShop(Base):
    __tablename__ = "product_shops"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    shop_id = Column(Integer, ForeignKey("shops.id"), nullable=False)
    price = Column(Integer, nullable=False)
    shipping = Column(String, nullable=True)
    shipping_fee = Column(Integer, nullable=True)
    installment = Column(String, nullable=True)
    is_free_shipping = Column(Boolean, default=False)
    is_lowest_price = Column(Boolean, default=False)
    is_card_discount = Column(Boolean, default=False)

    # 관계 설정
    shop = relationship("Shop", back_populates="product_shops")
    product = relationship("Product")

# AI 추천 내역 관련 모델들
class RecommendationHistory(Base):
    __tablename__ = "recommendation_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)  # User 테이블 참조 (외래키로 설정 안함 - 간단히)
    skin_type = Column(String, nullable=False)  # 요청한 피부 타입
    sensitivity = Column(String, nullable=False)  # 피부 민감도
    concerns = Column(JSON, nullable=False)  # 피부 고민 리스트 ["여드름", "홍조"]
    ai_explanation = Column(Text, nullable=True)  # AI 분석 결과 설명
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 관계 설정
    recommended_products = relationship("RecommendationProduct", back_populates="recommendation")

class RecommendationProduct(Base):
    __tablename__ = "recommendation_products"
    
    id = Column(Integer, primary_key=True, index=True)
    recommendation_id = Column(Integer, ForeignKey("recommendation_history.id"), nullable=False)
    product_name = Column(String, nullable=False)  # AI가 추천한 제품명
    product_brand = Column(String, nullable=True)  # 브랜드
    product_category = Column(String, nullable=False)  # 카테고리 (토너, 크림, 앰플 등)
    reason = Column(Text, nullable=True)  # 추천 이유
    ai_data = Column(JSON, nullable=True)  # AI 응답의 원본 데이터
    
    # 관계 설정
    recommendation = relationship("RecommendationHistory", back_populates="recommended_products")

# 제품 리뷰 시스템 (사용자-제품 연결)
class ProductReview(Base):
    __tablename__ = "product_reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    rating = Column(Float, nullable=False)  # 1.0 ~ 5.0
    title = Column(String, nullable=True)  # 리뷰 제목
    content = Column(Text, nullable=False)  # 리뷰 내용
    skin_type = Column(String, nullable=True)  # 작성자 피부타입
    skin_concern = Column(String, nullable=True)  # 피부 고민
    sensitivity = Column(String, nullable=True)  # 민감도
    is_verified_purchase = Column(Boolean, default=False)  # 구매 인증 여부
    helpful_count = Column(Integer, default=0)  # 도움됨 수
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계 설정
    user = relationship("User")
    product = relationship("Product")

# 크롤링된 리뷰 데이터 (올리브영 등)
class CrawledReview(Base):
    __tablename__ = "crawled_reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)  # 매칭된 제품 ID
    source = Column(String, nullable=False)  # 출처 (oliveyoung, glowpick 등)
    source_product_name = Column(String, nullable=False)  # 원본 제품명
    source_product_id = Column(String, nullable=True)  # 원본 사이트 제품 ID
    reviewer_name = Column(String, nullable=True)  # 리뷰어명 (익명처리)
    rating = Column(Float, nullable=True)  # 평점
    content = Column(Text, nullable=False)  # 리뷰 내용
    skin_type = Column(String, nullable=True)  # 피부타입
    age_group = Column(String, nullable=True)  # 연령대
    review_date = Column(String, nullable=True)  # 리뷰 작성일 (원본 포맷)
    helpful_count = Column(Integer, default=0)  # 도움됨 수
    is_processed = Column(Boolean, default=False)  # 중복 확인 완료 여부
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 관계 설정
    product = relationship("Product")

# 진료 요청서 테이블
class DiagnosisRequest(Base):
    __tablename__ = "diagnosis_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)  # users 테이블 참조 (FK 제약 없음)
    symptoms = Column(Text, nullable=False)  # 증상 설명
    duration = Column(String(100))  # 증상 지속 기간 ("1주일", "2개월" 등)
    severity = Column(String(20), default="mild")  # mild, moderate, severe
    previous_treatment = Column(Text)  # 이전 치료 경험
    allergies = Column(Text)  # 알레르기 정보
    medications = Column(Text)  # 복용 중인 약물
    medical_history = Column(Text)  # 과거 병력
    additional_notes = Column(Text)  # 추가 메모
    images = Column(JSON)  # 이미지 파일 경로들 (JSON 배열)
    status = Column(String(20), default="pending")  # pending, reviewed, completed
    reviewed_by_doctor_id = Column(Integer, nullable=True)  # 검토한 의사 ID (FK 제약 없음)
    review_notes = Column(Text)  # 의사의 검토 메모
    reviewed_at = Column(DateTime)  # 검토 일시
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# AI 피부 분석 결과 테이블
class SkinAnalysisResult(Base):
    __tablename__ = "skin_analysis_results"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)  # 사용자 ID
    image_url = Column(String(500), nullable=False)  # 분석된 피부 이미지 URL
    analysis_date = Column(DateTime, nullable=False, default=datetime.utcnow)  # 분석 수행 일시
    
    # AI 분석 기본 결과
    skin_type = Column(String(50), nullable=False, index=True)  # 피부 타입
    skin_disease = Column(String(100), nullable=True)  # 피부 질환
    skin_state = Column(String(100), nullable=True)  # 피부 상태
    needs_medical_attention = Column(Boolean, default=False, index=True)  # 의료진 상담 필요 여부
    
    # AI 분석 점수 (0-100 점수)
    skin_age = Column(Integer, nullable=True)  # 피부 나이
    moisture_score = Column(Integer, nullable=True)  # 수분 점수
    wrinkles_score = Column(Integer, nullable=True)  # 주름 점수
    pigmentation_score = Column(Integer, nullable=True)  # 색소침착 점수
    pores_score = Column(Integer, nullable=True)  # 모공 점수
    acne_score = Column(Integer, nullable=True)  # 여드름 점수
    
    # AI 신뢰도 점수 (0.0-1.0)
    skin_type_confidence = Column(Float, nullable=True)  # 피부 타입 판정 신뢰도
    disease_confidence = Column(Float, nullable=True)  # 질환 판정 신뢰도
    state_confidence = Column(Float, nullable=True)  # 상태 판정 신뢰도
    
    # JSON 형태의 상세 분석 데이터
    detailed_analysis = Column(JSON, nullable=True)  # AI 모델의 상세 분석 결과
    
    # 타임스탬프
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계 설정
    concerns = relationship("SkinAnalysisConcern", back_populates="analysis", cascade="all, delete-orphan")
    recommendations = relationship("SkinAnalysisRecommendation", back_populates="analysis", cascade="all, delete-orphan")

# 피부 고민사항 테이블
class SkinAnalysisConcern(Base):
    __tablename__ = "skin_analysis_concerns"
    
    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("skin_analysis_results.id"), nullable=False, index=True)
    concern = Column(String(100), nullable=False, index=True)  # 피부 고민
    severity = Column(Enum('low', 'medium', 'high', name='severity_enum'), default='medium')  # 심각도
    confidence_score = Column(Float, nullable=True)  # 해당 고민 판정의 신뢰도
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 관계 설정
    analysis = relationship("SkinAnalysisResult", back_populates="concerns")

# AI 추천사항 테이블
class SkinAnalysisRecommendation(Base):
    __tablename__ = "skin_analysis_recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("skin_analysis_results.id"), nullable=False, index=True)
    recommendation_type = Column(Enum('skincare', 'lifestyle', 'medical', 'product', name='recommendation_type_enum'), nullable=False)
    recommendation_text = Column(Text, nullable=False)  # 추천 내용
    priority = Column(Integer, default=1)  # 우선순위 (1=높음, 2=보통, 3=낮음)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 관계 설정
    analysis = relationship("SkinAnalysisResult", back_populates="recommendations")

# 분석 이미지 메타데이터 테이블
class SkinAnalysisImage(Base):
    __tablename__ = "skin_analysis_images"
    
    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("skin_analysis_results.id"), nullable=False, index=True)
    original_filename = Column(String(255), nullable=True)  # 원본 파일명
    file_size = Column(Integer, nullable=True)  # 파일 크기 (bytes)
    image_width = Column(Integer, nullable=True)  # 이미지 너비
    image_height = Column(Integer, nullable=True)  # 이미지 높이
    image_format = Column(String(20), nullable=True)  # 이미지 포맷
    upload_timestamp = Column(DateTime, default=datetime.utcnow)  # 업로드 시간
    
    # 관계 설정
    analysis = relationship("SkinAnalysisResult")
