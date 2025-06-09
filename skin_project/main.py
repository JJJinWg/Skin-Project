import json
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from fastapi import FastAPI, Depends, HTTPException, status, Body, Request, File, UploadFile
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
    ProductIngredient, ProductSkinType, ProductBenefit, ProductReview, CrawledReview, GenderEnum,
    DiagnosisRequest
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

# AI 모델 서비스 import
from ai_model_service import skin_analysis_service

# AI 피부 분석 CRUD import
from skin_analysis_crud import (
    create_skin_analysis_result,
    get_user_skin_analysis_history,
    get_skin_analysis_by_id,
    delete_skin_analysis_result,
    format_analysis_for_api
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

# 요청 로깅 미들웨어 추가
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"🌐 요청 받음: {request.method} {request.url}")
    response = await call_next(request)
    print(f"📤 응답 보냄: {response.status_code}")
    return response

# 추천 시스템 라우터 추가 (main 브랜치에서 가져온 기능)
from recommendation import router as recommend_router
app.include_router(recommend_router)

# 의료진 라우터 추가
from medical_routes import router as medical_router
app.include_router(medical_router, prefix="/api/medical")

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
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    """사용자 프로필 조회"""
    try:
        from core.models.db_models import User
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail=f"사용자 ID {user_id}를 찾을 수 없습니다")
        
        return {
            "success": True,
            "data": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "phone_number": user.phone_number,
                "age": user.age,
                "gender": user.gender,
                "skin_type": user.skin_type,
                "birthdate": user.birthdate.strftime("%Y-%m-%d") if user.birthdate else None
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 사용자 프로필 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="사용자 정보 조회 중 오류가 발생했습니다")

