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
from datetime import datetime, timedelta
from sqlalchemy.sql import text

# 데이터베이스 및 모델 import
from database import SessionLocal, Base, engine
from core.models import db_models
from core.models.medical_models import Hospital, Doctor, Appointment

# 의료진 CRUD 함수들 import
from medical_crud import (
    get_hospitals, get_hospital, create_hospital,
    get_doctors, get_doctor, create_doctor,
    get_appointments, get_appointment, create_appointment, cancel_appointment, update_appointment,
    get_medical_records, create_medical_record,
    get_doctor_reviews, create_doctor_review
)

# 추천 시스템 import (임시 주석 처리)
# from product_description.crawler import crawl_olive_young_reviews
# from recommendation import recommend_endpoint, RecommendQuery

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
def create_review_api(data: dict):
    """리뷰 작성"""
    # TODO: 실제 리뷰 데이터베이스 저장 구현 필요
    return {
        "success": True,
        "reviewId": 12345,
        "message": "리뷰가 작성되었습니다"
    }

@app.get("/api/reviews")
def get_reviews():
    """리뷰 목록 조회"""
    # TODO: 실제 리뷰 데이터베이스 조회 구현 필요
    return {"success": True, "data": []}

@app.get("/api/reviews/user/{user_id}")
def get_user_reviews(user_id: int):
    """사용자 리뷰 목록 조회"""
    # TODO: 실제 사용자 리뷰 데이터베이스 조회 구현 필요
    return []

@app.get("/api/reviews/product/{product_id}")
def get_product_reviews(product_id: int):
    """제품 리뷰 목록 조회"""
    # TODO: 실제 제품 리뷰 데이터베이스 조회 구현 필요
    return []

@app.put("/api/reviews/{review_id}")
def update_review(review_id: int, data: dict):
    """리뷰 수정"""
    # TODO: 실제 리뷰 데이터베이스 업데이트 구현 필요
    return {"success": True, "message": "리뷰가 수정되었습니다"}

@app.delete("/api/reviews/{review_id}")
def delete_review(review_id: int):
    """리뷰 삭제"""
    # TODO: 실제 리뷰 데이터베이스 삭제 구현 필요
    return {"success": True, "message": "리뷰가 삭제되었습니다"}

# ========== 제품 API ==========
@app.get("/api/products/popular")
def get_popular_products_api(db: Session = Depends(get_db)):
    """인기 제품 목록 조회"""
    try:
        from crud import get_popular_products
        products = get_popular_products(db, limit=10)
        
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
    except Exception as e:
        print(f"❌ 인기 제품 조회 실패: {e}")
        # 폴백: 빈 배열 반환
        return []

@app.get("/api/products/new")
def get_new_products_api(db: Session = Depends(get_db)):
    """신제품 목록 조회"""
    try:
        from crud import get_new_products
        products = get_new_products(db, limit=10)
        
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
    except Exception as e:
        print(f"❌ 신제품 조회 실패: {e}")
        # 폴백: 빈 배열 반환
        return []

@app.get("/api/products/category/{category}")
def get_products_by_category_api(category: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """카테고리별 제품 조회"""
    try:
        from crud import get_products
        products = get_products(db, skip=skip, limit=limit, category=category)
        
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
    except Exception as e:
        print(f"❌ 카테고리별 제품 조회 실패: {e}")
        return []

@app.get("/api/products")
def get_products_api(skip: int = 0, limit: int = 100, search: str = None, db: Session = Depends(get_db)):
    """제품 목록 조회"""
    try:
        from crud import get_products, search_products
        
        if search:
            products = search_products(db, search, skip=skip, limit=limit)
        else:
            products = get_products(db, skip=skip, limit=limit)
        
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
    except Exception as e:
        print(f"❌ 제품 목록 조회 실패: {e}")
        return {"success": True, "data": []}

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
def get_doctor_available_times(doctor_id: int, date: str):
    """의사 가능 시간 조회"""
    # TODO: 실제 의사 스케줄 데이터베이스 조회 구현 필요
    return {
        "doctorId": doctor_id,
        "date": date,
        "availableTimes": [
            {"time": "09:00", "available": True},
            {"time": "09:30", "available": False},
            {"time": "10:00", "available": True},
            {"time": "10:30", "available": True},
            {"time": "11:00", "available": False},
            {"time": "14:00", "available": True},
            {"time": "14:30", "available": True},
            {"time": "15:00", "available": True},
            {"time": "15:30", "available": False},
            {"time": "16:00", "available": True}
        ]
    }

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

# ========== 기존 엔드포인트들 ==========
@app.post("/create-tables")
def create_tables():
    """데이터베이스 테이블 생성"""
    try:
        # 데이터베이스 연결 테스트
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"데이터베이스 연결 불가: {e}")
    
    try:
        # 모든 테이블 생성
        Base.metadata.create_all(bind=engine)
        
        # 생성된 테이블 목록
        table_names = list(Base.metadata.tables.keys())
        
        return {
            "message": "✅ 모든 테이블이 성공적으로 생성되었습니다!",
            "tables": table_names
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"테이블 생성 실패: {str(e)}")

