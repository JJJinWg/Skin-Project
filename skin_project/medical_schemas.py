# backend_schemas.py
# 의료진/예약 시스템 Pydantic 스키마

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import date, time, datetime
from enum import Enum

# Enum 정의
class AppointmentStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    completed = "completed"
    cancelled = "cancelled"

class ConsultationType(str, Enum):
    general = "일반진료"
    skin_analysis = "피부분석"
    procedure_consultation = "시술상담"
    follow_up = "재진"

# 병원 스키마
class HospitalBase(BaseModel):
    name: str = Field(..., max_length=100)
    address: str
    phone: Optional[str] = Field(None, max_length=20)
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    operating_hours: Optional[Dict[str, str]] = None

class HospitalCreate(HospitalBase):
    pass

class HospitalUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    address: Optional[str] = None
    phone: Optional[str] = Field(None, max_length=20)
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    operating_hours: Optional[Dict[str, str]] = None

class Hospital(HospitalBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# 의사 스키마
class DoctorBase(BaseModel):
    hospital_id: int
    name: str = Field(..., max_length=50)
    specialization: Optional[str] = Field(None, max_length=100)
    experience_years: Optional[int] = Field(None, ge=0)
    education: Optional[str] = None
    description: Optional[str] = None
    profile_image_url: Optional[str] = Field(None, max_length=255)
    consultation_fee: Optional[int] = Field(None, ge=0)
    available_days: Optional[List[str]] = None
    available_times: Optional[Dict[str, str]] = None
    is_active: bool = True

class DoctorCreate(DoctorBase):
    pass

class DoctorUpdate(BaseModel):
    hospital_id: Optional[int] = None
    name: Optional[str] = Field(None, max_length=50)
    specialization: Optional[str] = Field(None, max_length=100)
    experience_years: Optional[int] = Field(None, ge=0)
    education: Optional[str] = None
    description: Optional[str] = None
    profile_image_url: Optional[str] = Field(None, max_length=255)
    consultation_fee: Optional[int] = Field(None, ge=0)
    available_days: Optional[List[str]] = None
    available_times: Optional[Dict[str, str]] = None
    is_active: Optional[bool] = None

class Doctor(DoctorBase):
    id: int
    rating: float
    review_count: int
    created_at: datetime
    updated_at: datetime
    hospital: Optional[Hospital] = None

    class Config:
        from_attributes = True

# 예약 스키마
class AppointmentBase(BaseModel):
    doctor_id: int
    hospital_id: int
    appointment_date: date
    appointment_time: time
    symptoms: Optional[str] = None
    notes: Optional[str] = None
    consultation_type: Optional[ConsultationType] = None

class AppointmentCreate(AppointmentBase):
    user_id: int

class AppointmentUpdate(BaseModel):
    appointment_date: Optional[date] = None
    appointment_time: Optional[time] = None
    status: Optional[AppointmentStatus] = None
    symptoms: Optional[str] = None
    notes: Optional[str] = None
    consultation_type: Optional[ConsultationType] = None

class Appointment(AppointmentBase):
    id: int
    user_id: int
    status: AppointmentStatus
    created_at: datetime
    updated_at: datetime
    doctor: Optional[Doctor] = None
    hospital: Optional[Hospital] = None

    class Config:
        from_attributes = True

# 진료 기록 스키마
class MedicalRecordBase(BaseModel):
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    prescription: Optional[str] = None
    next_visit_date: Optional[date] = None
    notes: Optional[str] = None

class MedicalRecordCreate(MedicalRecordBase):
    appointment_id: int
    user_id: int
    doctor_id: int

class MedicalRecordUpdate(MedicalRecordBase):
    pass

class MedicalRecord(MedicalRecordBase):
    id: int
    appointment_id: int
    user_id: int
    doctor_id: int
    created_at: datetime
    appointment: Optional[Appointment] = None
    doctor: Optional[Doctor] = None

    class Config:
        from_attributes = True

# 의사 리뷰 스키마
class DoctorReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    review_text: Optional[str] = None

class DoctorReviewCreate(DoctorReviewBase):
    user_id: int
    doctor_id: int
    appointment_id: int

class DoctorReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    review_text: Optional[str] = None

class DoctorReview(DoctorReviewBase):
    id: int
    user_id: int
    doctor_id: int
    appointment_id: int
    created_at: datetime
    doctor: Optional[Doctor] = None

    class Config:
        from_attributes = True

# 의사 스케줄 스키마
class DoctorScheduleBase(BaseModel):
    date: date
    is_available: bool = True
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    reason: Optional[str] = Field(None, max_length=100)

class DoctorScheduleCreate(DoctorScheduleBase):
    doctor_id: int

class DoctorScheduleUpdate(BaseModel):
    is_available: Optional[bool] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    reason: Optional[str] = Field(None, max_length=100)

class DoctorSchedule(DoctorScheduleBase):
    id: int
    doctor_id: int
    created_at: datetime
    doctor: Optional[Doctor] = None

    class Config:
        from_attributes = True

# 검색 및 필터링을 위한 스키마
class DoctorSearchParams(BaseModel):
    hospital_id: Optional[int] = None
    specialization: Optional[str] = None
    min_rating: Optional[float] = Field(None, ge=0, le=5)
    max_consultation_fee: Optional[int] = Field(None, ge=0)
    available_date: Optional[date] = None
    location: Optional[str] = None  # 지역 검색
    
class AppointmentSearchParams(BaseModel):
    user_id: Optional[int] = None
    doctor_id: Optional[int] = None
    hospital_id: Optional[int] = None
    status: Optional[AppointmentStatus] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None

# 응답 스키마
class AppointmentListResponse(BaseModel):
    appointments: List[Appointment]
    total: int
    page: int
    size: int

class DoctorListResponse(BaseModel):
    doctors: List[Doctor]
    total: int
    page: int
    size: int

class HospitalListResponse(BaseModel):
    hospitals: List[Hospital]
    total: int
    page: int
    size: int 