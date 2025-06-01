# backend_models.py
# 의료진/예약 시스템 SQLAlchemy 모델

from sqlalchemy import Column, Integer, String, Text, DECIMAL, Boolean, Date, Time, DateTime, ForeignKey, JSON, UniqueConstraint, CheckConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Hospital(Base):
    __tablename__ = "hospitals"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    address = Column(Text, nullable=False)
    phone = Column(String(20))
    description = Column(Text)
    latitude = Column(DECIMAL(10, 8))
    longitude = Column(DECIMAL(11, 8))
    operating_hours = Column(JSON)  # {"mon": "09:00-18:00", ...}
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계 설정
    doctors = relationship("Doctor", back_populates="hospital", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="hospital")

class Doctor(Base):
    __tablename__ = "doctors"
    
    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id", ondelete="CASCADE"))
    name = Column(String(50), nullable=False)
    specialization = Column(String(100))  # 전문분야
    experience_years = Column(Integer)
    education = Column(Text)
    description = Column(Text)
    profile_image_url = Column(String(255))
    rating = Column(DECIMAL(3, 2), default=0.00)  # 0.00 ~ 5.00
    review_count = Column(Integer, default=0)
    consultation_fee = Column(Integer)  # 진료비
    available_days = Column(JSON)  # ["mon", "tue", "wed", ...]
    available_times = Column(JSON)  # {"start": "09:00", "end": "18:00"}
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계 설정
    hospital = relationship("Hospital", back_populates="doctors")
    appointments = relationship("Appointment", back_populates="doctor")
    medical_records = relationship("MedicalRecord", back_populates="doctor")
    reviews = relationship("DoctorReview", back_populates="doctor")
    schedules = relationship("DoctorSchedule", back_populates="doctor")

class Appointment(Base):
    __tablename__ = "appointments"
    __table_args__ = (
        UniqueConstraint('doctor_id', 'appointment_date', 'appointment_time', 
                        name='unique_doctor_datetime'),
    )
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)  # users 테이블 참조
    doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="CASCADE"))
    hospital_id = Column(Integer, ForeignKey("hospitals.id", ondelete="CASCADE"))
    appointment_date = Column(Date, nullable=False)
    appointment_time = Column(Time, nullable=False)
    status = Column(String(20), default='pending')  # pending, confirmed, completed, cancelled
    symptoms = Column(Text)  # 증상 설명
    notes = Column(Text)  # 추가 메모
    consultation_type = Column(String(50))  # 일반진료, 피부분석, 시술상담 등
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계 설정
    doctor = relationship("Doctor", back_populates="appointments")
    hospital = relationship("Hospital", back_populates="appointments")
    medical_record = relationship("MedicalRecord", back_populates="appointment", uselist=False)
    review = relationship("DoctorReview", back_populates="appointment", uselist=False)

class MedicalRecord(Base):
    __tablename__ = "medical_records"
    
    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id", ondelete="CASCADE"))
    user_id = Column(Integer, nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="CASCADE"))
    diagnosis = Column(Text)  # 진단 내용
    treatment = Column(Text)  # 치료 내용
    prescription = Column(Text)  # 처방전
    next_visit_date = Column(Date)  # 다음 방문 예정일
    notes = Column(Text)  # 의사 메모
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 관계 설정
    appointment = relationship("Appointment", back_populates="medical_record")
    doctor = relationship("Doctor", back_populates="medical_records")

class DoctorReview(Base):
    __tablename__ = "doctor_reviews"
    __table_args__ = (
        UniqueConstraint('appointment_id', name='unique_appointment_review'),
        CheckConstraint('rating >= 1 AND rating <= 5', name='check_rating_range'),
    )
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="CASCADE"))
    appointment_id = Column(Integer, ForeignKey("appointments.id", ondelete="CASCADE"))
    rating = Column(Integer, nullable=False)  # 1-5
    review_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 관계 설정
    doctor = relationship("Doctor", back_populates="reviews")
    appointment = relationship("Appointment", back_populates="review")

class DoctorSchedule(Base):
    __tablename__ = "doctor_schedules"
    __table_args__ = (
        UniqueConstraint('doctor_id', 'date', name='unique_doctor_date'),
    )
    
    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="CASCADE"))
    date = Column(Date, nullable=False)
    is_available = Column(Boolean, default=True)
    start_time = Column(Time)
    end_time = Column(Time)
    reason = Column(String(100))  # 휴진 사유 등
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 관계 설정
    doctor = relationship("Doctor", back_populates="schedules") 