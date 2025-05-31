#!/usr/bin/env python3
"""
데이터베이스 초기 설정 및 샘플 데이터 추가
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, SessionLocal
from core.models.db_models import Base as UserBase
from core.models.medical_models import Base as MedicalBase, Hospital, Doctor, Appointment
from datetime import date, time, datetime

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
        # 병원 데이터 추가
        hospitals = [
            Hospital(
                name="서울대학교병원",
                address="서울특별시 종로구 대학로 101",
                phone="02-2072-2114",
                description="국내 최고 수준의 의료진과 시설을 갖춘 종합병원",
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
                operating_hours={
                    "weekday": "08:30-17:30",
                    "saturday": "08:30-12:30",
                    "sunday": "휴무"
                }
            ),
            Hospital(
                name="고려대학교병원",
                address="서울특별시 성북구 고려대로 73",
                phone="02-920-5114",
                description="환자 중심의 의료 서비스를 제공하는 종합병원",
                operating_hours={
                    "weekday": "08:00-17:00",
                    "saturday": "08:00-12:00",
                    "sunday": "휴무"
                }
            ),
            Hospital(
                name="삼성서울병원",
                address="서울특별시 강남구 일원로 81",
                phone="02-3410-2114",
                description="최첨단 의료 장비와 우수한 의료진을 갖춘 병원",
                operating_hours={
                    "weekday": "08:00-18:00",
                    "saturday": "08:00-13:00",
                    "sunday": "휴무"
                }
            )
        ]
        
        for hospital in hospitals:
            # 중복 체크
            existing = db.query(Hospital).filter(Hospital.name == hospital.name).first()
            if not existing:
                db.add(hospital)
        
        db.commit()
        print("✅ 병원 데이터 추가 완료")
        
        # 의사 데이터 추가
        doctors = [
            Doctor(
                hospital_id=1,  # 서울대학교병원
                name="김민수",
                specialization="피부과",
                experience_years=15,
                education="서울대학교 의과대학 졸업\n서울대학교병원 피부과 전공의\n대한피부과학회 정회원",
                description="피부과 전문의로 15년간 다양한 피부 질환 치료 경험을 보유하고 있습니다.",
                consultation_fee=50000,
                available_days=["mon", "tue", "wed", "thu", "fri"],
                available_times={"start": "09:00", "end": "17:00"},
                rating=4.8,
                review_count=128
            ),
            Doctor(
                hospital_id=2,  # 연세대학교병원
                name="이영희",
                specialization="성형외과",
                experience_years=12,
                education="연세대학교 의과대학 졸업\n연세대학교병원 성형외과 전공의\n대한성형외과학회 정회원",
                description="성형외과 전문의로 자연스러운 미용 시술을 전문으로 합니다.",
                consultation_fee=60000,
                available_days=["mon", "tue", "wed", "thu", "fri"],
                available_times={"start": "10:00", "end": "18:00"},
                rating=4.6,
                review_count=86
            ),
            Doctor(
                hospital_id=3,  # 고려대학교병원
                name="박철수",
                specialization="피부과",
                experience_years=18,
                education="고려대학교 의과대학 졸업\n고려대학교병원 피부과 전공의\n대한피부과학회 정회원",
                description="아토피와 알레르기 피부염 치료 전문의입니다.",
                consultation_fee=55000,
                available_days=["mon", "tue", "wed", "thu", "fri", "sat"],
                available_times={"start": "09:30", "end": "16:30"},
                rating=4.7,
                review_count=95
            ),
            Doctor(
                hospital_id=4,  # 삼성서울병원
                name="최지영",
                specialization="피부과",
                experience_years=20,
                education="서울대학교 의과대학 졸업\n삼성서울병원 피부과 전공의\n대한피부과학회 정회원",
                description="피부암 진단 및 레이저 치료 전문의입니다.",
                consultation_fee=70000,
                available_days=["mon", "tue", "wed", "thu", "fri"],
                available_times={"start": "11:00", "end": "19:00"},
                rating=4.9,
                review_count=156
            )
        ]
        
        for doctor in doctors:
            # 중복 체크
            existing = db.query(Doctor).filter(Doctor.name == doctor.name, Doctor.hospital_id == doctor.hospital_id).first()
            if not existing:
                db.add(doctor)
        
        db.commit()
        print("✅ 의사 데이터 추가 완료")
        
        # 샘플 예약 데이터 추가 (선택사항)
        sample_appointments = [
            Appointment(
                user_id=1,
                doctor_id=1,
                hospital_id=1,
                appointment_date=date(2024, 2, 15),
                appointment_time=time(14, 0),
                status='confirmed',
                symptoms='얼굴 여드름 치료 상담',
                consultation_type='일반진료'
            ),
            Appointment(
                user_id=1,
                doctor_id=2,
                hospital_id=2,
                appointment_date=date(2024, 2, 20),
                appointment_time=time(15, 30),
                status='pending',
                symptoms='피부 미용 상담',
                consultation_type='미용상담'
            )
        ]
        
        for appointment in sample_appointments:
            # 중복 체크
            existing = db.query(Appointment).filter(
                Appointment.doctor_id == appointment.doctor_id,
                Appointment.appointment_date == appointment.appointment_date,
                Appointment.appointment_time == appointment.appointment_time
            ).first()
            if not existing:
                db.add(appointment)
        
        db.commit()
        print("✅ 샘플 예약 데이터 추가 완료")
        
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