@app.post("/add-sample-products")
def add_sample_products(db: Session = Depends(get_db)):
    """샘플 제품 데이터 추가"""
    try:
        from crud import create_product
        from schemas import ProductCreate
        
        # 샘플 제품 데이터
        sample_products = [
            ProductCreate(
                name="Beplain 녹두 진정 토너",
                brand="Beplain",
                category="skincare",
                price=18000,
                original_price=22000,
                rating=4.5,
                review_count=128,
                description="민감한 피부를 위한 녹두 추출물 함유 진정 토너입니다.",
                volume="200ml",
                is_popular=True,
                is_new=False,
                image_url="product1.png",
                ingredients=["녹두 추출물", "판테놀", "나이아신아마이드", "히알루론산"],
                skin_types=["민감성", "건성", "복합성"],
                benefits=["진정", "보습", "각질케어"]
            ),
            ProductCreate(
                name="Torriden 다이브인 세럼",
                brand="Torriden",
                category="serum",
                price=15000,
                rating=4.2,
                review_count=86,
                description="5가지 히알루론산으로 깊은 수분 공급을 해주는 보습 세럼입니다.",
                volume="50ml",
                is_popular=False,
                is_new=True,
                image_url="product2.png",
                ingredients=["히알루론산", "판테놀", "알란토인", "베타글루칸"],
                skin_types=["건성", "복합성", "지성"],
                benefits=["보습", "수분공급", "탄력"]
            ),
            ProductCreate(
                name="코스알엑스 스네일 에센스",
                brand="COSRX",
                category="serum",
                price=25000,
                rating=4.6,
                review_count=324,
                description="96% 달팽이 분비물 여과액으로 만든 진정 에센스입니다.",
                volume="96ml",
                is_popular=True,
                is_new=False,
                image_url="product1.png",
                ingredients=["달팽이 분비물 여과액", "히알루론산", "판테놀", "아르기닌"],
                skin_types=["지성", "복합성", "트러블성"],
                benefits=["진정", "재생", "트러블케어"]
            )
        ]
        
        created_products = []
        for product_data in sample_products:
            product = create_product(db, product_data)
            created_products.append(product.id)
        
        return {
            "message": "✅ 샘플 제품 데이터가 성공적으로 추가되었습니다!",
            "product_ids": created_products
        }
    except Exception as e:
        print(f"❌ 샘플 제품 추가 실패: {e}")
        raise HTTPException(status_code=500, detail=f"샘플 제품 추가 실패: {str(e)}")

# 추천 API 경로 추가 (임시 주석 처리)
# @app.post("/recommend")
# def get_recommendation(query: RecommendQuery = Body(...)):
#     return recommend_endpoint(query)

# @app.get("/crawl")
# def run_crawler():
#     df = crawl_olive_young_reviews(max_products=5)  # 5개만 테스트용 크롤링
#     return {
#         "status": "크롤링 완료",
#         "review_count": len(df),
#         "samples": df.head(3).to_dict(orient="records")  # 예시 몇 개 보여줌
#     }

# 서버 실행 코드 추가
if __name__ == "__main__":
    import uvicorn
    print("🚀 FastAPI 서버를 시작합니다...")
    uvicorn.run(app, host="0.0.0.0", port=8080)