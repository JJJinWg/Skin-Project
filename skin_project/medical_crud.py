# medical_crud.py
# 의료진/예약 시스템 CRUD 함수들

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_
from datetime import date, time
from typing import List, Optional
from core.models.medical_models import Hospital, Doctor, Appointment, MedicalRecord, DoctorReview, DoctorSchedule
from core.models.db_models import User  # User 모델 추가
from medical_schemas import (
    HospitalCreate, HospitalUpdate,
    DoctorCreate, DoctorUpdate, DoctorSearchParams,
    AppointmentCreate, AppointmentUpdate, AppointmentSearchParams,
    MedicalRecordCreate, MedicalRecordUpdate,
    DoctorReviewCreate, DoctorReviewUpdate,
    DoctorScheduleCreate, DoctorScheduleUpdate
)

# ========== 병원 CRUD ==========
def get_hospitals(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Hospital).offset(skip).limit(limit).all()

def get_hospital(db: Session, hospital_id: int):
    return db.query(Hospital).filter(Hospital.id == hospital_id).first()

def create_hospital(db: Session, hospital: HospitalCreate):
    db_hospital = Hospital(**hospital.dict())
    db.add(db_hospital)
    db.commit()
    db.refresh(db_hospital)
    return db_hospital

def update_hospital(db: Session, hospital_id: int, hospital: HospitalUpdate):
    db_hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if db_hospital:
        for key, value in hospital.dict(exclude_unset=True).items():
            setattr(db_hospital, key, value)
        db.commit()
        db.refresh(db_hospital)
    return db_hospital

def delete_hospital(db: Session, hospital_id: int):
    db_hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if db_hospital:
        db.delete(db_hospital)
        db.commit()
    return db_hospital

# ========== 의사 CRUD ==========
def get_doctors(db: Session, skip: int = 0, limit: int = 100, search_params: Optional[DoctorSearchParams] = None):
    query = db.query(Doctor)  # is_active 필터 임시 제거
    
    if search_params:
        if search_params.hospital_id:
            query = query.filter(Doctor.hospital_id == search_params.hospital_id)
        if search_params.specialization:
            query = query.filter(Doctor.specialization.ilike(f"%{search_params.specialization}%"))
        if search_params.min_rating:
            query = query.filter(Doctor.rating >= search_params.min_rating)
        if search_params.max_consultation_fee:
            query = query.filter(Doctor.consultation_fee <= search_params.max_consultation_fee)
    
    return query.offset(skip).limit(limit).all()

def get_doctor(db: Session, doctor_id: int):
    return db.query(Doctor).filter(Doctor.id == doctor_id).first()

def create_doctor(db: Session, doctor: DoctorCreate):
    db_doctor = Doctor(**doctor.dict())
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    return db_doctor

def update_doctor(db: Session, doctor_id: int, doctor: DoctorUpdate):
    db_doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if db_doctor:
        for key, value in doctor.dict(exclude_unset=True).items():
            setattr(db_doctor, key, value)
        db.commit()
        db.refresh(db_doctor)
    return db_doctor

# ========== 예약 CRUD ==========
def get_appointments(db: Session, skip: int = 0, limit: int = 100, search_params: Optional[AppointmentSearchParams] = None):
    query = db.query(Appointment).options(
        joinedload(Appointment.doctor).joinedload(Doctor.hospital),
        joinedload(Appointment.hospital)
    ).join(User, Appointment.user_id == User.id)
    
    if search_params:
        if search_params.user_id:
            query = query.filter(Appointment.user_id == search_params.user_id)
        if search_params.doctor_id:
            query = query.filter(Appointment.doctor_id == search_params.doctor_id)
        if search_params.hospital_id:
            query = query.filter(Appointment.hospital_id == search_params.hospital_id)
        if search_params.status:
            query = query.filter(Appointment.status == search_params.status)
        if search_params.date_from:
            query = query.filter(Appointment.appointment_date >= search_params.date_from)
        if search_params.date_to:
            query = query.filter(Appointment.appointment_date <= search_params.date_to)
    
    appointments = query.order_by(Appointment.appointment_date.desc()).offset(skip).limit(limit).all()
    
    # User 정보를 수동으로 추가
    for appointment in appointments:
        user = db.query(User).filter(User.id == appointment.user_id).first()
        if user:
            appointment.user = user
    
    return appointments

def get_appointment(db: Session, appointment_id: int):
    appointment = db.query(Appointment).options(
        joinedload(Appointment.doctor).joinedload(Doctor.hospital),
        joinedload(Appointment.hospital)
    ).filter(Appointment.id == appointment_id).first()
    
    # User 정보도 수동으로 로드
    if appointment:
        user = db.query(User).filter(User.id == appointment.user_id).first()
        if user:
            appointment.user = user
            print(f"🔍 medical_crud에서 사용자 정보 로드 성공: username={user.username}, age={user.age}, gender={user.gender}")
        else:
            print(f"❌ medical_crud에서 사용자 정보 로드 실패: user_id={appointment.user_id}")
    
    return appointment

