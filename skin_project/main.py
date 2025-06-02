import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from typing import List, Optional
from datetime import datetime, timedelta, time, date as date_cls
from sqlalchemy.sql import text

# 데이터베이스 및 모델 import
from database import SessionLocal, Base, engine
from core.models import db_models
from core.models.medical_models import Hospital, Doctor, Appointment
from core.models.db_models import (
    User, Product, Shop, ProductShop, RecommendationHistory, RecommendationProduct,
    ProductIngredient, ProductSkinType, ProductBenefit, ProductReview, CrawledReview, GenderEnum
)
from schemas import ProductCreate, Token
from crud import create_product

# 의료진 CRUD 함수들 import
from medical_crud import (
    get_hospitals, get_hospital, create_hospital,
    get_doctors, get_doctor, create_doctor,
    get_appointments, get_appointment, create_appointment, cancel_appointment, update_appointment,
    get_medical_records, create_medical_record,
    get_doctor_reviews, create_doctor_review,
    get_available_times
)

# 추천 시스템 import (임시 주석 처리)
from product_description.crawler import crawl_olive_young_reviews
# from recommendation import recommend_endpoint, RecommendQuery  # 존재하지 않는 import 제거

# 환경변수 로드
from dotenv import load_dotenv
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "default-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

# 데이터베이스 연결 테스트
try:
    # 데이터베이스 연결 테스트
    db = SessionLocal()
    db.execute(text("SELECT 1"))
    db.close()
    print("✅ 데이터베이스 연결 성공!")
except Exception as e:
    print(f"❌ 데이터베이스 연결 실패: {e}")

# 환경변수에서 OpenAI API 키 로드
openai_api_key = os.getenv("OPENAI_API_KEY")
if openai_api_key and openai_api_key != "your-openai-api-key-here":
    print(f"✅ OPENAI_API_KEY = {openai_api_key[:10]}...")
else:
    print("⚠️ OPENAI_API_KEY가 설정되지 않았습니다")

# FastAPI 앱 생성
app = FastAPI(
    title="Skincare App API",
    description="스킨케어 앱을 위한 백엔드 API",
    version="1.0.0"
)

# 추천 시스템 라우터 추가 (main 브랜치에서 가져온 기능)
from recommendation import router as recommend_router
app.include_router(recommend_router)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 의존성 주입을 위한 데이터베이스 세션
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ========== 기본 엔드포인트 ==========
@app.get("/")
def read_root():
    return {
        "message": "🏥 Skincare App API 서버가 실행 중입니다!",
        "version": "1.0.0",
        "database_status": "연결됨",
        "endpoints": "/docs에서 API 문서를 확인하세요"
    }

@app.get("/health")
def health_check():
    try:
        # 데이터베이스 연결 테스트
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        database_status = "connected"
    except Exception:
        database_status = "disconnected"
    
    return {
        "status": "healthy",
        "database": database_status
    }

# ========== 인증 API ==========
@app.post("/api/auth/login")
def auth_login(credentials: dict):
    """사용자 로그인"""
    email = credentials.get("email")
    password = credentials.get("password")
    
    if not email or not password:
        raise HTTPException(status_code=400, detail="이메일과 비밀번호를 입력해주세요")
    
    # TODO: 실제 사용자 인증 로직 구현 필요
    if email == "test@example.com" and password == "password":
        return {
            "success": True,
            "data": {
                "user": {
                    "id": 1,
                    "email": email,
                    "name": "테스트 사용자",
                    "phone": "010-1234-5678",
                    "createdAt": datetime.now().isoformat()
                },
                "token": "dummy-jwt-token"
            }
        }
    else:
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 틀렸습니다")

@app.post("/api/auth/register")
def auth_register(userData: dict):
    """사용자 회원가입"""
    email = userData.get("email")
    password = userData.get("password")
    name = userData.get("name")
    phone = userData.get("phone")
    
    if not all([email, password, name, phone]):
        raise HTTPException(status_code=400, detail="모든 필드를 입력해주세요")
    
    # TODO: 실제 사용자 생성 로직 구현 필요
    return {
        "success": True,
        "data": {
        "user": {
                "id": 2,
                "email": email,
                "name": name,
                "phone": phone,
                "createdAt": datetime.now().isoformat()
            }
        },
        "message": "회원가입이 완료되었습니다."
    }

@app.post("/api/auth/logout")
def auth_logout():
    """사용자 로그아웃"""
    return {"success": True, "message": "로그아웃되었습니다"}

@app.get("/api/auth/verify")
def auth_verify():
    """토큰 검증"""
    return {"success": True, "message": "토큰이 유효합니다"}

# ========== 사용자 API ==========
@app.get("/api/users/{user_id}")
def get_user_profile(user_id: int):
    """사용자 프로필 조회"""
    # TODO: 실제 사용자 데이터베이스 조회 구현 필요
    return {
        "success": True,
        "data": {
            "id": user_id,
            "email": "test@example.com",
            "name": "테스트 사용자",
            "phone": "010-1234-5678",
            "profileImage": None,
            "createdAt": datetime.now().isoformat()
        }
    }

@app.put("/api/users/{user_id}")
def update_user_profile(user_id: int, data: dict):
    """사용자 프로필 수정"""
    # TODO: 실제 사용자 데이터베이스 업데이트 구현 필요
    return {
        "success": True,
        "data": {
            "id": user_id,
            **data,
            "updatedAt": datetime.now().isoformat()
        },
        "message": "프로필이 수정되었습니다"
    }

# ========== 리뷰 API ==========
@app.post("/api/reviews")
def create_review(data: dict, db: Session = Depends(get_db)):
    """리뷰 작성"""
    try:
        from crud import create_product_review
        
        user_id = data.get("user_id", 1)  # 실제로는 인증에서 가져옴
        product_id = data.get("product_id")
        
        if not product_id:
            raise HTTPException(status_code=400, detail="제품 ID가 필요합니다")
        
        review_data = {
            "rating": data.get("rating"),
            "title": data.get("title", ""),
            "content": data.get("content"),
            "skin_type": data.get("skin_type"),
            "skin_concern": data.get("skin_concern"),
            "sensitivity": data.get("sensitivity"),
            "is_verified_purchase": data.get("is_verified_purchase", False)
        }
        
        review = create_product_review(db, user_id, product_id, review_data)
        
        return {
            "success": True,
            "reviewId": review.id,
            "message": "리뷰가 작성되었습니다"
        }
    except Exception as e:
        print(f"❌ 리뷰 작성 실패: {e}")
        raise HTTPException(status_code=500, detail=f"리뷰 작성 실패: {str(e)}")

@app.get("/api/reviews")
def get_reviews(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """리뷰 목록 조회"""
    try:
        from crud import get_crawled_reviews
        
        # 크롤링된 리뷰와 사용자 작성 리뷰를 혼합해서 반환
        crawled_reviews = get_crawled_reviews(db, skip, limit)
        
        if not crawled_reviews:
            raise HTTPException(status_code=404, detail="등록된 리뷰가 없습니다")
        
        formatted_reviews = []
        for review in crawled_reviews:
            formatted_reviews.append({
                "id": review.id,
                "type": "crawled",
                "userName": review.reviewer_name or f"사용자{review.id}",
                "productName": review.source_product_name,
                "rating": review.rating or 4.0,
                "content": review.content,
                "skinType": review.skin_type,
                "helpfulCount": review.helpful_count,
                "createdAt": review.created_at.strftime("%Y-%m-%d") if review.created_at else "",
                "source": review.source
            })
        
        return {"success": True, "data": formatted_reviews}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 리뷰 목록 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=f"리뷰 목록 조회 중 오류가 발생했습니다: {str(e)}")