@app.put("/api/users/{user_id}")
def update_user_profile(user_id: int, data: dict, db: Session = Depends(get_db)):
    """사용자 프로필 수정"""
    try:
        from core.models.db_models import User
        from datetime import datetime, date
        
        # 사용자 존재 확인
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail=f"사용자 ID {user_id}를 찾을 수 없습니다")
        
        # 수정 가능한 필드만 업데이트
        if 'username' in data:
            user.username = data['username']
        if 'email' in data:
            user.email = data['email']
        if 'phone_number' in data:
            user.phone_number = data['phone_number']
        if 'birthdate' in data and data['birthdate']:
            # 문자열을 date 객체로 변환
            try:
                user.birthdate = datetime.strptime(data['birthdate'], "%Y-%m-%d").date()
            except ValueError:
                raise HTTPException(status_code=400, detail="올바르지 않은 생년월일 형식입니다. YYYY-MM-DD 형식을 사용해주세요.")
        if 'age' in data:
            user.age = data['age']
        if 'gender' in data:
            user.gender = data['gender']
        if 'skin_type' in data:
            user.skin_type = data['skin_type']
        
        # 데이터베이스에 커밋
        db.commit()
        db.refresh(user)
        
        return {
            "success": True,
            "data": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "phone_number": user.phone_number,
                "age": user.age,
                "gender": user.gender,
                "skin_type": user.skin_type,
                "birthdate": user.birthdate.strftime("%Y-%m-%d") if user.birthdate else None
            },
            "message": "프로필이 성공적으로 수정되었습니다"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 사용자 프로필 수정 실패: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="사용자 정보 수정 중 오류가 발생했습니다")

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
        
        # 2. 크롤링된 리뷰 가져오기 (제품명으로 매칭)
        # product_id 컬럼이 없으므로 제품명이나 다른 방식으로 매칭
        crawled_reviews = []
        
        # 먼저 제품명으로 매칭 시도
        if hasattr(CrawledReview, 'source_product_name'):
            # source_product_name이 있는 경우
            crawled_reviews = db.query(CrawledReview).filter(
                CrawledReview.source_product_name.ilike(f"%{product.name}%")
            ).limit(10).all()
        
        # 매칭된 리뷰가 적으면 랜덤으로 일부 추가
        if len(crawled_reviews) < 5:
            additional_reviews = db.query(CrawledReview).limit(10).all()
            crawled_reviews.extend(additional_reviews)
        
        # 중복 제거
        seen_ids = set()
        unique_crawled_reviews = []
        for review in crawled_reviews:
            if review.id not in seen_ids:
                unique_crawled_reviews.append(review)
                seen_ids.add(review.id)
        
        crawled_reviews = unique_crawled_reviews[:15]  # 최대 15개만
        
        for review in crawled_reviews:
            # 사용자명 익명 처리
            import random
            user_name = f"사용자{random.randint(1000, 9999)}"
            
            # 날짜 처리
            if hasattr(review, 'review_date') and review.review_date and review.review_date.strip():
                review_date = review.review_date[:10] if len(review.review_date) > 10 else review.review_date
            else:
                from datetime import datetime, timedelta
                days_ago = random.randint(1, 90)
                review_date = (datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d")
            
            # 리뷰 내용 처리
            comment = "좋은 제품입니다."
            if hasattr(review, 'content') and review.content:
                comment = review.content
            elif hasattr(review, 'review_text') and review.review_text:
                comment = review.review_text
            
            # 평점 처리
            rating = 4.0
            if hasattr(review, 'rating') and review.rating:
                rating = float(review.rating)
            
            reviews.append({
                "id": f"crawled_{review.id}",
                "userName": user_name,
                "rating": rating,
                "comment": comment,
                "date": review_date,
                "skinType": getattr(review, 'skin_type', None) or '복합성',
                "helpful": getattr(review, 'helpful_count', None) or random.randint(0, 20),
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
        
        print(f"✅ 제품 {product_id} ({product.name}) 리뷰 조회: 사용자 {len(user_reviews)}개 + 크롤링 {len(crawled_reviews)}개 = 총 {len(reviews)}개")
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

@app.get("/api/products/{product_id}/shops")
def get_product_shops_api(product_id: int, db: Session = Depends(get_db)):
    """제품 쇼핑몰 판매정보 조회"""
    try:
        from core.models.db_models import ProductShop, Shop, Product
        
        # 제품이 존재하는지 먼저 확인
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"제품 ID {product_id}를 찾을 수 없습니다")
        
        # 제품의 쇼핑몰 판매정보 조회
        product_shops_query = (
            db.query(ProductShop, Shop)
            .join(Shop, ProductShop.shop_id == Shop.id)
            .filter(ProductShop.product_id == product_id)
            .order_by(ProductShop.price.asc())  # 가격 순으로 정렬
        )
        
        product_shops = product_shops_query.all()
        
        if not product_shops:
            # 쇼핑몰 정보가 없으면 기본 쇼핑몰 정보 생성
            print(f"⚠️ 제품 {product_id}에 쇼핑몰 정보가 없어 기본 정보를 생성합니다.")
            
            # 기본 쇼핑몰들 조회
            shops = db.query(Shop).limit(4).all()
            
            if shops:
                # 제품 기본 가격 기준으로 쇼핑몰 정보 생성
                base_price = product.price if product.price else 30000
                
                for i, shop in enumerate(shops):
                    shop_price = base_price + (i * 1000)  # 쇼핑몰별로 1000원씩 차이
                    is_lowest = (i == 0)
                    shipping_fee = 0 if shop_price >= 30000 or i == 0 else 2500
                    
                    product_shop = ProductShop(
                        product_id=product_id,
                        shop_id=shop.id,
                        price=shop_price,
                        shipping="무료배송" if shipping_fee == 0 else "유료배송",
                        shipping_fee=shipping_fee,
                        installment=f"{2+i}개월" if shop_price >= 20000 else None,
                        is_free_shipping=(shipping_fee == 0),
                        is_lowest_price=is_lowest,
                        is_card_discount=(i % 2 == 1)
                    )
                    db.add(product_shop)
                
                db.commit()
                
                # 다시 조회
                product_shops_query = (
                    db.query(ProductShop, Shop)
                    .join(Shop, ProductShop.shop_id == Shop.id)
                    .filter(ProductShop.product_id == product_id)
                    .order_by(ProductShop.price.asc())
                )
                product_shops = product_shops_query.all()
        
        # 응답 데이터 포맷팅
        shops_data = []
        for product_shop, shop in product_shops:
            shops_data.append({
                "id": shop.id,
                "name": shop.name,
                "price": product_shop.price,
                "shipping": product_shop.shipping,
                "shippingFee": product_shop.shipping_fee,
                "installment": product_shop.installment,
                "isFreeShipping": product_shop.is_free_shipping,
                "isLowestPrice": product_shop.is_lowest_price,
                "isCardDiscount": product_shop.is_card_discount,
                "logo": shop.logo_url,
                "url": shop.url
            })
        
        print(f"✅ 제품 {product_id} 쇼핑몰 정보 조회: {len(shops_data)}개 쇼핑몰")
        
        return {
            "success": True,
            "data": shops_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 제품 쇼핑몰 정보 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=f"제품 쇼핑몰 정보 조회 중 오류가 발생했습니다: {str(e)}")

# ========== 진료 요청서 API ==========
@app.post("/api/medical/diagnosis-requests")
async def create_diagnosis_request(request: Request, db: Session = Depends(get_db)):
    """진료 요청서 제출"""
    try:
        # Raw request body 읽기
        body = await request.body()
        data = json.loads(body.decode('utf-8'))
        print(f"🔍 진료 요청서 데이터: {data}")
        
        # DiagnosisRequest 객체 생성
        diagnosis_request = DiagnosisRequest(
            user_id=data.get("userId", 1),  # 실제로는 인증에서 가져와야 함
            symptoms=data.get("symptoms", ""),
            duration=data.get("duration", ""),
            severity=data.get("severity", "mild"),
            previous_treatment=data.get("previousTreatment", ""),
            allergies=data.get("allergies", ""),
            medications=data.get("medications", ""),
            medical_history=data.get("medicalHistory", ""),
            additional_notes=data.get("additionalNotes", ""),
            images=data.get("images", []),  # JSON 배열로 저장
            status="pending"
        )
        
        db.add(diagnosis_request)
        db.commit()
        db.refresh(diagnosis_request)
        
        print(f"✅ 진료 요청서 생성 성공: {diagnosis_request.id}")
        
        return {
            "success": True,
            "requestId": diagnosis_request.id,
            "message": "진료 요청서가 제출되었습니다",
            "data": {
                "id": diagnosis_request.id,
                "status": diagnosis_request.status,
                "createdAt": diagnosis_request.created_at.isoformat()
            }
        }
    except Exception as e:
        print(f"❌ 진료 요청서 생성 실패: {e}")
        raise HTTPException(status_code=500, detail=f"진료 요청서 제출 실패: {str(e)}")

@app.get("/api/medical/diagnosis-requests")
def get_diagnosis_requests(user_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """진료 요청서 목록 조회"""
    try:
        from core.models.db_models import DiagnosisRequest, User
        
        query = db.query(DiagnosisRequest)
        if user_id:
            query = query.filter(DiagnosisRequest.user_id == user_id)
        
        diagnosis_requests = query.offset(skip).limit(limit).all()
        
        formatted_requests = []
        for request in diagnosis_requests:
            # 사용자 정보 조회
            user = db.query(User).filter(User.id == request.user_id).first()
            
            formatted_requests.append({
                "id": request.id,
                "userId": request.user_id,
                "userName": user.username if user else "사용자",
                "symptoms": request.symptoms,
                "duration": request.duration,
                "severity": request.severity,
                "status": request.status,
                "createdAt": request.created_at.strftime("%Y-%m-%d %H:%M"),
                "hasImages": bool(request.images and len(request.images) > 0)
            })
        
        return {
            "success": True,
            "data": formatted_requests
        }
    except Exception as e:
        print(f"❌ 진료 요청서 목록 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="진료 요청서 목록 조회 중 오류가 발생했습니다")

@app.get("/api/medical/diagnosis-requests/{request_id}")
def get_diagnosis_request(request_id: int, db: Session = Depends(get_db)):
    """진료 요청서 상세 조회"""
    try:
        from core.models.db_models import DiagnosisRequest, User
        
        request_obj = db.query(DiagnosisRequest).filter(DiagnosisRequest.id == request_id).first()
        if not request_obj:
            raise HTTPException(status_code=404, detail="진료 요청서를 찾을 수 없습니다")
        
        # 사용자 정보 조회
        user = db.query(User).filter(User.id == request_obj.user_id).first()
        
        return {
            "success": True,
            "data": {
                "id": request_obj.id,
                "userId": request_obj.user_id,
                "userName": user.username if user else "사용자",
                "userAge": user.age if user else 0,
                "userGender": user.gender if user else "unknown",
                "userPhone": user.phone_number if user else "",
                "userEmail": user.email if user else "",
                "symptoms": request_obj.symptoms,
                "duration": request_obj.duration,
                "severity": request_obj.severity,
                "previousTreatment": request_obj.previous_treatment,
                "allergies": request_obj.allergies,
                "medications": request_obj.medications,
                "medicalHistory": request_obj.medical_history,
                "additionalNotes": request_obj.additional_notes,
                "images": request_obj.images or [],
                "status": request_obj.status,
                "createdAt": request_obj.created_at.strftime("%Y-%m-%d %H:%M"),
                "reviewedByDoctorId": request_obj.reviewed_by_doctor_id,
                "reviewNotes": request_obj.review_notes,
                "reviewedAt": request_obj.reviewed_at.strftime("%Y-%m-%d %H:%M") if request_obj.reviewed_at else None
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 진료 요청서 상세 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="진료 요청서 조회 중 오류가 발생했습니다")

@app.get("/api/medical/diagnosis-requests/{request_id}/patient-detail")
def get_patient_detail_from_diagnosis_request(request_id: int, db: Session = Depends(get_db)):
    """진료 요청서 기반 환자 상세 정보 조회"""
    try:
        from core.models.db_models import DiagnosisRequest, User
        
        request_obj = db.query(DiagnosisRequest).filter(DiagnosisRequest.id == request_id).first()
        if not request_obj:
            raise HTTPException(status_code=404, detail="진료 요청서를 찾을 수 없습니다")
        
        # 사용자 정보 조회
        user = db.query(User).filter(User.id == request_obj.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="환자 정보를 찾을 수 없습니다")
        
        # 통증 정도 매핑
        severity_mapping = {
            "mild": "약간",
            "moderate": "중간 정도", 
            "severe": "심함"
        }
        
        return {
            "success": True,
            "data": {
                # 기본 환자 정보 (User 테이블에서)
                "id": str(request_obj.id),
                "name": user.username,
                "age": user.age,
                "gender": "남성" if user.gender == "male" else "여성",
                "phone": user.phone_number,
                "email": user.email,
                "address": "정보 없음",  # DB에 없는 필드
                "emergencyContact": "정보 없음",  # DB에 없는 필드
                
                # 의료 정보 (DiagnosisRequest 테이블에서)
                "allergies": request_obj.allergies or "정보 없음",
                "currentMedications": request_obj.medications or "정보 없음",
                "medicalHistory": request_obj.medical_history or "정보 없음",
                
                # 진료 요청 내용
                "symptoms": request_obj.symptoms,
                "symptomDuration": request_obj.duration or "정보 없음",
                "painLevel": severity_mapping.get(request_obj.severity, request_obj.severity or "정보 없음"),
                "previousTreatment": request_obj.previous_treatment or "정보 없음",
                "requestDate": request_obj.created_at.strftime("%Y-%m-%d"),
                "appointmentTime": "09:00",  # 기본값 (실제로는 appointment 테이블과 연결 필요)
                "images": request_obj.images or [],
                
                # 추가 정보
                "diagnosisRequestId": request_obj.id,
                "status": request_obj.status
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 환자 상세 정보 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="환자 상세 정보 조회 중 오류가 발생했습니다")

@app.patch("/api/medical/diagnosis-requests/{request_id}")
def update_diagnosis_request_status(request_id: int, data: dict, db: Session = Depends(get_db)):
    """진료 요청서 상태 업데이트"""
    try:
        from core.models.db_models import DiagnosisRequest
        
        request_obj = db.query(DiagnosisRequest).filter(DiagnosisRequest.id == request_id).first()
        if not request_obj:
            raise HTTPException(status_code=404, detail="진료 요청서를 찾을 수 없습니다")
        
        # 상태 업데이트
        if "status" in data:
            request_obj.status = data["status"]
        if "reviewedByDoctorId" in data:
            request_obj.reviewed_by_doctor_id = data["reviewedByDoctorId"]
        if "reviewNotes" in data:
            request_obj.review_notes = data["reviewNotes"]
        
        # 검토 완료 시 시간 기록
        if data.get("status") == "reviewed":
            request_obj.reviewed_at = datetime.now()
        
        db.commit()
        
        return {
            "success": True,
            "message": f"진료 요청서 상태가 '{request_obj.status}'로 변경되었습니다",
            "data": {
                "id": request_obj.id,
                "status": request_obj.status,
                "updatedAt": request_obj.updated_at.isoformat()
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 진료 요청서 상태 업데이트 실패: {e}")
        raise HTTPException(status_code=500, detail="진료 요청서 상태 업데이트 중 오류가 발생했습니다")

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
def get_appointments_api(user_id: Optional[int] = None, doctor_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """예약 목록 조회"""
    try:
        from medical_schemas import AppointmentSearchParams
        from core.models.medical_models import MedicalRecord
        from core.models.db_models import User
        
        # user_id 또는 doctor_id 기반으로 검색 파라미터 설정
        search_params = None
        if user_id:
            search_params = AppointmentSearchParams(user_id=user_id)
        elif doctor_id:
            search_params = AppointmentSearchParams(doctor_id=doctor_id)
        
        appointments = get_appointments(db, skip=skip, limit=limit, search_params=search_params)
        
        result = []
        for appointment in appointments:
            # 진료 기록 존재 여부 확인
            medical_record = db.query(MedicalRecord).filter(
                MedicalRecord.appointment_id == appointment.id
            ).first()
            has_medical_record = medical_record is not None
            
            # 사용자 정보 조회
            user = db.query(User).filter(User.id == appointment.user_id).first()
            
            result.append({
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
                "diagnosis_request_id": appointment.diagnosis_request_id,
                # 진료 기록 관련 정보 추가
                "hasMedicalRecord": has_medical_record,
                "medicalRecordId": medical_record.id if medical_record else None,
                # 사용자 정보 추가
                "user": {
                    "id": user.id if user else appointment.user_id,
                    "username": user.username if user else "환자",
                    "email": user.email if user else "",
                    "phone_number": user.phone_number if user else "",
                    "age": user.age if user else 0,
                    "gender": user.gender if user and user.gender else "unknown"
                }
            })
        
        return result
    except Exception as e:
        print(f"❌ 예약 목록 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="예약 목록 조회 중 오류가 발생했습니다")

@app.post("/api/medical/appointments")
async def create_appointment_api(request: Request, db: Session = Depends(get_db)):
    """예약 생성"""
    try:
        # Raw request body 읽기
        body = await request.body()
        print(f"🔍 Raw request body: {body}")
        
        # JSON 파싱
        import json
        data = json.loads(body.decode('utf-8'))
        print(f"🔍 파싱된 JSON 데이터: {data}")
        
        from medical_schemas import AppointmentCreate
        from datetime import datetime
        
        print(f"🔍 받은 예약 데이터: {data}")
        
        # images 필드 제거 (백엔드에서 처리하지 않음)
        appointment_data_dict = {
            "user_id": data.get("userId", 1),  # 기본값
            "doctor_id": data["doctorId"],
            "hospital_id": data.get("hospitalId", 1),  # 기본값
            "appointment_date": datetime.strptime(data["date"], "%Y-%m-%d").date(),
            "appointment_time": datetime.strptime(data["time"], "%H:%M").time(),
            "symptoms": data.get("symptoms", ""),
            "consultation_type": data.get("consultationType", "일반진료")
        }
        
        print(f"🔍 변환된 예약 데이터: {appointment_data_dict}")
        
        appointment_data = AppointmentCreate(**appointment_data_dict)
        print(f"🔍 AppointmentCreate 객체 생성 성공")
        
        appointment = create_appointment(db, appointment_data)
        print(f"🔍 예약 생성 성공: {appointment.id}")
        
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
    except json.JSONDecodeError as e:
        print(f"❌ JSON 파싱 실패: {e}")
        raise HTTPException(status_code=422, detail=f"올바르지 않은 JSON 형식: {str(e)}")
    except KeyError as e:
        print(f"❌ 필수 필드 누락: {e}")
        raise HTTPException(status_code=422, detail=f"필수 필드가 누락되었습니다: {str(e)}")
    except ValueError as e:
        print(f"❌ 데이터 형식 오류: {e}")
        raise HTTPException(status_code=422, detail=f"데이터 형식이 올바르지 않습니다: {str(e)}")
    except Exception as e:
        print(f"❌ 예약 생성 실패: {e}")
        print(f"❌ 에러 타입: {type(e)}")
        raise HTTPException(status_code=500, detail=f"예약 생성 중 오류가 발생했습니다: {str(e)}")

@app.delete("/api/medical/appointments/{appointment_id}")
def cancel_appointment_api(appointment_id: int, reason: str = "사용자 요청에 의한 취소", db: Session = Depends(get_db)):
    """예약 취소 (환자 측)"""
    try:
        from core.models.medical_models import DoctorNotification
        
        print(f"🔄 환자 측 예약 취소 요청: appointment_id={appointment_id}, reason={reason}")
        
        # 기본값으로 취소 사유와 취소자 정보 전달
        appointment = cancel_appointment(
            db, 
            appointment_id, 
            cancellation_reason=reason, 
            cancelled_by="user"
        )
        if not appointment:
            raise HTTPException(status_code=404, detail="예약을 찾을 수 없습니다")
        
        # 의사에게 알림 생성
        try:
            doctor_notification = DoctorNotification(
                appointment_id=appointment_id,
                is_read=False,
                cancellation_reason=reason,
                cancelled_by="user"
            )
            db.add(doctor_notification)
            db.commit()
            print(f"✅ 의사 알림 생성 완료: appointment_id={appointment_id}, reason={reason}")
        except Exception as notification_error:
            print(f"⚠️ 의사 알림 생성 실패: {notification_error}")
            # 알림 생성 실패해도 예약 취소는 유지
        
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
        
        # 사용자 정보 조회 - appointment.user에서 가져오기
        user = getattr(appointment, 'user', None)
        
        print(f"🔍 조회된 사용자 정보: user_id={appointment.user_id}")
        if user:
            print(f"🔍 사용자 상세: username={user.username}, age={user.age}, gender={user.gender}")
        else:
            print(f"❌ 사용자 정보를 찾을 수 없음: user_id={appointment.user_id}")
            # 전체 사용자 목록 확인
            all_users = db.query(User).all()
            print(f"🔍 전체 사용자 목록: {[(u.id, u.username) for u in all_users]}")

        response_data = {
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
            "createdAt": appointment.created_at.isoformat(),
            # 사용자 정보를 user 객체로 포함
            "user": {
                "id": user.id if user else appointment.user_id,
                "username": user.username if user else "환자",
                "email": user.email if user else "",
                "phone_number": user.phone_number if user else "",
                "age": user.age if user else None,
                "gender": user.gender if user and user.gender else None
            } if user else None,
            # 기존 필드도 유지 (하위 호환성)
            "userName": user.username if user else "환자",
            "userAge": user.age if user else None,
            "userGender": user.gender if user and user.gender else None,
            "userPhone": user.phone_number if user else "",
            "userEmail": user.email if user else "",
            "consultationType": appointment.consultation_type or "일반진료"
        }
        
        print(f"🔍 반환할 응답 데이터: userName={response_data['userName']}, userAge={response_data['userAge']}, userGender={response_data['userGender']}")
        
        return response_data
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
            ("./crawler/data/reviews_bulk_toner.csv", "토너"),
            ("./crawler/data/reviews_bulk_cream.csv", "크림"), 
            ("./crawler/data/reviews_bulk_ampoule.csv", "앰플")
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
            "doctors", "hospitals", "diagnosis_requests", "product_shops", "product_benefits", 
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
        
        # 2-1. AI 피부 분석 테이블 생성
        print("🔬 2-1단계: AI 피부 분석 테이블 생성 중...")
        try:
            from create_skin_analysis_tables import create_skin_analysis_tables, create_indexes
            
            # AI 피부 분석 테이블들 생성 (프로그래밍 방식으로)
            from core.models.db_models import (
                SkinAnalysisResult, 
                SkinAnalysisConcern, 
                SkinAnalysisRecommendation, 
                SkinAnalysisImage
            )
            
            # 특정 테이블들만 생성 (기존 테이블은 건드리지 않음)
            tables_to_create = [
                SkinAnalysisResult.__table__,
                SkinAnalysisConcern.__table__,
                SkinAnalysisRecommendation.__table__,
                SkinAnalysisImage.__table__
            ]
            
            for table in tables_to_create:
                print(f"✅ AI 테이블 생성: {table.name}")
                table.create(engine, checkfirst=True)
            
            # AI 피부 분석 인덱스들 생성
            with engine.connect() as conn:
                indexes = [
                    "CREATE INDEX IF NOT EXISTS idx_user_recent_analysis ON skin_analysis_results(user_id, analysis_date DESC);",
                    "CREATE INDEX IF NOT EXISTS idx_medical_attention_cases ON skin_analysis_results(needs_medical_attention, analysis_date DESC);",
                    "CREATE INDEX IF NOT EXISTS idx_skin_type_stats ON skin_analysis_results(skin_type, analysis_date);",
                    "CREATE INDEX IF NOT EXISTS idx_concern_search ON skin_analysis_concerns(concern, severity);",
                    "CREATE INDEX IF NOT EXISTS idx_recommendation_type ON skin_analysis_recommendations(recommendation_type, priority);"
                ]
                
                for index_sql in indexes:
                    print(f"📌 AI 인덱스 생성: {index_sql}")
                    conn.execute(text(index_sql))
                    conn.commit()
            
            print("✅ AI 피부 분석 테이블 및 인덱스 생성 완료")
        except Exception as e:
            print(f"⚠️ AI 피부 분석 테이블 생성 중 오류 (계속 진행): {e}")
        
        # 2-2. birthdate 컬럼 추가 (테이블이 이미 생성된 경우를 위해)
        print("📅 2-2단계: users 테이블에 birthdate 컬럼 추가 중...")
        db = SessionLocal()
        try:
            # birthdate 컬럼이 없으면 추가
            db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS birthdate DATE"))
            db.commit()
            print("✅ birthdate 컬럼 추가 완료")
        except Exception as e:
            print(f"⚠️ birthdate 컬럼 추가 중 오류 (이미 존재할 수 있음): {e}")
        finally:
            db.close()
        
        # 3. 기본 데이터 추가 (사용자, 쇼핑몰 등)
        print("👥 3단계: 기본 데이터 추가 중...")
        db = SessionLocal()
        try:
            # 사용자 데이터 (나이에 맞는 생년월일 계산)
            from datetime import date
            current_year = date.today().year
            
            users = [
                User(
                    email="test@example.com", 
                    hashed_password="hashed_password", 
                    username="김영미", 
                    phone_number="010-1234-5678",
                    gender=GenderEnum.female,
                    age=25,
                    skin_type="지성",
                    birthdate=date(current_year - 24, 3, 15)  # 25세 → 1999년생
                ),
                User(
                    email="user2@example.com", 
                    hashed_password="hashed_password2", 
                    username="박남한", 
                    phone_number="010-2345-6789",
                    gender=GenderEnum.male,
                    age=30,
                    skin_type="건성",
                    birthdate=date(current_year - 29, 7, 22)  # 30세 → 1994년생
                ),
                User(
                    email="user3@example.com", 
                    hashed_password="hashed_password3", 
                    username="정아연", 
                    phone_number="010-3456-7890",
                    gender=GenderEnum.female,
                    age=28,
                    skin_type="복합성",
                    birthdate=date(current_year - 27, 11, 8)  # 28세 → 1996년생
                ),
                User(
                    email="user4@example.com", 
                    hashed_password="hashed_password4", 
                    username="이소영", 
                    phone_number="010-4567-8901",
                    gender=GenderEnum.female,
                    age=32,
                    skin_type="민감성",
                    birthdate=date(current_year - 31, 5, 3)  # 32세 → 1992년생
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
                        specialization="피부과",
                        experience_years=12,
                        education="연세대학교 의과대학 졸업\n연세대학교병원 성형외과 전공의\n대한성형외과학회 정회원",
                        description="피부과 전문의로 여드름과 기미 치료를 전문으로 합니다.",
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
                # user_id=1 (테스트사용자)의 다양한 예약들
                Appointment(
                    user_id=1,
                    doctor_id=1,
                    hospital_id=1,
                    appointment_date=date(2025, 3, 10),
                    appointment_time=time(14, 0),
                    status='completed',
                    symptoms='얼굴 여드름 치료 상담',
                    notes='첫 방문 - 여드름 치료',
                    consultation_type='일반진료',
                    diagnosis_request_id=1  # 나중에 연결
                ),
                Appointment(
                    user_id=1,
                    doctor_id=1,
                    hospital_id=1,
                    appointment_date=date(2025, 3, 20),
                    appointment_time=time(15, 30),
                    status='confirmed',
                    symptoms='여드름 재진 - 약물 효과 확인',
                    notes='2주 후 재진',
                    consultation_type='재진',
                    diagnosis_request_id=1
                ),
                Appointment(
                    user_id=1,
                    doctor_id=4,
                    hospital_id=1,
                    appointment_date=date(2025, 6, 25),
                    appointment_time=time(16, 0),
                    status='pending',
                    symptoms='피부 톤 개선 상담',
                    notes='레이저 치료 문의',
                    consultation_type='피부상담',
                    diagnosis_request_id=1
                ),
                Appointment(
                    user_id=1,
                    doctor_id=1,
                    hospital_id=3,
                    appointment_date=date(2025, 4, 5),
                    appointment_time=time(10, 30),
                    status='confirmed',
                    symptoms='알레르기 피부염 검사',
                    notes='알레르기 테스트 필요',
                    consultation_type='피부분석',
                    diagnosis_request_id=1
                ),
                # ⭐ 사용자 취소된 예약들 (알림 데이터용)
                Appointment(
                    user_id=2,
                    doctor_id=1,
                    hospital_id=1,
                    appointment_date=date(2025, 2, 28),
                    appointment_time=time(11, 0),
                    status='cancelled',
                    symptoms='피부 미용 상담',
                    notes='환자 측에서 개인 사정으로 취소',
                    consultation_type='피부상담',
                    cancellation_reason='개인 사정으로 일정 변경',
                    cancelled_by='user'
                ),
                Appointment(
                    user_id=3,
                    doctor_id=1,
                    hospital_id=1,
                    appointment_date=date(2025, 3, 5),
                    appointment_time=time(14, 30),
                    status='cancelled',
                    symptoms='아토피 재진 예약',
                    notes='환자가 다른 병원으로 이전',
                    consultation_type='재진',
                    cancellation_reason='다른 병원으로 이전하게 되어 취소합니다',
                    cancelled_by='user'
                ),
                Appointment(
                    user_id=4,
                    doctor_id=1,
                    hospital_id=1,
                    appointment_date=date(2025, 3, 12),
                    appointment_time=time(9, 30),
                    status='cancelled',
                    symptoms='기미 치료 상담',
                    notes='환자 측 갑작스런 해외 출장',
                    consultation_type='피부상담',
                    cancellation_reason='갑작스런 해외 출장으로 인한 취소',
                    cancelled_by='user'
                ),
                # 다른 사용자들의 예약
                Appointment(
                    user_id=2,
                    doctor_id=1,
                    hospital_id=2,
                    appointment_date=date(2025, 3, 18),
                    appointment_time=time(15, 30),
                    status='completed',
                    symptoms='기미 치료 상담',
                    notes='기미 치료',
                    consultation_type='피부상담',
                    diagnosis_request_id=2
                ),
                Appointment(
                    user_id=3,
                    doctor_id=1,
                    hospital_id=3,
                    appointment_date=date(2025, 3, 22),
                    appointment_time=time(10, 0),
                    status='completed',
                    symptoms='아토피 재진',
                    notes='약물 처방 변경',
                    consultation_type='재진',
                    diagnosis_request_id=3
                ),
                Appointment(
                    user_id=4,
                    doctor_id=1,
                    hospital_id=1,
                    appointment_date=date(2025, 3, 30),
                    appointment_time=time(16, 0),
                    status='pending',
                    symptoms='기미 레이저 치료',
                    notes='IPL 레이저 상담',
                    consultation_type='피부상담',
                    diagnosis_request_id=4
                ),
                # 추가 예약들 (더 많은 데이터)
                Appointment(
                    user_id=1,  # 박남한 → 김영미
                    doctor_id=1,
                    hospital_id=1,
                    appointment_date=date(2025, 3, 18),
                    appointment_time=time(11, 30),
                    status='completed',
                    symptoms='여드름 경과 확인',
                    notes='치료 1주차 경과',
                    consultation_type='재진'
                ),
                Appointment(
                    user_id=1,  # 정아연 → 김영미
                    doctor_id=1,
                    hospital_id=1,
                    appointment_date=date(2025, 3, 22),
                    appointment_time=time(9, 0),
                    status='completed',
                    symptoms='알레르기 반응 응급 상담',
                    notes='자외선 노출 후 피부 반응',
                    consultation_type='일반진료'
                ),
                Appointment(
                    user_id=1,  # 이소영 → 김영미
                    doctor_id=1,
                    hospital_id=1,
                    appointment_date=date(2025, 6, 15),
                    appointment_time=time(14, 30),
                    status='confirmed',
                    symptoms='여드름 치료 완료 후 관리',
                    notes='치료 완료 후 관리 방법 상담',
                    consultation_type='재진'
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
                    diagnosis="아토피 피부염",
                    treatment="항히스타민제 처방 및 보습제 사용법 안내",
                    prescription="세티리진 10mg 1일 1회, 스테로이드 연고",
                    next_visit_date=date(2024, 4, 25),
                    notes="증상 호전 양상. 보습제 꾸준히 사용할 것"
                ),
                # user_id=1의 완료된 예약에 대한 진료 기록
                MedicalRecord(
                    appointment_id=1,  # user_id=1의 첫 번째 completed 예약
                    diagnosis="중등도 여드름 (Acne vulgaris)",
                    severity="moderate",
                    treatment="항생제 치료 및 국소 레티노이드 적용",
                    prescription="독시사이클린 100mg 1일 2회, 트레티노인 크림 0.05% 취침 전 적용",
                    precautions="임신 가능성 있는 경우 즉시 연락, 자외선 노출 주의, 과도한 세안 금지",
                    next_visit_date=date(2024, 3, 24),
                    notes="2주 후 재진 예정. 약물 부작용 모니터링 필요"
                ),
                # 다른 사용자의 진료 기록
                MedicalRecord(
                    appointment_id=6,  # user_id=1의 completed 예약
                    diagnosis="기미 (Melasma)",
                    severity="mild",
                    treatment="IPL 레이저 치료 상담 및 관리법 안내",
                    prescription="하이드로퀴논 크림 2% 취침 전 적용, 자외선 차단제 SPF50+ 필수",
                    precautions="치료 후 자외선 노출 금지, 강한 세안 금지, 보습제 충분히 사용",
                    next_visit_date=date(2024, 4, 18),
                    notes="레이저 치료 전 피부 상태 확인 완료. 2주 후 치료 시작 예정"
                ),
                MedicalRecord(
                    appointment_id=7,  # user_id=3의 completed 예약  
                    diagnosis="아토피 피부염 재발",
                    severity="moderate",
                    treatment="항히스타민제 처방 및 보습제 사용법 안내",
                    prescription="세티리진 10mg 1일 1회, 하이드로코티손 크림 1% 1일 2회",
                    precautions="알레르기 유발 요소 회피, 미지근한 물로 샤워, 면 소재 의류 착용",
                    next_visit_date=date(2024, 4, 22),
                    notes="증상 호전 양상. 보습제 꾸준히 사용할 것. 스트레스 관리 필요"
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
                    doctor_id=1,
                    appointment_id=3,
                    rating=5,
                    review_text="친절하고 자세한 설명해주셔서 감사합니다. 치료 효과도 좋아요."
                ),
                # user_id=1이 작성한 리뷰들
                DoctorReview(
                    user_id=1,
                    doctor_id=1,
                    appointment_id=1,
                    rating=5,
                    review_text="김민수 선생님 정말 친절하시고 꼼꼼하게 진료해주셨어요. 여드름 치료 계획도 자세히 설명해주셔서 안심이 됩니다. 2주 후 재진 예약도 잡았어요!"
                ),
                # 다른 사용자들의 리뷰
                DoctorReview(
                    user_id=2,
                    doctor_id=2,
                    appointment_id=6,
                    rating=4,
                    review_text="보톡스 시술 받았는데 자연스럽게 잘 되었어요. 다만 대기시간이 조금 길었습니다."
                ),
                DoctorReview(
                    user_id=3,
                    doctor_id=3,
                    appointment_id=7,
                    rating=5,
                    review_text="아토피 치료 전문가이신 것 같아요. 생활 습관 개선 방법까지 알려주셔서 감사합니다."
                ),
                # 추가 리뷰들 (다른 예약 기록이 없는 가상 리뷰)
                DoctorReview(
                    user_id=1,
                    doctor_id=4,
                    appointment_id=None,  # 이전 방문 기록
                    rating=4,
                    review_text="레이저 치료 상담을 받았는데 설명이 전문적이고 좋았어요. 다음에 시술 받아보려고 합니다."
                ),
                DoctorReview(
                    user_id=4,
                    doctor_id=1,
                    appointment_id=None,
                    rating=5,
                    review_text="여드름 흉터 치료로 방문했는데 결과가 만족스러워요. 꾸준한 관리가 중요하다고 하셨는데 정말 맞는 것 같아요."
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
            
            # ⭐ DoctorNotification 샘플 데이터 추가 (사용자 취소 알림)
            print("🔔 알림 데이터 추가 중...")
            from core.models.medical_models import DoctorNotification
            from datetime import datetime
            
            # 사용자가 취소한 예약들 조회 (appointment_id 5, 6, 7)
            cancelled_appointments = db.query(Appointment).filter(
                Appointment.status == 'cancelled',
                Appointment.cancelled_by == 'user'
            ).all()
            
            doctor_notifications = []
            for i, appointment in enumerate(cancelled_appointments[:3]):  # 처음 3개만
                # 환자 정보 조회
                user = db.query(User).filter(User.id == appointment.user_id).first()
                patient_name = user.username if user else "환자"
                
                notification = DoctorNotification(
                    appointment_id=appointment.id,
                    is_read=False,
                    cancellation_reason=appointment.cancellation_reason,
                    cancelled_by=appointment.cancelled_by,
                    created_at=datetime.now(),
                    read_at=None
                )
                doctor_notifications.append(notification)
            
            for notification in doctor_notifications:
                db.add(notification)
            
            db.commit()
            print(f"✅ 알림 데이터 추가 완료: {len(doctor_notifications)}개 알림")
            
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
                ("./crawler/data/product_list_toner.csv", "토너"),
                ("./crawler/data/product_list_cream.csv", "크림"), 
                ("./crawler/data/product_list_ampoule.csv", "앰플")
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
                ("./crawler/data/reviews_bulk_toner.csv", "토너"),
                ("./crawler/data/reviews_bulk_cream.csv", "크림"), 
                ("./crawler/data/reviews_bulk_ampoule.csv", "앰플")
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

        # 6. 진료 요청서 샘플 데이터 추가 (의료진 데이터 추가 후)
        print("📋 6단계: 진료 요청서 샘플 데이터 추가 중...")
        
        try:
            from datetime import datetime, timedelta
            db = SessionLocal()
            
            # 기존 진료 요청서 데이터 삭제
            db.execute(text("DELETE FROM diagnosis_requests"))
            db.commit()
            
            # 샘플 진료 요청서 데이터
            diagnosis_requests = [
                DiagnosisRequest(
                    user_id=1,
                    symptoms="피부에 발진이 생겼어요. 가려움증도 있습니다.",
                    duration="며칠",
                    severity="moderate",
                    previous_treatment="특별한 치료 없음",
                    allergies="없음",
                    medications="없음",
                    medical_history="없음",
                    additional_notes="볼과 이마 부분에 집중되어 있고, 간지러워서 자꾸 긁게 됩니다.",
                    images=[],
                    status="pending"
                ),
                DiagnosisRequest(
                    user_id=2,
                    symptoms="여드름이 심해졌어요. 염증도 있는 것 같습니다.",
                    duration="2주째",
                    severity="severe",
                    previous_treatment="시중 여드름 연고 사용",
                    allergies="없음",
                    medications="없음",
                    medical_history="고등학교 때 여드름 치료 경험",
                    additional_notes="최근 스트레스를 많이 받아서 그런지 여드름이 악화되었습니다. 턱과 볼 주변에 화농성 여드름이 생겼어요.",
                    images=[],
                    status="reviewed",
                    reviewed_by_doctor_id=1,
                    review_notes="염증성 여드름으로 진단. 전문 치료 필요",
                    reviewed_at=datetime.now() - timedelta(hours=2)
                ),
                DiagnosisRequest(
                    user_id=3,
                    symptoms="건조하고 각질이 심해요. 화장이 들뜨는 증상도 있습니다.",
                    duration="1개월",
                    severity="mild",
                    previous_treatment="시중 보습제 사용",
                    allergies="없음",
                    medications="비타민 보충제",
                    medical_history="없음",
                    additional_notes="겨울이 되면서 피부가 너무 건조해졌습니다. 세안 후에는 당기는 느낌이 심하고, 화장을 해도 각질 때문에 들뜹니다.",
                    images=[],
                    status="pending"
                ),
                DiagnosisRequest(
                    user_id=4,
                    symptoms="알레르기 반응 같은 증상이 있어요. 붓기도 있습니다.",
                    duration="3일",
                    severity="severe",
                    previous_treatment="냉찜질, 항히스타민제 복용",
                    allergies="화장품 알레르기 의심",
                    medications="항히스타민제 복용 중",
                    medical_history="아토피 피부염 과거력",
                    additional_notes="새로운 화장품을 사용한 후부터 얼굴이 빨갛게 되고 부어올랐습니다. 접촉성 피부염이 의심됩니다.",
                    images=[],
                    status="pending"
                )
            ]
            
            for request in diagnosis_requests:
                existing = db.query(DiagnosisRequest).filter(
                    DiagnosisRequest.user_id == request.user_id,
                    DiagnosisRequest.symptoms == request.symptoms
                ).first()
                if not existing:
                    db.add(request)
            
            db.commit()
            print("✅ 진료 요청서 샘플 데이터 추가 완료")
            
            # 예약과 진료 요청서 연결
            try:
                from core.models.medical_models import Appointment
                
                diagnosis_request_1 = db.query(DiagnosisRequest).filter(DiagnosisRequest.user_id == 1).first()
                diagnosis_request_2 = db.query(DiagnosisRequest).filter(DiagnosisRequest.user_id == 2).first()
                diagnosis_request_3 = db.query(DiagnosisRequest).filter(DiagnosisRequest.user_id == 3).first()
                diagnosis_request_4 = db.query(DiagnosisRequest).filter(DiagnosisRequest.user_id == 4).first()
                
                appointment_1 = db.query(Appointment).filter(Appointment.user_id == 1).first()
                appointment_2 = db.query(Appointment).filter(Appointment.user_id == 2).first()
                appointment_3 = db.query(Appointment).filter(Appointment.user_id == 3).first()
                appointment_4 = db.query(Appointment).filter(Appointment.user_id == 4).first()
                
                if diagnosis_request_1 and appointment_1:
                    appointment_1.diagnosis_request_id = diagnosis_request_1.id
                if diagnosis_request_2 and appointment_2:
                    appointment_2.diagnosis_request_id = diagnosis_request_2.id
                if diagnosis_request_3 and appointment_3:
                    appointment_3.diagnosis_request_id = diagnosis_request_3.id
                if diagnosis_request_4 and appointment_4:
                    appointment_4.diagnosis_request_id = diagnosis_request_4.id
                
                db.commit()
                print("✅ 예약과 진료 요청서 연결 완료")
            except Exception as e:
                print(f"⚠️ 예약과 진료 요청서 연결 중 오류 (무시): {e}")
                
        except Exception as e:
            print(f"❌ 진료 요청서 데이터 추가 실패: {e}")
        finally:
            db.close()

        # 7. AI 피부 분석 샘플 데이터 추가
        print("🔬 7단계: AI 피부 분석 샘플 데이터 추가 중...")
        
        try:
            from skin_analysis_crud import create_skin_analysis_result
            from datetime import datetime, timedelta
            
            db = SessionLocal()
            
            # 샘플 AI 피부 분석 데이터 추가
            sample_analysis = create_skin_analysis_result(
                db=db,
                user_id=1,
                image_url="file://sample_skin_image.jpg",
                skin_type="oily",  # 영어로 저장 (프론트엔드에서 한국어로 변환)
                concerns=["acne", "pores"],  # 영어로 저장
                recommendations=["순한 세안제 사용 권장", "모공 관리 제품 사용", "유분기 적은 보습제 선택"],
                skin_disease=None,
                skin_state="lesion",  # 영어로 저장 (병변 상태)
                needs_medical_attention=True,
                confidence={
                    "skinType": 0.95,
                    "disease": 0.80,
                    "state": 0.87
                },
                detailed_analysis={
                    "model_version": "v1.0",
                    "processing_time": 2.3,
                    "regions_analyzed": ["T-zone", "cheeks", "jawline"]
                },
                analysis_date=datetime.now() - timedelta(days=1)  # 어제 분석된 것으로 설정
            )
            
            db.close()
            print("✅ AI 피부 분석 샘플 데이터 1개 추가 완료")
            
        except Exception as e:
            print(f"⚠️ AI 피부 분석 샘플 데이터 추가 중 오류 (무시): {e}")
                
        except Exception as e:
            print(f"❌ 진료 요청서 데이터 추가 실패: {e}")
        finally:
            db.close()

        return {
            "success": True,
            "message": "🎉 데이터베이스가 실제 크롤링 데이터로 완전히 초기화되었습니다!",
            "steps": [
                "1️⃣ 기존 데이터 완전 삭제",
                "2️⃣ 모든 테이블 생성",
                "2️⃣-1 AI 피부 분석 테이블 생성 (skin_analysis_results, skin_analysis_concerns, skin_analysis_recommendations, skin_analysis_images)",
                "3️⃣ 기본 데이터 추가 (사용자, 쇼핑몰, 병원, 의사)",
                "3️⃣-1 의료진 샘플 데이터 추가 (예약, 진료기록, 의사리뷰, 스케줄)",
                f"4️⃣ 실제 크롤링 제품 {import_response['summary']['총_제품']}개 추가",
                f"5️⃣ 실제 크롤링 리뷰 {import_response['summary']['리뷰_수']}개 추가",
                "6️⃣ 진료 요청서 샘플 데이터 4개 추가 및 예약 연결",
                "7️⃣ AI 피부 분석 샘플 데이터 1개 추가"
            ],
            "summary": {
                "제품_수": import_response['summary']['총_제품'],
                "리뷰_수": import_response['summary']['리뷰_수'],
                "진료요청서_수": 4,
                "카테고리": ["토너", "크림", "앰플"],
                "데이터_출처": "올리브영 크롤링"
            },
            "ready": [
                "✅ 실제 올리브영 제품 데이터!",
                f"✅ {import_response['summary']['리뷰_수']}개의 실제 사용자 리뷰!",
                "✅ 완전한 쇼핑몰 판매정보!",
                "✅ 진료 요청서 시스템 완비!",
                "✅ AI 피부 분석 시스템 완비!",
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
            ("./crawler/data/product_list_toner.csv", "토너"),
            ("./crawler/data/product_list_cream.csv", "크림"), 
            ("./crawler/data/product_list_ampoule.csv", "앰플")
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
                "doctorName": record.appointment.doctor.name if record.appointment and record.appointment.doctor else "의사 정보 없음",
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

@app.post("/api/medical/medical-records")
async def create_medical_record(request: Request, db: Session = Depends(get_db)):
    """진료 기록 생성"""
    try:
        print(f"🔥 진료 기록 생성 API 호출됨")
        
        # Raw request body 읽기
        body = await request.body()
        print(f"🔍 Raw body: {body}")
        
        data = json.loads(body.decode('utf-8'))
        print(f"🔍 진료 기록 생성 데이터: {data}")
        
        from core.models.medical_models import MedicalRecord
        
        # 필수 필드 확인
        if not data.get("appointment_id"):
            raise HTTPException(status_code=400, detail="예약 ID가 필요합니다")
        
        # 각 필드의 값과 타입 로그
        print(f"🔍 appointment_id: {data.get('appointment_id')} (type: {type(data.get('appointment_id'))})")
        print(f"🔍 diagnosis: {data.get('diagnosis')} (type: {type(data.get('diagnosis'))})")
        print(f"🔍 severity: {data.get('severity')} (type: {type(data.get('severity'))})")
        print(f"🔍 treatment: {data.get('treatment')} (type: {type(data.get('treatment'))})")
        print(f"🔍 prescription: {data.get('prescription')} (type: {type(data.get('prescription'))})")
        print(f"🔍 precautions: {data.get('precautions')} (type: {type(data.get('precautions'))})")
        print(f"🔍 next_visit_date: {data.get('next_visit_date')} (type: {type(data.get('next_visit_date'))})")
        print(f"🔍 notes: {data.get('notes')} (type: {type(data.get('notes'))})")
        
        # 데이터 전처리 및 유효성 검사
        def safe_string_or_none(value):
            if value is None or value == "" or str(value).strip() == "":
                return None
            return str(value).strip()
        
        def safe_date_or_none(value):
            if value is None or value == "" or str(value).strip() == "":
                return None
            try:
                from datetime import datetime
                return datetime.strptime(str(value), "%Y-%m-%d").date()
            except:
                return None
        
        # 필드 전처리
        processed_data = {
            "appointment_id": data.get("appointment_id"),
            "diagnosis": safe_string_or_none(data.get("diagnosis")),
            "severity": safe_string_or_none(data.get("severity")),
            "treatment": safe_string_or_none(data.get("treatment")),
            "prescription": safe_string_or_none(data.get("prescription")),
            "precautions": safe_string_or_none(data.get("precautions")),
            "next_visit_date": safe_date_or_none(data.get("next_visit_date")),
            "notes": safe_string_or_none(data.get("notes"))
        }
        
        print(f"🔧 전처리된 데이터: {processed_data}")
        
        # 필수 필드 체크
        if not processed_data["diagnosis"]:
            raise HTTPException(status_code=422, detail="진단명은 필수 입력 항목입니다.")
        if not processed_data["treatment"]:
            raise HTTPException(status_code=422, detail="치료 내용은 필수 입력 항목입니다.")
        
        # MedicalRecord 객체 생성
        try:
            medical_record = MedicalRecord(
                appointment_id=processed_data["appointment_id"],
                diagnosis=processed_data["diagnosis"],
                severity=processed_data["severity"],
                treatment=processed_data["treatment"],
                prescription=processed_data["prescription"],
                precautions=processed_data["precautions"],
                next_visit_date=processed_data["next_visit_date"],
                notes=processed_data["notes"]
            )
            print(f"✅ MedicalRecord 객체 생성 성공")
            
            db.add(medical_record)
            print(f"✅ DB에 추가 성공")
            
            db.commit()
            print(f"✅ DB 커밋 성공")
            
            db.refresh(medical_record)
            print(f"✅ 객체 새로고침 성공: ID {medical_record.id}")
            
        except Exception as db_error:
            print(f"❌ DB 작업 중 상세 에러: {db_error}")
            print(f"❌ 에러 타입: {type(db_error)}")
            db.rollback()
            raise db_error
        
        # 예약 상태를 'completed'로 업데이트
        from core.models.medical_models import Appointment
        appointment = db.query(Appointment).filter(Appointment.id == data.get("appointment_id")).first()
        if appointment:
            appointment.status = 'completed'
            db.commit()
        
        print(f"✅ 진료 기록 생성 성공: {medical_record.id}")
        
        return {
            "success": True,
            "recordId": medical_record.id,
            "message": "진료 기록이 성공적으로 저장되었습니다",
            "data": {
                "id": medical_record.id,
                "appointment_id": medical_record.appointment_id,
                "diagnosis": medical_record.diagnosis,
                "treatment": medical_record.treatment,
                "createdAt": medical_record.created_at.isoformat()
            }
        }
    except json.JSONDecodeError as e:
        print(f"❌ JSON 파싱 실패: {e}")
        raise HTTPException(status_code=422, detail=f"올바르지 않은 JSON 형식: {str(e)}")
    except ValueError as e:
        print(f"❌ 데이터 값 오류: {e}")
        raise HTTPException(status_code=422, detail=f"데이터 형식 오류: {str(e)}")
    except Exception as e:
        error_msg = str(e)
        print(f"❌ 진료 기록 생성 실패: {error_msg}")
        
        # 일반적인 DB 에러 패턴 체크
        if "NOT NULL constraint failed" in error_msg:
            raise HTTPException(status_code=422, detail="필수 입력 항목이 누락되었습니다. 진단명과 치료 내용을 확인해주세요.")
        elif "foreign key constraint failed" in error_msg:
            raise HTTPException(status_code=422, detail="잘못된 예약 ID입니다.")
        elif "UNIQUE constraint failed" in error_msg:
            raise HTTPException(status_code=422, detail="이미 해당 예약에 대한 진료 기록이 존재합니다.")
        else:
            raise HTTPException(status_code=500, detail=f"진료 기록 생성 중 오류가 발생했습니다: {error_msg}")

@app.get("/api/medical/medical-records/{record_id}")
def get_medical_record_detail(record_id: int, db: Session = Depends(get_db)):
    """진료 기록 상세 조회"""
    try:
        from core.models.medical_models import MedicalRecord
        
        record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
        if not record:
            raise HTTPException(status_code=404, detail="진료 기록을 찾을 수 없습니다")
        
        return {
            "success": True,
            "data": {
                "id": record.id,
                "appointment_id": record.appointment_id,
                "user_id": record.user_id,
                "doctor_id": record.doctor_id,
                "diagnosis": record.diagnosis,
                "severity": record.severity,
                "treatment": record.treatment,
                "prescription": record.prescription,
                "precautions": record.precautions,
                "next_visit_date": record.next_visit_date.strftime("%Y-%m-%d") if record.next_visit_date else None,
                "notes": record.notes,
                "createdAt": record.created_at.strftime("%Y-%m-%d %H:%M")
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 진료 기록 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="진료 기록 조회 중 오류가 발생했습니다")

@app.patch("/api/medical/diagnosis-requests/{request_id}")
def update_diagnosis_request_status(request_id: int, data: dict, db: Session = Depends(get_db)):
    """진료 요청서 상태 업데이트"""
    try:
        from core.models.db_models import DiagnosisRequest
        
        request_obj = db.query(DiagnosisRequest).filter(DiagnosisRequest.id == request_id).first()
        if not request_obj:
            raise HTTPException(status_code=404, detail="진료 요청서를 찾을 수 없습니다")
        
        # 상태 업데이트
        if "status" in data:
            request_obj.status = data["status"]
        if "reviewedByDoctorId" in data:
            request_obj.reviewed_by_doctor_id = data["reviewedByDoctorId"]
        if "reviewNotes" in data:
            request_obj.review_notes = data["reviewNotes"]
        
        # 검토 완료 시 시간 기록
        if data.get("status") == "reviewed":
            request_obj.reviewed_at = datetime.now()
        
        db.commit()
        
        return {
            "success": True,
            "message": f"진료 요청서 상태가 '{request_obj.status}'로 변경되었습니다",
            "data": {
                "id": request_obj.id,
                "status": request_obj.status,
                "updatedAt": request_obj.updated_at.isoformat()
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 진료 요청서 상태 업데이트 실패: {e}")
        raise HTTPException(status_code=500, detail="진료 요청서 상태 업데이트 중 오류가 발생했습니다")

@app.get("/api/medical/medical-records/appointment/{appointment_id}")
def check_medical_record_by_appointment(appointment_id: int, db: Session = Depends(get_db)):
    """특정 예약에 대한 진료 기록 존재 여부 확인"""
    try:
        from core.models.medical_models import MedicalRecord
        
        record = db.query(MedicalRecord).filter(MedicalRecord.appointment_id == appointment_id).first()
        
        if record:
            return {
                "success": True,
                "exists": True,
                "recordId": record.id,
                "data": {
                    "id": record.id,
                    "appointment_id": record.appointment_id,
                    "diagnosis": record.diagnosis,
                    "severity": record.severity,
                    "treatment": record.treatment,
                    "prescription": record.prescription,
                    "precautions": record.precautions,
                    "next_visit_date": record.next_visit_date.isoformat() if record.next_visit_date else None,
                    "notes": record.notes,
                    "createdAt": record.created_at.isoformat()
                }
            }
        else:
            return {
                "success": True,
                "exists": False,
                "recordId": None
            }
    except Exception as e:
        print(f"❌ 진료 기록 확인 실패: {e}")
        raise HTTPException(status_code=500, detail="진료 기록 확인 중 오류가 발생했습니다")

@app.get("/api/medical/doctors/{doctor_id}/patients")
def get_doctor_patients(doctor_id: int, db: Session = Depends(get_db)):
    """의사의 환자 목록 조회"""
    try:
        from core.models.medical_models import Appointment, MedicalRecord
        from core.models.db_models import User
        from sqlalchemy import desc, func
        
        # 의사의 모든 예약에서 고유한 환자들을 찾음
        # 서브쿼리: 각 환자의 최신 예약 ID 찾기
        latest_appointments_subquery = (
            db.query(
                Appointment.user_id,
                func.max(Appointment.id).label('latest_appointment_id')
            )
            .filter(Appointment.doctor_id == doctor_id)
            .group_by(Appointment.user_id)
            .subquery()
        )
        
        # 최신 예약 정보와 사용자 정보 조인
        patients_query = (
            db.query(
                Appointment,
                User,
                MedicalRecord
            )
            .join(
                latest_appointments_subquery,
                Appointment.id == latest_appointments_subquery.c.latest_appointment_id
            )
            .join(User, Appointment.user_id == User.id)
            .outerjoin(MedicalRecord, MedicalRecord.appointment_id == Appointment.id)
            .order_by(desc(Appointment.appointment_date), desc(Appointment.appointment_time))
        )
        
        patients = patients_query.all()
        
        result = []
        for appointment, user, medical_record in patients:
            # 환자의 총 진료 횟수 계산 (완료된 예약만)
            total_appointments = db.query(Appointment).filter(
                Appointment.user_id == user.id,
                Appointment.doctor_id == doctor_id,
                Appointment.status == 'completed'  # 완료된 예약만 세기
            ).count()
            
            # 치료 상태 결정
            # 1. 최근 진료에서 다음 방문일이 없으면 완치 (치료 완료)
            # 2. 다음 방문일이 있으면 치료 중
            status = 'completed' if (medical_record and not medical_record.next_visit_date) else 'ongoing'
            
            result.append({
                "id": f"patient_{user.id}",
                "patientId": str(user.id),
                "patientName": user.username or "환자",
                "age": user.age or 0,
                "gender": "남성" if user.gender == "male" else "여성" if user.gender == "female" else "정보 없음",
                "phone": user.phone_number or "정보 없음",
                "lastVisit": appointment.appointment_date.strftime("%Y-%m-%d"),
                "diagnosis": medical_record.diagnosis if medical_record else "진료 기록 없음",
                "totalVisits": total_appointments,
                "status": status,
                "latestAppointmentId": appointment.id,
                "hasDiagnosisRequest": appointment.diagnosis_request_id is not None,
                "diagnosisRequestId": appointment.diagnosis_request_id,
                "symptoms": appointment.symptoms or "증상 정보 없음"
            })
        
        print(f"🔍 의사 {doctor_id}의 환자 목록: {len(result)}명")
        return result
        
    except Exception as e:
        print(f"❌ 환자 목록 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="환자 목록 조회 중 오류가 발생했습니다")

# ========== 예약 상태 관리 API ==========
@app.patch("/api/medical/appointments/{appointment_id}/confirm")
def confirm_appointment(appointment_id: int, db: Session = Depends(get_db)):
    """예약 확정 (pending → confirmed)"""
    try:
        from core.models.medical_models import Appointment
        
        appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not appointment:
            raise HTTPException(status_code=404, detail="예약을 찾을 수 없습니다")
        
        if appointment.status != 'pending':
            raise HTTPException(status_code=400, detail="대기 중인 예약만 확정할 수 있습니다")
        
        appointment.status = 'confirmed'
        appointment.updated_at = datetime.now()
        db.commit()
        
        return {
            "success": True,
            "message": "예약이 확정되었습니다",
            "data": {
                "id": appointment.id,
                "status": appointment.status,
                "updatedAt": appointment.updated_at.isoformat()
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 예약 확정 실패: {e}")
        raise HTTPException(status_code=500, detail="예약 확정 중 오류가 발생했습니다")

@app.patch("/api/medical/appointments/{appointment_id}/complete")
def complete_appointment(appointment_id: int, db: Session = Depends(get_db)):
    """진료 완료 (confirmed → completed)"""
    try:
        from core.models.medical_models import Appointment
        
        appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not appointment:
            raise HTTPException(status_code=404, detail="예약을 찾을 수 없습니다")
        
        if appointment.status != 'confirmed':
            raise HTTPException(status_code=400, detail="확정된 예약만 완료할 수 있습니다")
        
        appointment.status = 'completed'
        appointment.updated_at = datetime.now()
        db.commit()
        
        return {
            "success": True,
            "message": "진료가 완료되었습니다",
            "data": {
                "id": appointment.id,
                "status": appointment.status,
                "updatedAt": appointment.updated_at.isoformat()
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 진료 완료 실패: {e}")
        raise HTTPException(status_code=500, detail="진료 완료 중 오류가 발생했습니다")

@app.patch("/api/medical/appointments/{appointment_id}/cancel")
async def cancel_appointment_with_reason(appointment_id: int, request: Request, db: Session = Depends(get_db)):
    """예약 취소 (의사 측)"""
    try:
        from core.models.medical_models import Appointment
        
        # 요청 데이터 파싱
        body = await request.body()
        data = json.loads(body.decode('utf-8'))
        
        print(f"🔄 예약 취소 요청: appointment_id={appointment_id}, reason={data.get('reason')}")
        
        appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not appointment:
            raise HTTPException(status_code=404, detail="예약을 찾을 수 없습니다")
        
        if appointment.status in ['completed', 'cancelled']:
            raise HTTPException(status_code=400, detail="이미 완료되거나 취소된 예약입니다")
        
        # 예약 상태 변경
        appointment.status = 'cancelled'
        appointment.cancellation_reason = data.get('reason', '의사 측 취소')
        appointment.cancelled_by = 'doctor'
        appointment.updated_at = datetime.now()
        
        db.commit()
        print(f"✅ 예약 취소 완료: appointment_id={appointment_id}, reason={appointment.cancellation_reason}")
        
        return {
            "success": True,
            "message": "예약이 취소되었습니다",
            "data": {
                "id": appointment.id,
                "status": appointment.status,
                "cancellation_reason": appointment.cancellation_reason,
                "cancelled_by": appointment.cancelled_by,
                "updatedAt": appointment.updated_at.isoformat()
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 예약 취소 실패: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="예약 취소 중 오류가 발생했습니다")

# ========== 알림 관리 API ==========
@app.get("/api/medical/doctors/{doctor_id}/notifications")
def get_doctor_notifications(doctor_id: int, db: Session = Depends(get_db)):
    """의사의 알림 목록 조회 (사용자 취소 예약)"""
    try:
        from core.models.medical_models import Appointment, DoctorNotification
        from core.models.db_models import User
        
        # 읽지 않은 사용자 취소 알림 조회
        notifications_query = (
            db.query(DoctorNotification, Appointment, User)
            .join(Appointment, DoctorNotification.appointment_id == Appointment.id)
            .join(User, Appointment.user_id == User.id)
            .filter(
                Appointment.doctor_id == doctor_id,
                DoctorNotification.is_read == False,
                DoctorNotification.cancelled_by == 'user'
            )
            .order_by(DoctorNotification.created_at.desc())
        )
        
        notifications = notifications_query.all()
        
        def get_time_ago(created_at):
            """시간 차이를 한국어로 반환"""
            now = datetime.now()
            diff = now - created_at
            
            if diff.days > 0:
                return f"{diff.days}일 전"
            elif diff.seconds // 3600 > 0:
                hours = diff.seconds // 3600
                return f"{hours}시간 전"
            elif diff.seconds // 60 > 0:
                minutes = diff.seconds // 60
                return f"{minutes}분 전"
            else:
                return "방금 전"
        
        def format_time_period(time_str):
            """시간을 오전/오후 형태로 포맷"""
            try:
                time_obj = datetime.strptime(time_str, "%H:%M").time()
                hour = time_obj.hour
                minute = time_obj.minute
                
                if hour < 12:
                    period = "오전"
                    display_hour = hour if hour != 0 else 12
                else:
                    period = "오후"
                    display_hour = hour if hour <= 12 else hour - 12
                
                return f"{period} {display_hour}:{minute:02d}"
            except:
                return time_str
        
        result = []
        for notification, appointment, user in notifications:
            time_ago = get_time_ago(notification.created_at)
            formatted_time = format_time_period(appointment.appointment_time.strftime("%H:%M"))
            
            result.append({
                "id": notification.id,
                "appointmentId": appointment.id,
                "patientName": user.username or "환자",
                "appointmentDate": appointment.appointment_date.strftime("%Y-%m-%d"),
                "appointmentTime": appointment.appointment_time.strftime("%H:%M"),
                "formattedTime": formatted_time,
                "cancellationReason": notification.cancellation_reason,
                "cancelledAt": time_ago,  # "X시간 전" 형태
                "symptoms": appointment.symptoms or "증상 정보 없음"
            })
        
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        print(f"❌ 알림 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="알림 조회 중 오류가 발생했습니다")

@app.patch("/api/medical/notifications/{notification_id}/read")
def mark_notification_as_read(notification_id: int, db: Session = Depends(get_db)):
    """알림 읽음 처리"""
    try:
        from core.models.medical_models import DoctorNotification
        
        notification = db.query(DoctorNotification).filter(DoctorNotification.id == notification_id).first()
        if not notification:
            raise HTTPException(status_code=404, detail="알림을 찾을 수 없습니다")
        
        notification.is_read = True
        notification.read_at = datetime.now()
        db.commit()
        
        return {
            "success": True,
            "message": "알림이 읽음 처리되었습니다"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 알림 읽음 처리 실패: {e}")
        raise HTTPException(status_code=500, detail="알림 읽음 처리 중 오류가 발생했습니다")

@app.patch("/api/medical/appointments/{appointment_id}/mark-notification-read")
def mark_appointment_notification_read(appointment_id: int, db: Session = Depends(get_db)):
    """특정 예약의 알림을 읽음 처리 (예약 상세 화면 접근 시)"""
    try:
        from core.models.medical_models import DoctorNotification
        
        # 해당 예약의 읽지 않은 알림들을 찾아서 읽음 처리
        notifications = db.query(DoctorNotification).filter(
            DoctorNotification.appointment_id == appointment_id,
            DoctorNotification.is_read == False
        ).all()
        
        read_count = 0
        for notification in notifications:
            notification.is_read = True
            notification.read_at = datetime.now()
            read_count += 1
        
        if read_count > 0:
            db.commit()
            print(f"✅ 예약 {appointment_id}의 알림 {read_count}개 읽음 처리 완료")
        
        return {
            "success": True,
            "message": f"{read_count}개의 알림이 읽음 처리되었습니다",
            "readCount": read_count
        }
    except Exception as e:
        print(f"❌ 예약 알림 읽음 처리 실패: {e}")
        raise HTTPException(status_code=500, detail="알림 읽음 처리 중 오류가 발생했습니다")

# ========== AI 피부 분석 API ==========
@app.post("/api/ai/analyze-skin")
async def analyze_skin_image(image: UploadFile = File(...)):
    """AI를 사용한 종합 피부 분석"""
    try:
        print(f"🔬 AI 피부 분석 요청 받음: {image.filename}")
        
        # 이미지 파일 검증
        if not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="이미지 파일만 업로드 가능합니다")
        
        # 파일 크기 검증 (10MB 제한)
        image_data = await image.read()
        if len(image_data) > 10 * 1024 * 1024:  # 10MB
            raise HTTPException(status_code=400, detail="이미지 파일 크기는 10MB 이하여야 합니다")
        
        print(f"📁 이미지 크기: {len(image_data)} bytes")
        
        # AI 모델 로딩 (처음 호출 시)
        if not skin_analysis_service.models_loaded:
            print("🤖 AI 모델 로딩 중...")
            skin_analysis_service.load_models()
        
        # AI 분석 수행
        print("🔬 AI 분석 시작...")
        analysis_result = await skin_analysis_service.analyze_skin_comprehensive(image_data)
        
        if not analysis_result.get("success"):
            raise HTTPException(
                status_code=500, 
                detail=analysis_result.get("error", "AI 분석에 실패했습니다")
            )
        
        # 프론트엔드 호환성을 위한 응답 형식 변환
        frontend_response = {
            "success": True,
            "data": {
                "skinType": analysis_result["analysis_summary"]["type"],
                "skinDisease": analysis_result["analysis_summary"]["disease"],
                "skinState": analysis_result["analysis_summary"]["state"],
                "concerns": [
                    analysis_result["analysis_summary"]["disease"],
                    analysis_result["analysis_summary"]["state"]
                ],
                "recommendations": analysis_result["recommendations"],
                "needsMedicalAttention": analysis_result["analysis_summary"]["needs_medical_attention"],
                "confidence": {
                    "skinType": analysis_result["skin_type"].get("confidence", 0),
                    "disease": analysis_result["skin_disease"].get("confidence", 0), 
                    "state": analysis_result["skin_state"].get("confidence", 0)
                },
                "detailed_analysis": {
                    "skin_type": analysis_result["skin_type"],
                    "skin_disease": analysis_result["skin_disease"],
                    "skin_state": analysis_result["skin_state"]
                }
            }
        }
        
        print(f"✅ AI 분석 완료: {analysis_result['analysis_summary']}")
        return frontend_response
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ AI 피부 분석 실패: {e}")
        raise HTTPException(status_code=500, detail=f"AI 분석 중 오류가 발생했습니다: {str(e)}")

@app.get("/api/ai/models/status")
def get_ai_models_status():
    """AI 모델 로딩 상태 확인"""
    try:
        return {
            "success": True,
            "data": {
                "models_loaded": skin_analysis_service.models_loaded,
                "available_models": {
                    "skin_disease": skin_analysis_service.skin_disease_model is not None,
                    "skin_state": skin_analysis_service.skin_state_model is not None,
                    "skin_type": skin_analysis_service.skin_type_model is not None
                },
                "model_paths": {
                    "disease_model": skin_analysis_service.disease_model_path,
                    "state_model": skin_analysis_service.state_model_path,
                    "type_model": skin_analysis_service.type_model_path
                }
            }
        }
    except Exception as e:
        print(f"❌ AI 모델 상태 확인 실패: {e}")
        raise HTTPException(status_code=500, detail="AI 모델 상태 확인 중 오류가 발생했습니다")

@app.post("/api/ai/models/reload")
def reload_ai_models():
    """AI 모델 재로딩"""
    try:
        print("🔄 AI 모델 재로딩 시작...")
        skin_analysis_service.load_models()
        
        return {
            "success": True,
            "message": "AI 모델이 재로딩되었습니다",
            "data": {
                "models_loaded": skin_analysis_service.models_loaded
            }
        }
    except Exception as e:
        print(f"❌ AI 모델 재로딩 실패: {e}")
        raise HTTPException(status_code=500, detail=f"AI 모델 재로딩 중 오류가 발생했습니다: {str(e)}")

# 시작 시 AI 모델 로딩
@app.on_event("startup")
async def startup_event():
    """서버 시작 시 AI 모델 로딩"""
    try:
        print("🚀 서버 시작 - AI 모델 로딩 중...")
        skin_analysis_service.load_models()
        if skin_analysis_service.models_loaded:
            print("✅ AI 모델 로딩 완료!")
        else:
            print("⚠️ AI 모델 로딩에 실패했습니다. 서비스는 계속 실행됩니다.")
    except Exception as e:
        print(f"❌ 시작 시 AI 모델 로딩 실패: {e}")
        print("⚠️ AI 분석 기능을 사용할 수 없습니다.")

# ========== AI 피부 분석 내역 저장/조회 API ==========
@app.post("/api/skin-analysis/save")
async def save_skin_analysis_result(request: Request, db: Session = Depends(get_db)):
    """AI 피부 분석 결과 저장"""
    try:
        data = await request.json()
        print(f"💾 AI 피부 분석 결과 저장 요청: {data}")
        
        # 필수 필드 검증
        required_fields = ['user_id', 'image_url', 'skin_type', 'concerns', 'recommendations']
        for field in required_fields:
            if field not in data:
                raise HTTPException(status_code=400, detail=f"필수 필드가 누락되었습니다: {field}")
        
        # 데이터베이스에 저장
        analysis = create_skin_analysis_result(
            db=db,
            user_id=data['user_id'],
            image_url=data['image_url'],
            skin_type=data['skin_type'],
            concerns=data['concerns'],
            recommendations=data['recommendations'],
            skin_disease=data.get('skin_disease'),
            skin_state=data.get('skin_state'),
            needs_medical_attention=data.get('needs_medical_attention', False),
            confidence=data.get('confidence'),
            detailed_analysis=data.get('detailed_analysis'),
            skin_age=data.get('skin_age'),
            moisture_score=data.get('moisture'),
            wrinkles_score=data.get('wrinkles'),
            pigmentation_score=data.get('pigmentation'),
            pores_score=data.get('pores'),
            acne_score=data.get('acne'),
            analysis_date=datetime.fromisoformat(data['analysis_date'].replace('Z', '+00:00')) if data.get('analysis_date') else None
        )
        
        print(f"✅ AI 피부 분석 결과 저장 완료: ID {analysis.id}")
        
        return {
            "success": True,
            "data": {
                "id": analysis.id,
                "message": "AI 피부 분석 결과가 저장되었습니다."
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ AI 피부 분석 결과 저장 실패: {e}")
        raise HTTPException(status_code=500, detail="AI 피부 분석 결과 저장 중 오류가 발생했습니다.")

@app.get("/api/skin-analysis/history/{user_id}")
def get_skin_analysis_history_api(user_id: int, skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """사용자의 AI 피부 분석 내역 조회"""
    try:
        print(f"📋 사용자 {user_id}의 AI 피부 분석 내역 조회 (skip={skip}, limit={limit})")
        
        # 데이터베이스에서 분석 내역 조회
        analyses = get_user_skin_analysis_history(db, user_id, skip, limit)
        
        # API 응답 형식으로 변환
        formatted_analyses = [format_analysis_for_api(analysis) for analysis in analyses]
        
        print(f"✅ AI 피부 분석 내역 조회 완료: {len(formatted_analyses)}개")
        
        return {
            "success": True,
            "data": formatted_analyses
        }
        
    except Exception as e:
        print(f"❌ AI 피부 분석 내역 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="AI 피부 분석 내역 조회 중 오류가 발생했습니다.")

@app.get("/api/skin-analysis/{analysis_id}")
def get_skin_analysis_detail_api(analysis_id: int, db: Session = Depends(get_db)):
    """특정 AI 피부 분석 결과 상세 조회"""
    try:
        print(f"🔍 AI 피부 분석 상세 조회: ID {analysis_id}")
        
        # 데이터베이스에서 분석 결과 조회
        analysis = get_skin_analysis_by_id(db, analysis_id)
        
        if not analysis:
            raise HTTPException(status_code=404, detail="AI 피부 분석 결과를 찾을 수 없습니다.")
        
        # API 응답 형식으로 변환
        formatted_analysis = format_analysis_for_api(analysis)
        
        print(f"✅ AI 피부 분석 상세 조회 완료: ID {analysis_id}")
        
        return {
            "success": True,
            "data": formatted_analysis
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ AI 피부 분석 상세 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="AI 피부 분석 상세 조회 중 오류가 발생했습니다.")

@app.delete("/api/skin-analysis/{analysis_id}")
def delete_skin_analysis_api(analysis_id: int, user_id: Optional[int] = None, db: Session = Depends(get_db)):
    """AI 피부 분석 결과 삭제"""
    try:
        print(f"🗑️ AI 피부 분석 결과 삭제: ID {analysis_id}")
        
        # 데이터베이스에서 분석 결과 삭제
        success = delete_skin_analysis_result(db, analysis_id, user_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="삭제할 AI 피부 분석 결과를 찾을 수 없습니다.")
        
        print(f"✅ AI 피부 분석 결과 삭제 완료: ID {analysis_id}")
        
        return {
            "success": True,
            "message": "AI 피부 분석 결과가 삭제되었습니다."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ AI 피부 분석 결과 삭제 실패: {e}")
        raise HTTPException(status_code=500, detail="AI 피부 분석 결과 삭제 중 오류가 발생했습니다.")