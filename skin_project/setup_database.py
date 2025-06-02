#!/usr/bin/env python3
"""
데이터베이스 초기 설정 및 샘플 데이터 추가
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, SessionLocal
from core.models.db_models import Base as UserBase
from core.models.medical_models import Base as MedicalBase, Hospital, Doctor, Appointment, MedicalRecord, DoctorReview, DoctorSchedule
from datetime import date, time, datetime, timedelta
from core.models.db_models import User, Product, ProductIngredient, ProductSkinType, ProductBenefit, Shop, ProductShop, RecommendationHistory, RecommendationProduct, ProductReview, CrawledReview

def create_tables():
    """모든 테이블 생성"""
    print("🔧 테이블 생성 중...")
    
    try:
        # 사용자 관련 테이블 생성
        UserBase.metadata.create_all(bind=engine)
        print("✅ 사용자 테이블 생성 완료")
        
        # 의료진 관련 테이블 생성  
        MedicalBase.metadata.create_all(bind=engine)
        print("✅ 의료진 테이블 생성 완료")
        
        return True
    except Exception as e:
        print(f"❌ 테이블 생성 실패: {e}")
        return False

def add_sample_data():
    """샘플 데이터 추가"""
    print("📊 샘플 데이터 추가 중...")
    
    db = SessionLocal()
    try:
        # 1. 사용자 데이터 추가 (hashed_password 추가)
        users = [
            User(
                username="user1",
                email="user1@example.com",
                phone_number="010-1234-5678",
                hashed_password="$2b$12$hashedpassword1",  # 실제로는 bcrypt로 해시된 비밀번호
                gender="female",
                age=25,
                skin_type="건성"
            ),
            User(
                username="user2", 
                email="user2@example.com",
                phone_number="010-2345-6789",
                hashed_password="$2b$12$hashedpassword2",
                gender="female",
                age=30,
                skin_type="지성"
            ),
            User(
                username="user3",
                email="user3@example.com", 
                phone_number="010-3456-7890",
                hashed_password="$2b$12$hashedpassword3",
                gender="male",
                age=28,
                skin_type="복합성"
            ),
            User(
                username="user4",
                email="user4@example.com",
                phone_number="010-4567-8901", 
                hashed_password="$2b$12$hashedpassword4",
                gender="female",
                age=32,
                skin_type="민감성"
            )
        ]
        
        for user in users:
            existing = db.query(User).filter(User.email == user.email).first()
            if not existing:
                db.add(user)
        
        db.commit()
        print("✅ 사용자 데이터 추가 완료")

        # 2. 병원 데이터 추가
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
        print("✅ 병원 데이터 추가 완료")
        
        # 3. 의사 데이터 추가
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
        print("✅ 의사 데이터 추가 완료")
        
        # 4. 쇼핑몰 데이터 추가
        shops = [
            Shop(
                name="올리브영",
                url="https://www.oliveyoung.co.kr",
                logo_url="https://example.com/oliveyoung_logo.png"
            ),
            Shop(
                name="화해",
                url="https://www.hwahae.co.kr", 
                logo_url="https://example.com/hwahae_logo.png"
            ),
            Shop(
                name="네이버쇼핑",
                url="https://shopping.naver.com",
                logo_url="https://example.com/naver_logo.png"
            ),
            Shop(
                name="쿠팡",
                url="https://www.coupang.com",
                logo_url="https://example.com/coupang_logo.png"
            )
        ]
        
        for shop in shops:
            existing = db.query(Shop).filter(Shop.name == shop.name).first()
            if not existing:
                db.add(shop)
        
        db.commit()
        print("✅ 쇼핑몰 데이터 추가 완료")

        # 5. 제품 판매처 데이터 추가
        product_shops = [
            ProductShop(
                product_id=1,
                shop_id=1,
                price=30000,
                shipping="무료배송",
                shipping_fee=0,
                installment="무이자 할부 가능",
                is_free_shipping=True,
                is_lowest_price=True,
                is_card_discount=False
            ),
            ProductShop(
                product_id=1,
                shop_id=2,
                price=32000,
                shipping="2500원",
                shipping_fee=2500,
                installment=None,
                is_free_shipping=False,
                is_lowest_price=False,
                is_card_discount=True
            ),
            ProductShop(
                product_id=2,
                shop_id=1,
                price=25000,
                shipping="무료배송",
                shipping_fee=0,
                installment="3개월 무이자",
                is_free_shipping=True,
                is_lowest_price=True,
                is_card_discount=True
            ),
            ProductShop(
                product_id=2,
                shop_id=3,
                price=26000,
                shipping="3000원",
                shipping_fee=3000,
                installment=None,
                is_free_shipping=False,
                is_lowest_price=False,
                is_card_discount=False
            )
        ]
        
        for product_shop in product_shops:
            existing = db.query(ProductShop).filter(
                ProductShop.product_id == product_shop.product_id,
                ProductShop.shop_id == product_shop.shop_id
            ).first()
            if not existing:
                db.add(product_shop)
        
        db.commit()
        print("✅ 제품 판매처 데이터 추가 완료")

        # 6. 예약 데이터 추가
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

        # 7. 진료 기록 데이터 추가
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

        # 8. 의사 리뷰 데이터 추가
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

        # 9. 의사 스케줄 데이터 추가
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
        
        return True
        
    except Exception as e:
        print(f"❌ 샘플 데이터 추가 실패: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def main():
    print("=" * 60)
    print("🏥 Skincare App 데이터베이스 초기 설정")
    print("=" * 60)
    
    # 1. 테이블 생성
    if not create_tables():
        print("❌ 테이블 생성에 실패했습니다.")
        return
    
    # 2. 샘플 데이터 추가
    if not add_sample_data():
        print("❌ 샘플 데이터 추가에 실패했습니다.")
        return
    
    print("\n" + "=" * 60)
    print("✅ 데이터베이스 초기 설정 완료!")
    print("✅ 이제 API에서 실제 데이터베이스 데이터를 사용할 수 있습니다.")
    print("=" * 60)

if __name__ == "__main__":
    main() 