@app.get("/api/reviews/user/{user_id}")
def get_user_reviews(user_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """사용자 리뷰 목록 조회"""
    try:
        from crud import get_user_reviews as get_user_reviews_crud
        
        user_reviews = get_user_reviews_crud(db, user_id, skip, limit)
        
        if not user_reviews:
            raise HTTPException(status_code=404, detail=f"사용자 {user_id}의 리뷰가 없습니다")
        
        formatted_reviews = []
        for review in user_reviews:
            formatted_reviews.append({
                "id": review.id,
                "productId": review.product_id,
                "productName": review.product.name if review.product else "제품 정보 없음",
                "rating": review.rating,
                "title": review.title,
                "content": review.content,
                "skinType": review.skin_type,
                "skinConcern": review.skin_concern,
                "sensitivity": review.sensitivity,
                "isVerifiedPurchase": review.is_verified_purchase,
                "helpfulCount": review.helpful_count,
                "createdAt": review.created_at.strftime("%Y-%m-%d"),
                "updatedAt": review.updated_at.strftime("%Y-%m-%d")
            })
        
        return {
            "success": True,
            "data": formatted_reviews
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 사용자 리뷰 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=f"사용자 {user_id} 리뷰 조회 중 오류가 발생했습니다: {str(e)}")

@app.get("/api/reviews/product/{product_id}")
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    """제품 리뷰 목록 조회 (사용자 작성 리뷰 + 크롤링된 리뷰)"""
    try:
        from core.models.db_models import ProductReview, CrawledReview, Product
        
        # 제품이 존재하는지 먼저 확인
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"제품 ID {product_id}를 찾을 수 없습니다")
        
        reviews = []
        
        # 1. 사용자가 작성한 리뷰 가져오기
        user_reviews = db.query(ProductReview).filter(
            ProductReview.product_id == product_id
        ).all()
        
        for review in user_reviews:
            reviews.append({
                "id": f"user_{review.id}",
                "userName": f"사용자{review.user_id}",
                "rating": float(review.rating),
                "comment": review.content,
                "date": review.created_at.strftime("%Y-%m-%d"),
                "skinType": review.skin_type or '일반',
                "helpful": review.helpful_count,
                "type": "user_review"
            })
        
        # 2. 크롤링된 리뷰 가져오기 (product_id가 매칭된 것만)
        crawled_reviews = db.query(CrawledReview).filter(
            CrawledReview.product_id == product_id
        ).limit(15).all()  # 최대 15개만
        
        for review in crawled_reviews:
            # 사용자명 익명 처리
            import random
            user_name = f"사용자{random.randint(1000, 9999)}"
            
            # 날짜 처리
            if review.review_date and review.review_date.strip():
                review_date = review.review_date[:10] if len(review.review_date) > 10 else review.review_date
            else:
                from datetime import datetime, timedelta
                days_ago = random.randint(1, 90)
                review_date = (datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d")
            
            reviews.append({
                "id": f"crawled_{review.id}",
                "userName": user_name,
                "rating": float(review.rating) if review.rating else 4.0,
                "comment": review.content or '좋은 제품입니다.',
                "date": review_date,
                "skinType": review.skin_type or '복합성',
                "helpful": review.helpful_count or random.randint(0, 20),
                "type": "crawled_review"
            })
        
        # 3. 리뷰가 정말 없으면 404 에러 반환
        if not reviews:
            raise HTTPException(
                status_code=404, 
                detail=f"제품 '{product.name}'에 대한 리뷰가 없습니다. 첫 번째 리뷰를 작성해보세요!"
            )
        
        # 4. 랜덤하게 섞어서 반환
        import random
        random.shuffle(reviews)
        
        print(f"✅ 제품 {product_id} 리뷰 조회: 사용자 {len(user_reviews)}개 + 크롤링 {len(crawled_reviews)}개 = 총 {len(reviews)}개")
        return reviews
        
    except HTTPException:
        # HTTPException은 그대로 전달
        raise
    except Exception as e:
        print(f"❌ 제품 리뷰 조회 실패: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"제품 {product_id} 리뷰 조회 중 오류가 발생했습니다: {str(e)}"
        )

@app.put("/api/reviews/{review_id}")
def update_review(review_id: int, data: dict, db: Session = Depends(get_db)):
    """리뷰 수정"""
    try:
        from crud import update_product_review
        
        user_id = data.get("user_id", 1)  # 실제로는 인증에서 가져옴
        
        updated_review = update_product_review(db, review_id, user_id, data)
        if not updated_review:
            raise HTTPException(status_code=404, detail="리뷰를 찾을 수 없거나 수정 권한이 없습니다")
        
        return {
            "success": True,
            "message": "리뷰가 수정되었습니다",
            "review": {
                "id": updated_review.id,
                "rating": updated_review.rating,
                "title": updated_review.title,
                "content": updated_review.content,
                "updatedAt": updated_review.updated_at.strftime("%Y-%m-%d")
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 리뷰 수정 실패: {e}")
        raise HTTPException(status_code=500, detail=f"리뷰 수정 실패: {str(e)}")

@app.delete("/api/reviews/{review_id}")
def delete_review(review_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    """리뷰 삭제"""
    try:
        from crud import delete_product_review
        
        success = delete_product_review(db, review_id, user_id)
        if not success:
            raise HTTPException(status_code=404, detail="리뷰를 찾을 수 없거나 삭제 권한이 없습니다")
        
        return {
            "success": True,
            "message": "리뷰가 삭제되었습니다"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 리뷰 삭제 실패: {e}")
        raise HTTPException(status_code=500, detail=f"리뷰 삭제 실패: {str(e)}")

# ========== 제품 API ==========
@app.get("/api/products/popular")
def get_popular_products_api(db: Session = Depends(get_db)):
    """인기 제품 목록 조회"""
    try:
        from crud import get_popular_products
        products = get_popular_products(db, limit=10)
        
        if not products:
            raise HTTPException(status_code=404, detail="인기 제품이 없습니다")
        
        return [
            {
                "id": product.id,
                "name": product.name,
                "brand": product.brand,
                "price": product.price,
                "rating": product.rating,
                "reviews": product.review_count,
                "category": product.category,
                "image": product.image_url or f"product{product.id}.png"
            }
            for product in products
        ]
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 인기 제품 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=f"인기 제품 조회 중 오류가 발생했습니다: {str(e)}")

@app.get("/api/products/new")
def get_new_products_api(db: Session = Depends(get_db)):
    """신제품 목록 조회"""
    try:
        from crud import get_new_products
        products = get_new_products(db, limit=10)
        
        if not products:
            raise HTTPException(status_code=404, detail="신제품이 없습니다")
        
        return [
            {
                "id": product.id,
                "name": product.name,
                "brand": product.brand,
                "price": product.price,
                "rating": product.rating,
                "reviews": product.review_count,
                "category": product.category,
                "image": product.image_url or f"product{product.id}.png"
            }
            for product in products
        ]
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 신제품 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=f"신제품 조회 중 오류가 발생했습니다: {str(e)}")

@app.get("/api/products/category/{category}")
def get_products_by_category_api(category: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """카테고리별 제품 조회"""
    try:
        from crud import get_products
        products = get_products(db, skip=skip, limit=limit, category=category)
        
        if not products:
            raise HTTPException(status_code=404, detail=f"카테고리 '{category}'에 해당하는 제품이 없습니다")
        
        return [
            {
                "id": product.id,
                "name": product.name,
                "brand": product.brand,
                "price": product.price,
                "rating": product.rating,
                "reviews": product.review_count,
                "category": product.category,
                "image": product.image_url or f"product{product.id}.png"
            }
            for product in products
        ]
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 카테고리별 제품 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=f"카테고리 '{category}' 제품 조회 중 오류가 발생했습니다: {str(e)}")

@app.get("/api/products")
def get_products_api(skip: int = 0, limit: int = 100, search: str = None, db: Session = Depends(get_db)):
    """제품 목록 조회"""
    try:
        from crud import get_products, search_products
        
        if search:
            products = search_products(db, search, skip=skip, limit=limit)
        else:
            products = get_products(db, skip=skip, limit=limit)
        
        if not products:
            if search:
                raise HTTPException(status_code=404, detail=f"검색어 '{search}'에 해당하는 제품이 없습니다")
            else:
                raise HTTPException(status_code=404, detail="등록된 제품이 없습니다")
        
        return {
            "success": True,
            "data": [
                {
                    "id": product.id,
                    "name": product.name,
                    "brand": product.brand,
                    "price": product.price,
                    "rating": product.rating,
                    "reviews": product.review_count,
                    "category": product.category,
                    "image": product.image_url or f"product{product.id}.png"
                }
                for product in products
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 제품 목록 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=f"제품 목록 조회 중 오류가 발생했습니다: {str(e)}")

@app.get("/api/products/{product_id}")
def get_product_api(product_id: int, db: Session = Depends(get_db)):
    """제품 상세 조회"""
    try:
        from crud import get_product
        product = get_product(db, product_id)
        
        if not product:
            raise HTTPException(status_code=404, detail="제품을 찾을 수 없습니다")
        
        return {
            "id": product.id,
            "name": product.name,
            "brand": product.brand,
            "price": product.price,
            "originalPrice": product.original_price,
            "rating": product.rating,
            "reviews": product.review_count,
            "category": product.category,
            "description": product.description,
            "volume": product.volume,
            "image": product.image_url or f"product{product.id}.png",
            "ingredients": [ing.ingredient for ing in product.ingredients],
            "skinTypes": [st.skin_type for st in product.skin_types],
            "benefits": [ben.benefit for ben in product.benefits],
            "isPopular": product.is_popular,
            "isNew": product.is_new
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 제품 상세 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="제품 정보 조회 중 오류가 발생했습니다")

@app.post("/api/products")
def create_product_api(product_data: dict, db: Session = Depends(get_db)):
    """제품 생성 (관리자용)"""
    try:
        from crud import create_product
        from schemas import ProductCreate
        
        product_create = ProductCreate(**product_data)
        product = create_product(db, product_create)
        
        return {
            "success": True,
            "productId": product.id,
            "message": "제품이 성공적으로 생성되었습니다"
        }
    except Exception as e:
        print(f"❌ 제품 생성 실패: {e}")
        raise HTTPException(status_code=500, detail="제품 생성 중 오류가 발생했습니다")

# ========== 진료 요청서 API ==========
@app.post("/api/medical/diagnosis-requests")
def create_diagnosis_request(data: dict):
    """진료 요청서 제출"""
    # TODO: 실제 진료 요청서 데이터베이스 저장 구현 필요
    return {
        "success": True,
        "requestId": 9999,
        "message": "진료 요청서가 제출되었습니다"
    }

@app.get("/api/medical/diagnosis-requests")
def get_diagnosis_requests(user_id: Optional[int] = None):
    """진료 요청서 목록 조회"""
    # TODO: 실제 진료 요청서 데이터베이스 조회 구현 필요
    return []

@app.get("/api/medical/diagnosis-requests/{request_id}")
def get_diagnosis_request(request_id: int):
    """진료 요청서 상세 조회"""
    # TODO: 실제 진료 요청서 데이터베이스 조회 구현 필요
    raise HTTPException(status_code=404, detail="진료 요청서를 찾을 수 없습니다")

@app.patch("/api/medical/diagnosis-requests/{request_id}")
def update_diagnosis_request_status(request_id: int, data: dict):
    """진료 요청서 상태 업데이트"""
    # TODO: 실제 진료 요청서 상태 업데이트 구현 필요
    status = data.get("status")
    return {
        "success": True,
        "message": f"진료 요청서 상태가 '{status}'로 변경되었습니다"
    }

# ========== 약국 API ==========
@app.get("/api/pharmacies")
def get_pharmacies():
    """약국 목록 조회"""
    # TODO: 실제 약국 데이터베이스 조회 구현 필요
    return []

@app.get("/api/pharmacies/nearby")
def get_nearby_pharmacies(lat: float, lng: float, radius: int = 5):
    """근처 약국 조회"""
    # TODO: 실제 근처 약국 검색 구현 필요
    return []

# ========== 병원 API ==========
@app.get("/api/medical/hospitals")
def get_hospitals_api(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """병원 목록 조회"""
    try:
        hospitals = get_hospitals(db, skip=skip, limit=limit)
        return [
            {
                "id": hospital.id,
                "name": hospital.name,
                "address": hospital.address,
                "phone": hospital.phone,
                "rating": 4.8,  # 기본값
                "departments": ["피부과", "성형외과"],  # 기본값
                "image": f"hospital{hospital.id}.png"
            }
            for hospital in hospitals
        ]
    except Exception as e:
        print(f"❌ 병원 목록 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="병원 목록 조회 중 오류가 발생했습니다")

@app.get("/api/medical/hospitals/{hospital_id}")
def get_hospital_api(hospital_id: int, db: Session = Depends(get_db)):
    """병원 상세 정보 조회"""
    try:
        hospital = get_hospital(db, hospital_id)
        if not hospital:
            raise HTTPException(status_code=404, detail="병원을 찾을 수 없습니다")
        
        return {
            "id": hospital.id,
            "name": hospital.name,
            "address": hospital.address,
            "phone": hospital.phone,
            "rating": 4.8,  # 기본값
            "departments": ["피부과", "성형외과"],  # 기본값
            "image": f"hospital{hospital.id}.png",
            "description": hospital.description or "전문 의료진과 최신 시설을 갖춘 병원입니다.",
            "facilities": ["응급실", "주차장", "약국", "카페"],
            "operatingHours": hospital.operating_hours or {
                "weekday": "08:00 - 18:00",
                "saturday": "08:00 - 13:00",
                "sunday": "휴무"
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 병원 상세 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="병원 정보 조회 중 오류가 발생했습니다")

# ========== 의사 API ==========
@app.get("/api/medical/doctors")
def get_doctors_api(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """의사 목록 조회"""
    try:
        doctors = get_doctors(db, skip=skip, limit=limit)
        return [
            {
                "id": doctor.id,
                "name": doctor.name,
                "specialization": doctor.specialization,
                "hospital": doctor.hospital.name if doctor.hospital else "병원 정보 없음",
                "rating": float(doctor.rating) if doctor.rating else 0.0,
                "experience": f"{doctor.experience_years}년" if doctor.experience_years else "경력 정보 없음",
                "image": doctor.profile_image_url or f"doctor{doctor.id}.png",
                "consultationFee": doctor.consultation_fee or 50000,
                "availableTimes": ["09:00", "10:00", "14:00", "15:00"]  # 기본값
            }
            for doctor in doctors
        ]
    except Exception as e:
        print(f"❌ 의사 목록 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="의사 목록 조회 중 오류가 발생했습니다")

@app.get("/api/medical/doctors/{doctor_id}")
def get_doctor_api(doctor_id: int, db: Session = Depends(get_db)):
    """의사 상세 정보 조회"""
    try:
        doctor = get_doctor(db, doctor_id)
        if not doctor:
            raise HTTPException(status_code=404, detail="의사를 찾을 수 없습니다")
        
        # 의사 리뷰 조회
        reviews = get_doctor_reviews(db, doctor_id, limit=5)
        
        return {
            "id": doctor.id,
            "name": doctor.name,
            "specialization": doctor.specialization,
            "hospital": doctor.hospital.name if doctor.hospital else "병원 정보 없음",
            "rating": float(doctor.rating) if doctor.rating else 0.0,
            "experience": f"{doctor.experience_years}년" if doctor.experience_years else "경력 정보 없음",
            "image": doctor.profile_image_url or f"doctor{doctor.id}.png",
            "consultationFee": doctor.consultation_fee or 50000,
            "description": doctor.description or "전문 의료진입니다.",
            "education": doctor.education.split('\n') if doctor.education else ["의과대학 졸업"],
            "specialties": ["피부과 전문"],  # 기본값
            "availableTimes": ["09:00", "10:00", "14:00", "15:00"],  # 기본값
            "reviews": [
                {
                    "id": review.id,
                    "patientName": "환자**",  # 개인정보 보호
                    "rating": review.rating,
                    "content": review.review_text,
                    "date": review.created_at.strftime("%Y-%m-%d")
                }
                for review in reviews
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 의사 상세 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="의사 정보 조회 중 오류가 발생했습니다")

@app.get("/api/medical/doctors/{doctor_id}/available-times")
def get_doctor_available_times(doctor_id: int, date: str, db: Session = Depends(get_db)):
    """의사 가능 시간 조회 (기본 + doctor_schedules 반영)"""
    try:
        # date는 'YYYY-MM-DD' 문자열로 들어옴
        date_obj = datetime.strptime(date, "%Y-%m-%d").date()
        weekday = date_obj.weekday()  # 0:월~6:일
        
        # 공휴일 간단 판별
        holidays = [
            date_cls(2024,1,1), date_cls(2024,3,1), date_cls(2024,5,5), date_cls(2024,6,6),
            date_cls(2024,8,15), date_cls(2024,10,3), date_cls(2024,10,9), date_cls(2024,12,25)
        ]
        is_holiday = date_obj in holidays
        is_weekend = weekday >= 5 or is_holiday
        
        # 기본 가능 시간대 (원래 로직 복원)
        if is_weekend:
            # 주말/공휴일: 오전 8시 ~ 오후 1시
            start_time_str, end_time_str = "08:00", "13:00"
        else:
            # 평일: 오후 6시 ~ 다음날 새벽 2시
            start_time_str, end_time_str = "18:00", "02:00"
        
        start_time = datetime.strptime(start_time_str, "%H:%M").time()
        end_time = datetime.strptime(end_time_str, "%H:%M").time()
        
        # 30분 단위 시간대 생성
        slots = []
        current_time = datetime.combine(date_obj, start_time)
        
        # 종료 시간이 시작 시간보다 이른 경우 (예: 18:00 ~ 02:00)
        if end_time <= start_time:
            # 다음날 새벽까지 진료하는 경우 (평일)
            end_datetime = datetime.combine(date_obj + timedelta(days=1), end_time)
        else:
            # 같은 날 안에서 진료하는 경우 (주말)
            end_datetime = datetime.combine(date_obj, end_time)
        
        while current_time < end_datetime:
            slots.append(current_time.strftime("%H:%M"))
            current_time += timedelta(minutes=30)
        
        # doctor_schedules에서 해당 날짜의 스케줄 조회
        from sqlalchemy import and_
        from core.models.medical_models import DoctorSchedule
        
        schedule = db.query(DoctorSchedule).filter(
            and_(
                DoctorSchedule.doctor_id == doctor_id,
                DoctorSchedule.date == date_obj
            )
        ).first()
        
        # 스케줄이 있으면 해당 스케줄에 따라 시간 조정
        if schedule:
            if not schedule.is_available:
                # 해당 날짜에 휴진이면 빈 배열 반환
                slots = []
            elif schedule.start_time and schedule.end_time:
                # 특별 스케줄이 있으면 해당 시간만 표시
                schedule_start = datetime.combine(date_obj, schedule.start_time)
                schedule_end = datetime.combine(date_obj, schedule.end_time)
                
                slots = []
                current_time = schedule_start
                while current_time < schedule_end:
                    slots.append(current_time.strftime("%H:%M"))
                    current_time += timedelta(minutes=30)
        
        # 시간 정렬: 새벽 시간(00:00~05:59)을 먼저, 그 다음 오전~밤(06:00~23:59)
        def time_sort_key(time_str):
            hour = int(time_str.split(':')[0])
            minute = int(time_str.split(':')[1])
            # 새벽 시간(00:00~05:59)은 우선순위를 높게 (0~359)
            # 오전~밤(06:00~23:59)은 그 다음 (360~1799)
            if 0 <= hour <= 5:
                return hour * 60 + minute
            else:
                return (hour * 60 + minute) + 360
        
        slots.sort(key=time_sort_key)
        
        # 이미 예약된 시간 제외
        from core.models.medical_models import Appointment
        existing_appointments = db.query(Appointment).filter(
            and_(
                Appointment.doctor_id == doctor_id,
                Appointment.appointment_date == date_obj,
                Appointment.status.in_(['confirmed', 'pending'])
            )
        ).all()
        
        booked_times = [apt.appointment_time.strftime("%H:%M") for apt in existing_appointments]
        available_slots = [slot for slot in slots if slot not in booked_times]
        
        return {
                "success": True,
            "doctorId": doctor_id,
            "date": date,
                "availableTimes": available_slots
            }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"잘못된 날짜 형식입니다: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 의사 가능 시간 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="가능 시간 조회 중 오류가 발생했습니다")

@app.get("/api/medical/appointments")
def get_appointments_api(user_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """예약 목록 조회"""
    try:
        from medical_schemas import AppointmentSearchParams
        search_params = AppointmentSearchParams(user_id=user_id) if user_id else None
        
        appointments = get_appointments(db, skip=skip, limit=limit, search_params=search_params)
        
        return [
            {
                "id": appointment.id,
                "doctorId": appointment.doctor_id,
                "doctorName": appointment.doctor.name if appointment.doctor else "의사 정보 없음",
                "specialty": appointment.doctor.specialization if appointment.doctor else "전문분야 정보 없음",
                "hospital": appointment.hospital.name if appointment.hospital else "병원 정보 없음",
                "date": appointment.appointment_date.strftime("%Y-%m-%d"),
                "time": appointment.appointment_time.strftime("%H:%M"),
                "status": appointment.status,
                "userId": appointment.user_id,
                "symptoms": appointment.symptoms or "증상 정보 없음",
                "consultationFee": appointment.doctor.consultation_fee if appointment.doctor else 50000
            }
            for appointment in appointments
        ]
    except Exception as e:
        print(f"❌ 예약 목록 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="예약 목록 조회 중 오류가 발생했습니다")

@app.post("/api/medical/appointments")
def create_appointment_api(data: dict, db: Session = Depends(get_db)):
    """예약 생성"""
    try:
        from medical_schemas import AppointmentCreate
        from datetime import datetime
        
        # 데이터 변환
        appointment_data = AppointmentCreate(
            user_id=data.get("userId", 1),  # 기본값
            doctor_id=data["doctorId"],
            hospital_id=data.get("hospitalId", 1),  # 기본값
            appointment_date=datetime.strptime(data["date"], "%Y-%m-%d").date(),
            appointment_time=datetime.strptime(data["time"], "%H:%M").time(),
            symptoms=data.get("symptoms", ""),
            consultation_type=data.get("consultationType", "일반진료")
        )
        
        appointment = create_appointment(db, appointment_data)
        
        return {
            "success": True,
            "appointmentId": appointment.id,
            "message": "예약이 성공적으로 생성되었습니다",
            "data": {
                "id": appointment.id,
                "doctorId": appointment.doctor_id,
                "date": appointment.appointment_date.strftime("%Y-%m-%d"),
                "time": appointment.appointment_time.strftime("%H:%M"),
                "status": appointment.status
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"❌ 예약 생성 실패: {e}")
        raise HTTPException(status_code=500, detail="예약 생성 중 오류가 발생했습니다")

@app.delete("/api/medical/appointments/{appointment_id}")
def cancel_appointment_api(appointment_id: int, db: Session = Depends(get_db)):
    """예약 취소"""
    try:
        appointment = cancel_appointment(db, appointment_id)
        if not appointment:
            raise HTTPException(status_code=404, detail="예약을 찾을 수 없습니다")
        
        return {
            "success": True,
            "message": "예약이 취소되었습니다"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 예약 취소 실패: {e}")
        raise HTTPException(status_code=500, detail="예약 취소 중 오류가 발생했습니다")

@app.get("/api/medical/appointments/{appointment_id}")
def get_appointment_api(appointment_id: int, db: Session = Depends(get_db)):
    """예약 상세 조회"""
    try:
        appointment = get_appointment(db, appointment_id)
        if not appointment:
            raise HTTPException(status_code=404, detail="예약을 찾을 수 없습니다")
        
        return {
            "id": appointment.id,
            "doctorId": appointment.doctor_id,
            "doctorName": appointment.doctor.name if appointment.doctor else "의사 정보 없음",
            "specialty": appointment.doctor.specialization if appointment.doctor else "전문분야 정보 없음",
            "hospital": appointment.hospital.name if appointment.hospital else "병원 정보 없음",
            "date": appointment.appointment_date.strftime("%Y-%m-%d"),
            "time": appointment.appointment_time.strftime("%H:%M"),
            "status": appointment.status,
            "userId": appointment.user_id,
            "symptoms": appointment.symptoms or "증상 정보 없음",
            "consultationFee": appointment.doctor.consultation_fee if appointment.doctor else 50000,
            "notes": appointment.notes or "",
            "createdAt": appointment.created_at.isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 예약 상세 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="예약 정보 조회 중 오류가 발생했습니다")

@app.patch("/api/medical/appointments/{appointment_id}")
def update_appointment_status_api(appointment_id: int, data: dict, db: Session = Depends(get_db)):
    """예약 상태 업데이트"""
    try:
        from medical_schemas import AppointmentUpdate
        
        appointment_update = AppointmentUpdate(status=data.get("status"))
        appointment = update_appointment(db, appointment_id, appointment_update)
        
        if not appointment:
            raise HTTPException(status_code=404, detail="예약을 찾을 수 없습니다")
        
        return {
            "success": True,
            "message": f"예약 상태가 '{appointment.status}'로 변경되었습니다",
            "data": {
                "id": appointment.id,
                "status": appointment.status,
                "updatedAt": appointment.updated_at.isoformat()
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 예약 상태 업데이트 실패: {e}")
        raise HTTPException(status_code=500, detail="예약 상태 업데이트 중 오류가 발생했습니다")

# ========== 데이터베이스 초기화 API ==========
@app.post("/api/database/import-reviews")
def import_crawled_reviews(db: Session = Depends(get_db)):
    """크롤링된 리뷰 데이터를 DB에 저장 (중복 방지)"""
    try:
        import pandas as pd
        import os
        from crud import bulk_create_crawled_reviews
        
        # CSV 파일들 경로
        csv_files = [
            ("../crawler/data/reviews_bulk_toner.csv", "토너"),
            ("../crawler/data/reviews_bulk_cream.csv", "크림"), 
            ("../crawler/data/reviews_bulk_ampoule.csv", "앰플")
        ]
        
        total_stats = {"created": 0, "duplicates": 0, "total": 0}
        file_results = []
        
        for csv_file, category in csv_files:
            if not os.path.exists(csv_file):
                print(f"⚠️ 파일을 찾을 수 없습니다: {csv_file}")
                continue
            
            try:
                df = pd.read_csv(csv_file)
                print(f"📄 {category} 파일: {len(df)}개 리뷰 발견")
                
                # 데이터 변환
                reviews_data = []
                for _, row in df.iterrows():
                    review_data = {
                        "source": "oliveyoung",
                        "source_product_name": str(row.get('product_name', f'{category} 제품')),
                        "source_product_id": str(row.get('product_id', '')),
                        "reviewer_name": None,  # 익명 처리
                        "rating": float(row.get('star', 4.0)) if pd.notna(row.get('star')) else 4.0,
                        "content": str(row.get('review', '좋은 제품입니다.')),
                        "skin_type": str(row.get('skin_type', '')) if pd.notna(row.get('skin_type')) else None,
                        "age_group": str(row.get('age', '')) if pd.notna(row.get('age')) else None,
                        "review_date": str(row.get('date', '')) if pd.notna(row.get('date')) else None,
                        "helpful_count": int(row.get('helpful', 0)) if pd.notna(row.get('helpful')) else 0
                    }
                    reviews_data.append(review_data)
                
                # DB에 저장 (중복 방지)
                stats = bulk_create_crawled_reviews(db, reviews_data)
                
                file_results.append({
                    "file": csv_file,
                    "category": category,
                    "stats": stats
                })
                
                # 총합 계산
                total_stats["created"] += stats["created"]
                total_stats["duplicates"] += stats["duplicates"]
                total_stats["total"] += stats["total"]
                
                print(f"✅ {category}: {stats['created']}개 저장, {stats['duplicates']}개 중복")
                
            except Exception as file_error:
                print(f"❌ {csv_file} 처리 실패: {file_error}")
                file_results.append({
                    "file": csv_file,
                    "category": category,
                    "error": str(file_error)
                })
        
        return {
            "success": True,
            "message": f"✅ 크롤링 리뷰 데이터 저장 완료!",
            "summary": {
                "총_리뷰": total_stats["total"],
                "새로_저장": total_stats["created"],
                "중복_제외": total_stats["duplicates"]
            },
            "file_results": file_results
        }
        
    except Exception as e:
        print(f"❌ 크롤링 리뷰 저장 실패: {e}")
        raise HTTPException(status_code=500, detail=f"크롤링 리뷰 저장 실패: {str(e)}")

@app.post("/api/database/reset")
def reset_database():
    """데이터베이스 완전 초기화 (모든 데이터 삭제)"""
    try:
        db = SessionLocal()
        
        # 외래 키 제약조건 때문에 순서대로 삭제
        tables_to_delete = [
            "doctor_reviews", "doctor_schedules", "medical_records", "appointments", 
            "doctors", "hospitals", "product_shops", "product_benefits", 
            "product_skin_types", "product_ingredients", "recommendation_products",
            "recommendation_history", "product_reviews", "crawled_reviews", "products", 
            "shops", "users"
        ]
        
        for table in tables_to_delete:
            try:
                db.execute(text(f"DELETE FROM {table}"))
                # 시퀀스 리셋
                db.execute(text(f"ALTER SEQUENCE {table}_id_seq RESTART WITH 1"))
            except Exception as e:
                print(f"⚠️ 테이블 {table} 처리 중 오류 (무시): {e}")
        
        db.commit()
        db.close()
        
        return {
            "success": True,
            "message": "✅ 데이터베이스가 완전히 초기화되었습니다!",
            "deleted_tables": tables_to_delete
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"데이터베이스 초기화 실패: {str(e)}")

@app.post("/api/database/setup")
def setup_database():
    """데이터베이스 테이블 생성 및 샘플 데이터 추가"""
    try:
        from setup_database import create_tables, add_sample_data
        
        # 1. 테이블 생성
        if not create_tables():
            raise HTTPException(status_code=500, detail="테이블 생성에 실패했습니다")
        
        # 2. 샘플 데이터 추가
        if not add_sample_data():
            raise HTTPException(status_code=500, detail="샘플 데이터 추가에 실패했습니다")
        
        return {
            "success": True,
            "message": "✅ 데이터베이스 설정이 완료되었습니다!",
            "details": [
                "✅ 모든 테이블 생성 완료",
                "✅ 사용자 데이터 추가 완료",
                "✅ 병원 데이터 추가 완료", 
                "✅ 의사 데이터 추가 완료",
                "✅ 쇼핑몰 데이터 추가 완료",
                "✅ 제품 데이터 추가 완료",
                "✅ 제품 판매처 데이터 추가 완료",
                "✅ 제품 성분/피부타입/효능 데이터 추가 완료",
                "✅ 리뷰 데이터 추가 완료",
                "✅ 예약 데이터 추가 완료",
                "✅ 진료 기록 데이터 추가 완료",
                "✅ 의사 리뷰 데이터 추가 완료",
                "✅ 의사 스케줄 데이터 추가 완료"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"데이터베이스 설정 실패: {str(e)}")

@app.post("/api/database/init")
def init_database():
    """데이터베이스 완전 초기화 + 실제 크롤링 데이터 추가 (원스톱 솔루션)"""
    try:
        # 1. 데이터베이스 초기화
        print("🔄 1단계: 기존 데이터 삭제 중...")
        reset_response = reset_database()
        if not reset_response.get("success"):
            raise HTTPException(status_code=500, detail="데이터베이스 초기화 실패")
        
        # 2. 테이블 생성
        print("🏗️ 2단계: 테이블 생성 중...")
        from setup_database import create_tables
        if not create_tables():
            raise HTTPException(status_code=500, detail="테이블 생성 실패")
        
        # 3. 기본 데이터 추가 (사용자, 쇼핑몰 등)
        print("👥 3단계: 기본 데이터 추가 중...")
        db = SessionLocal()
        try:
            # 사용자 데이터
            users = [
                User(
                    email="test@example.com", 
                    hashed_password="hashed_password", 
                    username="테스트사용자", 
                    phone_number="010-1234-5678",
                    gender=GenderEnum.female,
                    age=25,
                    skin_type="지성"
                ),
                User(
                    email="user2@example.com", 
                    hashed_password="hashed_password2", 
                    username="사용자2", 
                    phone_number="010-2345-6789",
                    gender=GenderEnum.male,
                    age=30,
                    skin_type="건성"
                ),
                User(
                    email="user3@example.com", 
                    hashed_password="hashed_password3", 
                    username="사용자3", 
                    phone_number="010-3456-7890",
                    gender=GenderEnum.female,
                    age=28,
                    skin_type="복합성"
                ),
                User(
                    email="user4@example.com", 
                    hashed_password="hashed_password4", 
                    username="사용자4", 
                    phone_number="010-4567-8901",
                    gender=GenderEnum.other,
                    age=35,
                    skin_type="민감성"
                )
            ]
            for user in users:
                existing = db.query(User).filter(User.email == user.email).first()
                if not existing:
                    db.add(user)
            
            # 쇼핑몰 데이터
            shops = [
                Shop(name="올리브영", url="https://www.oliveyoung.co.kr", logo_url="https://example.com/oliveyoung_logo.png"),
                Shop(name="화해", url="https://www.hwahae.co.kr", logo_url="https://example.com/hwahae_logo.png"),
                Shop(name="네이버쇼핑", url="https://shopping.naver.com", logo_url="https://example.com/naver_logo.png"),
                Shop(name="쿠팡", url="https://www.coupang.com", logo_url="https://example.com/coupang_logo.png")
            ]
            for shop in shops:
                existing = db.query(Shop).filter(Shop.name == shop.name).first()
                if not existing:
                    db.add(shop)
            
            # 병원 및 의사 데이터 (기본)
            from setup_database import create_tables
            try:
                # 의료진 관련 데이터만 별도로 추가
                # 병원 데이터 추가
                hospitals = [
                    Hospital(
                        name="서울대학교병원",
                        address="서울특별시 종로구 대학로 101",
                        phone="02-2072-2114",
                        description="국내 최고 수준의 의료진과 시설을 갖춘 종합병원",
                        latitude=37.5804,
                        longitude=127.0024,
                        operating_hours={
                            "weekday": "08:00-18:00",
                            "saturday": "08:00-13:00",
                            "sunday": "휴무"
                        }
                    ),
                    Hospital(
                        name="연세대학교병원",
                        address="서울특별시 서대문구 연세로 50-1",
                        phone="02-2228-5800",
                        description="첨단 의료 기술과 전문 의료진을 보유한 대학병원",
                        latitude=37.5602,
                        longitude=126.9423,
                        operating_hours={
                            "weekday": "08:30-17:30",
                            "saturday": "08:30-12:30",
                            "sunday": "휴무"
                        }
                    ),
                    Hospital(
                        name="삼성서울병원",
                        address="서울특별시 강남구 일원로 81",
                        phone="02-3410-2114",
                        description="최첨단 의료 장비와 우수한 의료진을 갖춘 병원",
                        latitude=37.4881,
                        longitude=127.0856,
                        operating_hours={
                            "weekday": "08:00-18:00",
                            "saturday": "08:00-13:00",
                            "sunday": "휴무"
                        }
                    )
                ]
                
                for hospital in hospitals:
                    existing = db.query(Hospital).filter(Hospital.name == hospital.name).first()
                    if not existing:
                        db.add(hospital)
                
                db.commit()
                
                # 의사 데이터 추가
                doctors = [
                    Doctor(
                        hospital_id=1,
                        name="김민수",
                        specialization="피부과",
                        experience_years=15,
                        education="서울대학교 의과대학 졸업\n서울대학교병원 피부과 전공의\n대한피부과학회 정회원",
                        description="피부과 전문의로 15년간 다양한 피부 질환 치료 경험을 보유하고 있습니다.",
                        profile_image_url="https://example.com/doctor1.jpg",
                        consultation_fee=50000,
                        available_days=["mon", "tue", "wed", "thu", "fri"],
                        available_times={"start": "09:00", "end": "17:00"},
                        rating=4.8,
                        review_count=128,
                        is_active=True
                    ),
                    Doctor(
                        hospital_id=2,
                        name="이영희",
                        specialization="성형외과",
                        experience_years=12,
                        education="연세대학교 의과대학 졸업\n연세대학교병원 성형외과 전공의\n대한성형외과학회 정회원",
                        description="성형외과 전문의로 자연스러운 미용 시술을 전문으로 합니다.",
                        profile_image_url="https://example.com/doctor2.jpg",
                        consultation_fee=60000,
                        available_days=["mon", "tue", "wed", "thu", "fri"],
                        available_times={"start": "10:00", "end": "18:00"},
                        rating=4.6,
                        review_count=86,
                        is_active=True
                    ),
                    Doctor(
                        hospital_id=3,
                        name="박철수",
                        specialization="피부과",
                        experience_years=18,
                        education="고려대학교 의과대학 졸업\n삼성서울병원 피부과 전공의\n대한피부과학회 정회원",
                        description="아토피와 알레르기 피부염 치료 전문의입니다.",
                        profile_image_url="https://example.com/doctor3.jpg",
                        consultation_fee=55000,
                        available_days=["mon", "tue", "wed", "thu", "fri", "sat"],
                        available_times={"start": "09:30", "end": "16:30"},
                        rating=4.7,
                        review_count=95,
                        is_active=True
                    ),
                    Doctor(
                        hospital_id=1,
                        name="최지영",
                        specialization="피부과",
                        experience_years=20,
                        education="서울대학교 의과대학 졸업\n서울대학교병원 피부과 전공의\n대한피부과학회 정회원",
                        description="피부암 진단 및 레이저 치료 전문의입니다.",
                        profile_image_url="https://example.com/doctor4.jpg",
                        consultation_fee=70000,
                        available_days=["mon", "tue", "wed", "thu", "fri"],
                        available_times={"start": "11:00", "end": "19:00"},
                        rating=4.9,
                        review_count=156,
                        is_active=True
                    )
                ]
                
                for doctor in doctors:
                    existing = db.query(Doctor).filter(Doctor.name == doctor.name, Doctor.hospital_id == doctor.hospital_id).first()
                    if not existing:
                        db.add(doctor)
                
                db.commit()
                print("✅ 의료진 데이터 추가 완료")
                
            except Exception as e:
                print(f"⚠️ 의료진 데이터 추가 중 오류 (무시): {e}")
            
            db.commit()
            print("✅ 기본 데이터 추가 완료")
            
        finally:
            db.close()
        
        # 3-1. 추가 샘플 데이터 (의료진 관련)
        print("🏥 3-1단계: 의료진 샘플 데이터 추가 중...")
        db = SessionLocal()
        try:
            from core.models.medical_models import Appointment, MedicalRecord, DoctorReview, DoctorSchedule
            from datetime import date, time
            
            # 예약 데이터 추가
            appointments = [
                Appointment(
                    user_id=1,
                    doctor_id=1,
                    hospital_id=1,
                    appointment_date=date(2024, 3, 15),
                    appointment_time=time(14, 0),
                    status='confirmed',
                    symptoms='얼굴 여드름 치료 상담',
                    notes='처음 방문',
                    consultation_type='일반진료'
                ),
                Appointment(
                    user_id=2,
                    doctor_id=2,
                    hospital_id=2,
                    appointment_date=date(2024, 3, 20),
                    appointment_time=time(15, 30),
                    status='pending',
                    symptoms='피부 미용 상담',
                    notes='보톡스 문의',
                    consultation_type='시술상담'
                ),
                Appointment(
                    user_id=3,
                    doctor_id=3,
                    hospital_id=3,
                    appointment_date=date(2024, 3, 25),
                    appointment_time=time(10, 0),
                    status='completed',
                    symptoms='아토피 재진',
                    notes='약물 처방 변경',
                    consultation_type='재진'
                ),
                Appointment(
                    user_id=4,
                    doctor_id=4,
                    hospital_id=1,
                    appointment_date=date(2024, 3, 30),
                    appointment_time=time(16, 0),
                    status='confirmed',
                    symptoms='피부 분석 요청',
                    notes='피부 타입 확인',
                    consultation_type='피부분석'
                )
            ]
            
            for appointment in appointments:
                existing = db.query(Appointment).filter(
                    Appointment.doctor_id == appointment.doctor_id,
                    Appointment.appointment_date == appointment.appointment_date,
                    Appointment.appointment_time == appointment.appointment_time
                ).first()
                if not existing:
                    db.add(appointment)
            
            db.commit()
            print("✅ 예약 데이터 추가 완료")

            # 진료 기록 데이터 추가
            medical_records = [
                MedicalRecord(
                    appointment_id=3,  # completed 상태의 예약에 대해서만
                    user_id=3,
                    doctor_id=3,
                    diagnosis="아토피 피부염",
                    treatment="항히스타민제 처방 및 보습제 사용법 안내",
                    prescription="세티리진 10mg 1일 1회, 스테로이드 연고",
                    next_visit_date=date(2024, 4, 25),
                    notes="증상 호전 양상. 보습제 꾸준히 사용할 것"
                )
            ]
            
            for record in medical_records:
                existing = db.query(MedicalRecord).filter(
                    MedicalRecord.appointment_id == record.appointment_id
                ).first()
                if not existing:
                    db.add(record)
            
            db.commit()
            print("✅ 진료 기록 데이터 추가 완료")

            # 의사 리뷰 데이터 추가
            doctor_reviews = [
                DoctorReview(
                    user_id=3,
                    doctor_id=3,
                    appointment_id=3,
                    rating=5,
                    review_text="친절하고 자세한 설명해주셔서 감사합니다. 치료 효과도 좋아요."
                )
            ]
            
            for review in doctor_reviews:
                existing = db.query(DoctorReview).filter(
                    DoctorReview.appointment_id == review.appointment_id
                ).first()
                if not existing:
                    db.add(review)
            
            db.commit()
            print("✅ 의사 리뷰 데이터 추가 완료")

            # 의사 스케줄 데이터 추가
            doctor_schedules = [
                DoctorSchedule(
                    doctor_id=1,
                    date=date(2024, 3, 15),
                    is_available=True,
                    start_time=time(9, 0),
                    end_time=time(17, 0),
                    reason=None
                ),
                DoctorSchedule(
                    doctor_id=2,
                    date=date(2024, 3, 20),
                    is_available=True,
                    start_time=time(10, 0),
                    end_time=time(18, 0),
                    reason=None
                ),
                DoctorSchedule(
                    doctor_id=3,
                    date=date(2024, 3, 25),
                    is_available=True,
                    start_time=time(9, 30),
                    end_time=time(16, 30),
                    reason=None
                ),
                DoctorSchedule(
                    doctor_id=4,
                    date=date(2024, 3, 30),
                    is_available=True,
                    start_time=time(11, 0),
                    end_time=time(19, 0),
                    reason=None
                ),
                DoctorSchedule(
                    doctor_id=1,
                    date=date(2024, 4, 1),
                    is_available=False,
                    start_time=None,
                    end_time=None,
                    reason="학회 참석"
                )
            ]
            
            for schedule in doctor_schedules:
                existing = db.query(DoctorSchedule).filter(
                    DoctorSchedule.doctor_id == schedule.doctor_id,
                    DoctorSchedule.date == schedule.date
                ).first()
                if not existing:
                    db.add(schedule)
            
            db.commit()
            print("✅ 의사 스케줄 데이터 추가 완료")
            
        except Exception as e:
            print(f"⚠️ 의료진 샘플 데이터 추가 중 오류 (무시): {e}")
        finally:
            db.close()
        
        # 4. 실제 크롤링 제품 데이터 import
        print("📦 4단계: 실제 제품 데이터 import 중...")
        db = SessionLocal()
        try:
            import pandas as pd
            import os
            import re
            
            # 1. 기존 샘플 제품 데이터 완전 삭제
            print("🗑️ 기존 샘플 제품 데이터 삭제 중...")
            db.execute(text("DELETE FROM product_benefits"))
            db.execute(text("DELETE FROM product_skin_types"))
            db.execute(text("DELETE FROM product_ingredients"))
            db.execute(text("DELETE FROM product_shops"))
            db.execute(text("DELETE FROM products"))
            db.commit()
            print("✅ 기존 데이터 삭제 완료")
            
            # 2. 크롤링된 제품 데이터 CSV 파일들
            csv_files = [
                ("../crawler/data/product_list_toner.csv", "토너"),
                ("../crawler/data/product_list_cream.csv", "크림"), 
                ("../crawler/data/product_list_ampoule.csv", "앰플")
            ]
            
            total_imported = 0
            import_results = []
            
            for csv_file, category in csv_files:
                if not os.path.exists(csv_file):
                    print(f"⚠️ 파일을 찾을 수 없습니다: {csv_file}")
                    import_results.append({
                        "category": category,
                        "error": "파일 없음"
                    })
                    continue
                
                try:
                    df = pd.read_csv(csv_file)
                    print(f"📄 {category} 파일: {len(df)}개 제품 발견")
                    
                    imported_count = 0
                    for _, row in df.iterrows():
                        # 가격 문자열 파싱 ("49,000" -> 49000)
                        price_str = str(row.get('price_discounted', '0')).replace(',', '').replace('"', '')
                        try:
                            price = int(price_str)
                        except:
                            price = 0
                        
                        # 제품명에서 브랜드명 제거하여 깔끔하게 만들기
                        brand = str(row.get('brand', 'Unknown'))
                        full_name = str(row.get('name', ''))
                        
                        # 제품명에서 브랜드명이 포함되어 있으면 제거
                        if brand.lower() in full_name.lower():
                            name = full_name.replace(brand, '').strip()
                            # 앞뒤 콤마나 공백 제거
                            name = re.sub(r'^[,\s]+|[,\s]+$', '', name)
                        else:
                            name = full_name
                        
                        # 너무 긴 이름 줄이기 (괄호 부분 제거)
                        if '(' in name:
                            name = name.split('(')[0].strip()
                        if '[' in name and ']' in name:
                            # [기획] 같은 부분만 제거하고 나머지는 유지
                            name = re.sub(r'\[[^\]]*기획[^\]]*\]', '', name).strip()
                        
                        # 빈 이름이면 기본값 설정
                        if not name or name.strip() == '':
                            name = f"{brand} {category}"
                        
                        # Product 객체 생성
                        product = Product(
                            name=name[:100],  # 이름 길이 제한
                            brand=brand,
                            category=category,
                            price=price,
                            original_price=price + int(price * 0.1),  # 원가는 10% 높게 설정
                            rating=4.0 + (hash(name) % 10) / 10,  # 4.0~4.9 랜덤 평점
                            review_count=20 + (hash(brand + name) % 50),  # 20~70 랜덤 리뷰 수
                            description=f"{brand}의 {category} 제품입니다. 고품질 원료로 만든 프리미엄 화장품입니다.",
                            volume="50ml",  # 기본 용량
                            is_popular=imported_count < 5,  # 처음 5개만 인기 제품
                            is_new=imported_count < 3,  # 처음 3개만 신제품
                            image_url=row.get('image_url', '')
                        )
                        
                        db.add(product)
                        db.flush()  # ID 생성을 위해 flush
                        
                        # 기본 성분 추가
                        if category == "토너":
                            ingredients = ["히알루론산", "나이아신아마이드", "글리세린"]
                        elif category == "크림":
                            ingredients = ["세라마이드", "시어버터", "판테놀"]
                        else:  # 앰플
                            ingredients = ["비타민C", "펩타이드", "레티놀"]
                        
                        for ingredient in ingredients:
                            db.add(ProductIngredient(product_id=product.id, ingredient=ingredient))
                        
                        # 기본 피부타입 추가
                        skin_types = ["건성", "지성", "복합성"]
                        for skin_type in skin_types:
                            db.add(ProductSkinType(product_id=product.id, skin_type=skin_type))
                        
                        # 기본 효능 추가
                        if category == "토너":
                            benefits = ["수분공급", "각질제거", "진정"]
                        elif category == "크림":
                            benefits = ["보습", "영양공급", "탄력"]
                        else:  # 앰플
                            benefits = ["미백", "주름개선", "트러블케어"]
                        
                        for benefit in benefits:
                            db.add(ProductBenefit(product_id=product.id, benefit=benefit))
                        
                        # 기본 쇼핑몰 판매정보 추가 (ProductShop)
                        # 올리브영, 쿠팡, 네이버쇼핑에서 판매한다고 가정
                        shops = db.query(Shop).limit(4).all()  # 앞에서 생성한 4개 쇼핑몰
                        
                        for i, shop in enumerate(shops):
                            # 쇼핑몰별로 약간 다른 가격 설정
                            shop_price = price + (i * 1000)  # 쇼핑몰별로 1000원씩 차이
                            is_lowest = (i == 0)  # 첫 번째 쇼핑몰이 최저가
                            shipping_fee = 0 if shop_price >= 30000 or i == 0 else 2500  # 3만원 이상 또는 첫 번째 쇼핑몰은 무료배송
                            
                            db.add(ProductShop(
                                product_id=product.id,
                                shop_id=shop.id,
                                price=shop_price,
                                shipping="무료배송" if shipping_fee == 0 else "유료배송",
                                shipping_fee=shipping_fee,
                                installment=f"{2+i}개월" if shop_price >= 20000 else None,
                                is_free_shipping=(shipping_fee == 0),
                                is_lowest_price=is_lowest,
                                is_card_discount=(i % 2 == 1)  # 홀수 번째 쇼핑몰은 카드할인
                            ))
                        
                        imported_count += 1
                    
                    db.commit()
                    total_imported += imported_count
                    
                    import_results.append({
                        "category": category,
                        "imported": imported_count,
                        "file": csv_file
                    })
                    
                    print(f"✅ {category}: {imported_count}개 제품 import 완료")
                    
                except Exception as file_error:
                    print(f"❌ {csv_file} 처리 실패: {file_error}")
                    import_results.append({
                        "category": category,
                        "error": str(file_error)
                    })
            
            import_response = {
                "success": True,
                "message": f"✅ 크롤링된 제품 데이터 import 완료!",
                "summary": {
                    "총_제품": total_imported,
                    "카테고리": len([r for r in import_results if "imported" in r])
                },
                "details": import_results
            }
            
        finally:
            db.close()
        
        # 5. 크롤링된 리뷰 데이터 import
        print("📊 5단계: 크롤링 리뷰 데이터 import 중...")
        db = SessionLocal()
        try:
            from crud import bulk_create_crawled_reviews
            
            csv_files_reviews = [
                ("../crawler/data/reviews_bulk_toner.csv", "토너"),
                ("../crawler/data/reviews_bulk_cream.csv", "크림"), 
                ("../crawler/data/reviews_bulk_ampoule.csv", "앰플")
            ]
            
            total_reviews = 0
            for csv_file, category in csv_files_reviews:
                if not os.path.exists(csv_file):
                    print(f"⚠️ 파일을 찾을 수 없습니다: {csv_file}")
                    continue
                
                try:
                    df = pd.read_csv(csv_file)
                    print(f"📄 {category} 파일: {len(df)}개 리뷰 발견")
                    
                    reviews_data = []
                    for _, row in df.iterrows():
                        review_data = {
                            "source": "oliveyoung",
                            "source_product_name": str(row.get('product_name', f'{category} 제품')),
                            "source_product_id": str(row.get('product_id', '')),
                            "reviewer_name": None,
                            "rating": row.get('star', 4.0),
                            "content": str(row.get('review', '좋은 제품입니다.')),
                            "skin_type": row.get('skin_type') if pd.notna(row.get('skin_type')) else None,
                            "age_group": row.get('age') if pd.notna(row.get('age')) else None,
                            "review_date": row.get('date') if pd.notna(row.get('date')) else None,
                            "helpful_count": row.get('helpful', 0)
                        }
                        reviews_data.append(review_data)
                    
                    stats = bulk_create_crawled_reviews(db, reviews_data)
                    total_reviews += stats["created"]
                    print(f"✅ {category}: {stats['created']}개 새로 저장, {stats['duplicates']}개 중복 제외")
                    
                except Exception as file_error:
                    print(f"❌ {category} 리뷰 파일 처리 실패: {file_error}")
                    
        except Exception as e:
            print(f"❌ 리뷰 데이터 import 중 오류: {e}")
        finally:
            db.close()
        
        print(f"📊 리뷰 데이터 import 완료: 총 {total_reviews}개 저장")
        
        # import_response에 리뷰 수 추가
        import_response['summary']['리뷰_수'] = total_reviews

        return {
            "success": True,
            "message": "🎉 데이터베이스가 실제 크롤링 데이터로 완전히 초기화되었습니다!",
            "steps": [
                "1️⃣ 기존 데이터 완전 삭제",
                "2️⃣ 모든 테이블 생성",
                "3️⃣ 기본 데이터 추가 (사용자, 쇼핑몰, 병원, 의사)",
                "3️⃣-1 의료진 샘플 데이터 추가 (예약, 진료기록, 의사리뷰, 스케줄)",
                f"4️⃣ 실제 크롤링 제품 {import_response['summary']['총_제품']}개 추가",
                f"5️⃣ 실제 크롤링 리뷰 {import_response['summary']['리뷰_수']}개 추가"
            ],
            "summary": {
                "제품_수": import_response['summary']['총_제품'],
                "리뷰_수": import_response['summary']['리뷰_수'],
                "카테고리": ["토너", "크림", "앰플"],
                "데이터_출처": "올리브영 크롤링"
            },
            "ready": [
                "✅ 실제 올리브영 제품 데이터!",
                f"✅ {import_response['summary']['리뷰_수']}개의 실제 사용자 리뷰!",
                "✅ 완전한 쇼핑몰 판매정보!",
                "✅ 프로덕션 레디!"
            ]
        }
    except Exception as e:
        print(f"❌ 데이터베이스 초기화 실패: {e}")
        raise HTTPException(status_code=500, detail=f"데이터베이스 초기화 실패: {str(e)}")

@app.post("/api/database/import-products")
def import_crawled_products(db: Session = Depends(get_db)):
    """크롤링된 제품 데이터를 DB에 저장 (기존 샘플 데이터 대체)"""
    try:
        import pandas as pd
        import os
        import re
        
        # 1. 기존 샘플 제품 데이터 완전 삭제
        print("🗑️ 기존 샘플 제품 데이터 삭제 중...")
        db.execute(text("DELETE FROM product_benefits"))
        db.execute(text("DELETE FROM product_skin_types"))
        db.execute(text("DELETE FROM product_ingredients"))
        db.execute(text("DELETE FROM product_shops"))
        db.execute(text("DELETE FROM products"))
        db.commit()
        print("✅ 기존 데이터 삭제 완료")
        
        # 2. 크롤링된 제품 데이터 CSV 파일들
        csv_files = [
            ("../crawler/data/product_list_toner.csv", "토너"),
            ("../crawler/data/product_list_cream.csv", "크림"), 
            ("../crawler/data/product_list_ampoule.csv", "앰플")
        ]
        
        total_imported = 0
        import_results = []
        
        for csv_file, category in csv_files:
            if not os.path.exists(csv_file):
                print(f"⚠️ 파일을 찾을 수 없습니다: {csv_file}")
                import_results.append({
                    "category": category,
                    "error": "파일 없음"
                })
                continue
            
            try:
                df = pd.read_csv(csv_file)
                print(f"📄 {category} 파일: {len(df)}개 제품 발견")
                
                imported_count = 0
                for _, row in df.iterrows():
                    # 가격 문자열 파싱 ("49,000" -> 49000)
                    price_str = str(row.get('price_discounted', '0')).replace(',', '').replace('"', '')
                    try:
                        price = int(price_str)
                    except:
                        price = 0
                    
                    # 제품명에서 브랜드명 제거하여 깔끔하게 만들기
                    brand = str(row.get('brand', 'Unknown'))
                    full_name = str(row.get('name', ''))
                    
                    # 제품명에서 브랜드명이 포함되어 있으면 제거
                    if brand.lower() in full_name.lower():
                        name = full_name.replace(brand, '').strip()
                        # 앞뒤 콤마나 공백 제거
                        name = re.sub(r'^[,\s]+|[,\s]+$', '', name)
                    else:
                        name = full_name
                    
                    # 너무 긴 이름 줄이기 (괄호 부분 제거)
                    if '(' in name:
                        name = name.split('(')[0].strip()
                    if '[' in name and ']' in name:
                        # [기획] 같은 부분만 제거하고 나머지는 유지
                        name = re.sub(r'\[[^\]]*기획[^\]]*\]', '', name).strip()
                    
                    # 빈 이름이면 기본값 설정
                    if not name or name.strip() == '':
                        name = f"{brand} {category}"
                    
                    # Product 객체 생성
                    product = Product(
                        name=name[:100],  # 이름 길이 제한
                        brand=brand,
                        category=category,
                        price=price,
                        original_price=price + int(price * 0.1),  # 원가는 10% 높게 설정
                        rating=4.0 + (hash(name) % 10) / 10,  # 4.0~4.9 랜덤 평점
                        review_count=20 + (hash(brand + name) % 50),  # 20~70 랜덤 리뷰 수
                        description=f"{brand}의 {category} 제품입니다. 고품질 원료로 만든 프리미엄 화장품입니다.",
                        volume="50ml",  # 기본 용량
                        is_popular=imported_count < 5,  # 처음 5개만 인기 제품
                        is_new=imported_count < 3,  # 처음 3개만 신제품
                        image_url=row.get('image_url', '')
                    )
                    
                    db.add(product)
                    db.flush()  # ID 생성을 위해 flush
                    
                    # 기본 성분 추가
                    if category == "토너":
                        ingredients = ["히알루론산", "나이아신아마이드", "글리세린"]
                    elif category == "크림":
                        ingredients = ["세라마이드", "시어버터", "판테놀"]
                    else:  # 앰플
                        ingredients = ["비타민C", "펩타이드", "레티놀"]
                    
                    for ingredient in ingredients:
                        db.add(ProductIngredient(product_id=product.id, ingredient=ingredient))
                    
                    # 기본 피부타입 추가
                    skin_types = ["건성", "지성", "복합성"]
                    for skin_type in skin_types:
                        db.add(ProductSkinType(product_id=product.id, skin_type=skin_type))
                    
                    # 기본 효능 추가
                    if category == "토너":
                        benefits = ["수분공급", "각질제거", "진정"]
                    elif category == "크림":
                        benefits = ["보습", "영양공급", "탄력"]
                    else:  # 앰플
                        benefits = ["미백", "주름개선", "트러블케어"]
                    
                    for benefit in benefits:
                        db.add(ProductBenefit(product_id=product.id, benefit=benefit))
                    
                    # 기본 쇼핑몰 판매정보 추가 (ProductShop)
                    # 올리브영, 쿠팡, 네이버쇼핑에서 판매한다고 가정
                    shops = db.query(Shop).limit(4).all()  # 앞에서 생성한 4개 쇼핑몰
                    
                    for i, shop in enumerate(shops):
                        # 쇼핑몰별로 약간 다른 가격 설정
                        shop_price = price + (i * 1000)  # 쇼핑몰별로 1000원씩 차이
                        is_lowest = (i == 0)  # 첫 번째 쇼핑몰이 최저가
                        shipping_fee = 0 if shop_price >= 30000 or i == 0 else 2500  # 3만원 이상 또는 첫 번째 쇼핑몰은 무료배송
                        
                        db.add(ProductShop(
                            product_id=product.id,
                            shop_id=shop.id,
                            price=shop_price,
                            shipping="무료배송" if shipping_fee == 0 else "유료배송",
                            shipping_fee=shipping_fee,
                            installment=f"{2+i}개월" if shop_price >= 20000 else None,
                            is_free_shipping=(shipping_fee == 0),
                            is_lowest_price=is_lowest,
                            is_card_discount=(i % 2 == 1)  # 홀수 번째 쇼핑몰은 카드할인
                        ))
                    
                    imported_count += 1
                
                db.commit()
                total_imported += imported_count
                
                import_results.append({
                    "category": category,
                    "imported": imported_count,
                    "file": csv_file
                })
                
                print(f"✅ {category}: {imported_count}개 제품 import 완료")
                
            except Exception as file_error:
                print(f"❌ {csv_file} 처리 실패: {file_error}")
                import_results.append({
                    "category": category,
                    "error": str(file_error)
                })
        
        return {
            "success": True,
            "message": f"✅ 크롤링된 제품 데이터 import 완료!",
            "summary": {
                "총_제품": total_imported,
                "카테고리": len([r for r in import_results if "imported" in r])
            },
            "details": import_results
        }
        
    except Exception as e:
        print(f"❌ 제품 데이터 import 실패: {e}")
        raise HTTPException(status_code=500, detail=f"제품 데이터 import 실패: {str(e)}")

# ========== 진단 내역 API ==========
@app.get("/api/medical/diagnoses/user/{user_id}")
def get_user_medical_diagnoses(user_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """사용자 진단 내역 조회"""
    try:
        from medical_crud import get_medical_records
        
        # 진료 기록을 가져와서 진단 내역으로 변환
        medical_records = get_medical_records(db, user_id=user_id, skip=skip, limit=limit)
        
        if not medical_records:
            raise HTTPException(status_code=404, detail=f"사용자 {user_id}의 진단 내역이 없습니다")
        
        formatted_diagnoses = []
        for record in medical_records:
            # 예약 정보에서 병원 정보 가져오기
            hospital_name = "병원 정보 없음"
            if record.appointment and record.appointment.hospital:
                hospital_name = record.appointment.hospital.name
            
            formatted_diagnoses.append({
                "id": record.id,
                "date": record.created_at.strftime("%Y-%m-%d"),
                "doctorName": record.doctor.name if record.doctor else "의사 정보 없음",
                "hospitalName": hospital_name,
                "diagnosis": record.diagnosis or "진단 정보 없음",
                "symptoms": record.appointment.symptoms if record.appointment else "증상 정보 없음",
                "treatment": record.treatment or "치료 정보 없음",
                "prescription": record.prescription or "처방 정보 없음",
                "notes": record.notes or "",
                "severity": "보통",  # MedicalRecord에 severity 필드가 없으므로 기본값
                "followUpDate": record.next_visit_date.strftime("%Y-%m-%d") if record.next_visit_date else None
            })
        
        return {
            "success": True,
            "data": formatted_diagnoses
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 사용자 진단 내역 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=f"사용자 {user_id} 진단 내역 조회 중 오류가 발생했습니다: {str(e)}")

# 서버 실행 코드 추가
if __name__ == "__main__":
    import uvicorn
    print("🚀 FastAPI 서버를 시작합니다...")
    uvicorn.run(app, host="0.0.0.0", port=8080)

@app.get("/api/categories")
def get_categories_api(db: Session = Depends(get_db)):
    """제품 카테고리 목록 조회"""
    try:
        # 실제 DB에서 카테고리 추출
        from sqlalchemy import text
        result = db.execute(text("SELECT DISTINCT category FROM products WHERE category IS NOT NULL"))
        categories = [row[0] for row in result.fetchall()]
        
        if not categories:
            raise HTTPException(status_code=404, detail="등록된 카테고리가 없습니다")
        
        # 카테고리 정보 포맷팅
        formatted_categories = []
        for category in categories:
            icon = "🧴"  # 기본 아이콘
            if "크림" in category:
                icon = "🫧"
            elif "토너" in category:
                icon = "💧"
            elif "클렌저" in category:
                icon = "🧼" 
            elif "선케어" in category:
                icon = "☀️"
            
            formatted_categories.append({
                "id": category.lower(),
                "name": category,
                "icon": icon
            })
        
        return {
            "success": True,
            "data": formatted_categories
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 카테고리 목록 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=f"카테고리 목록 조회 중 오류가 발생했습니다: {str(e)}")

@app.get("/api/skin-options")
def get_skin_options():
    return {
        "success": True,
        "data": {
            "skinTypes": ["건성", "지성", "복합성(정상)"],
            "concerns": ["여드름", "홍조", "각질", "주름", "미백", "모공", "탄력"]
        }
    }

# ========== 추천 내역 API ==========
@app.post("/api/recommendations/save")
def save_recommendation_history(data: dict, db: Session = Depends(get_db)):
    """AI 추천 결과 저장"""
    try:
        from crud import create_recommendation_history
        
        # 추천 내역 저장
        recommendation_data = {
            "user_id": data.get("user_id", 1),  # 임시 사용자 ID
            "skin_type": data.get("skin_type", ""),
            "sensitivity": data.get("sensitivity", ""),
            "concerns": data.get("concerns", []),
            "ai_explanation": data.get("ai_explanation", ""),
            "recommended_products": data.get("recommended_products", [])
        }
        
        saved_history = create_recommendation_history(db, recommendation_data)
        
        return {
            "success": True,
            "message": "추천 내역이 저장되었습니다.",
            "history_id": saved_history.id
        }
    except Exception as e:
        print(f"❌ 추천 내역 저장 실패: {e}")
        raise HTTPException(status_code=500, detail=f"추천 내역 저장 실패: {str(e)}")

@app.get("/api/recommendations/history/{user_id}")
def get_user_recommendation_history(user_id: int, skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """사용자의 추천 내역 조회"""
    try:
        from crud import get_recommendation_history
        
        histories = get_recommendation_history(db, user_id, skip, limit)
        
        # 응답 데이터 포맷팅
        formatted_histories = []
        for history in histories:
            formatted_history = {
                "id": history.id,
                "date": history.created_at.strftime("%Y-%m-%d"),
                "skinType": history.skin_type,
                "sensitivity": history.sensitivity,
                "concerns": history.concerns,
                "explanation": history.ai_explanation,
                "recommendedProducts": [
                    {
                        "id": product.id,
                        "name": product.product_name,
                        "brand": product.product_brand,
                        "category": product.product_category,
                        "reason": product.reason,
                        "image": None  # 기본 이미지 또는 AI 데이터에서 추출
                    } for product in history.recommended_products
                ]
            }
            formatted_histories.append(formatted_history)
        
        return {
            "success": True,
            "data": formatted_histories
        }
    except Exception as e:
        print(f"❌ 추천 내역 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=f"추천 내역 조회 실패: {str(e)}")

@app.delete("/api/recommendations/{history_id}")
def delete_user_recommendation_history(history_id: int, db: Session = Depends(get_db)):
    """추천 내역 삭제"""
    try:
        from crud import delete_recommendation_history
        
        success = delete_recommendation_history(db, history_id)
        if success:
            return {
                "success": True,
                "message": "추천 내역이 삭제되었습니다."
            }
        else:
            raise HTTPException(status_code=404, detail="추천 내역을 찾을 수 없습니다.")
    except Exception as e:
        print(f"❌ 추천 내역 삭제 실패: {e}")
        raise HTTPException(status_code=500, detail=f"추천 내역 삭제 실패: {str(e)}")