def create_appointment(db: Session, appointment: AppointmentCreate):
    # 중복 예약 체크
    existing = db.query(Appointment).filter(
        and_(
            Appointment.doctor_id == appointment.doctor_id,
            Appointment.appointment_date == appointment.appointment_date,
            Appointment.appointment_time == appointment.appointment_time,
            Appointment.status != 'cancelled'
        )
    ).first()
    
    if existing:
        raise ValueError("해당 시간에 이미 예약이 있습니다.")
    
    db_appointment = Appointment(**appointment.dict())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

def update_appointment(db: Session, appointment_id: int, appointment: AppointmentUpdate):
    db_appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if db_appointment:
        for key, value in appointment.dict(exclude_unset=True).items():
            setattr(db_appointment, key, value)
        db.commit()
        db.refresh(db_appointment)
    return db_appointment

def cancel_appointment(db: Session, appointment_id: int, cancellation_reason: str, cancelled_by: str):
    db_appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if db_appointment:
        db_appointment.status = 'cancelled'
        db_appointment.cancellation_reason = cancellation_reason
        db_appointment.cancelled_by = cancelled_by
        db.commit()
        db.refresh(db_appointment)
    return db_appointment

# ========== 진료 기록 CRUD ==========
def get_medical_records(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(MedicalRecord).join(Appointment).filter(Appointment.user_id == user_id).order_by(MedicalRecord.created_at.desc()).offset(skip).limit(limit).all()

def get_medical_record(db: Session, record_id: int):
    return db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()

def create_medical_record(db: Session, record: MedicalRecordCreate):
    db_record = MedicalRecord(**record.dict())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

def update_medical_record(db: Session, record_id: int, record: MedicalRecordUpdate):
    db_record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    if db_record:
        for key, value in record.dict(exclude_unset=True).items():
            setattr(db_record, key, value)
        db.commit()
        db.refresh(db_record)
    return db_record

# ========== 의사 리뷰 CRUD ==========
def get_doctor_reviews(db: Session, doctor_id: int, skip: int = 0, limit: int = 100):
    return db.query(DoctorReview).filter(DoctorReview.doctor_id == doctor_id).order_by(DoctorReview.created_at.desc()).offset(skip).limit(limit).all()

def create_doctor_review(db: Session, review: DoctorReviewCreate):
    # 이미 리뷰가 있는지 체크
    existing = db.query(DoctorReview).filter(DoctorReview.appointment_id == review.appointment_id).first()
    if existing:
        raise ValueError("이미 해당 예약에 대한 리뷰가 있습니다.")
    
    db_review = DoctorReview(**review.dict())
    db.add(db_review)
    db.commit()
    
    # 의사 평점 업데이트
    update_doctor_rating(db, review.doctor_id)
    
    db.refresh(db_review)
    return db_review

def update_doctor_rating(db: Session, doctor_id: int):
    """의사의 평점과 리뷰 수를 업데이트"""
    reviews = db.query(DoctorReview).filter(DoctorReview.doctor_id == doctor_id).all()
    
    if reviews:
        avg_rating = sum(review.rating for review in reviews) / len(reviews)
        review_count = len(reviews)
    else:
        avg_rating = 0.0
        review_count = 0
    
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if doctor:
        doctor.rating = round(avg_rating, 2)
        doctor.review_count = review_count
        db.commit()

# ========== 의사 스케줄 CRUD ==========
def get_doctor_schedule(db: Session, doctor_id: int, date: date):
    return db.query(DoctorSchedule).filter(
        and_(DoctorSchedule.doctor_id == doctor_id, DoctorSchedule.date == date)
    ).first()

def create_doctor_schedule(db: Session, schedule: DoctorScheduleCreate):
    db_schedule = DoctorSchedule(**schedule.dict())
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

def get_available_times(db: Session, doctor_id: int, date: date):
    """특정 날짜에 의사의 예약 가능한 시간 반환"""
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        return []
    
    # 의사 스케줄 확인
    schedule = get_doctor_schedule(db, doctor_id, date)
    if schedule and not schedule.is_available:
        return []
    
    # 기존 예약 확인
    existing_appointments = db.query(Appointment).filter(
        and_(
            Appointment.doctor_id == doctor_id,
            Appointment.appointment_date == date,
            Appointment.status != 'cancelled'
        )
    ).all()
    
    booked_times = [apt.appointment_time for apt in existing_appointments]
    
    # 가능한 시간 슬롯 생성 (30분 단위)
    available_times = []
    if doctor.available_times:
        start_time = doctor.available_times.get('start', '09:00')
        end_time = doctor.available_times.get('end', '18:00')
        
        # 시작 시간과 종료 시간을 datetime.time 객체로 변환
        start_hour, start_minute = map(int, start_time.split(':'))
        end_hour, end_minute = map(int, end_time.split(':'))
        
        current_hour = start_hour
        current_minute = start_minute
        
        while (current_hour < end_hour) or (current_hour == end_hour and current_minute < end_minute):
            # 현재 시간을 문자열로 변환 (HH:MM 형식)
            current_time = f"{current_hour:02d}:{current_minute:02d}"
            
            # 이미 예약된 시간이 아닌 경우에만 추가
            if current_time not in booked_times:
                available_times.append(current_time)
            
            # 30분 추가
            current_minute += 30
            if current_minute >= 60:
                current_hour += 1
                current_minute = 0
        
    return available_times 