# medical_routes.py
# 의료진/예약 시스템 API 라우터

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime

from database import get_db
from medical_schemas import (
    Hospital, HospitalCreate, HospitalUpdate,
    Doctor, DoctorCreate, DoctorUpdate, DoctorSearchParams,
    Appointment, AppointmentCreate, AppointmentUpdate, AppointmentSearchParams,
    MedicalRecord, MedicalRecordCreate, MedicalRecordUpdate,
    DoctorReview, DoctorReviewCreate,
    DoctorSchedule, DoctorScheduleCreate
)
import medical_crud as crud

router = APIRouter()

# ========== 의사 대시보드 통계 API ==========
@router.get("/doctors/{doctor_id}/dashboard-stats")
def get_doctor_dashboard_stats(doctor_id: int, db: Session = Depends(get_db)):
    """의사 대시보드용 통계 데이터 조회"""
    try:
        # 오늘 날짜
        today = date.today()
        
        # 해당 의사의 모든 예약 조회
        all_appointments = crud.get_appointments(
            db, 
            search_params=AppointmentSearchParams(doctor_id=doctor_id),
            limit=1000  # 충분히 큰 수로 모든 데이터 조회
        )
        
        # 오늘 예약 수
        today_appointments = [apt for apt in all_appointments if apt.appointment_date == today]
        
        # 대기 중 예약 수 (scheduled/pending 상태)
        pending_appointments = [apt for apt in all_appointments if apt.status in ['scheduled', 'pending']]
        
        # 완료된 예약 수
        completed_appointments = [apt for apt in all_appointments if apt.status == 'completed']
        
        # 총 환자 수 (고유 user_id 개수)
        unique_patients = set(apt.user_id for apt in all_appointments)
        total_patients = len(unique_patients)
        
        return {
            "success": True,
            "data": {
                "today_appointments": len(today_appointments),
                "pending_appointments": len(pending_appointments), 
                "completed_appointments": len(completed_appointments),
                "total_patients": total_patients
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"통계 조회 중 오류가 발생했습니다: {str(e)}")

# ========== 병원 API ==========
@router.get("/hospitals", response_model=List[Hospital])
def get_hospitals(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """모든 병원 목록 조회"""
    hospitals = crud.get_hospitals(db, skip=skip, limit=limit)
    return hospitals

@router.get("/hospitals/{hospital_id}", response_model=Hospital)
def get_hospital(hospital_id: int, db: Session = Depends(get_db)):
    """특정 병원 정보 조회"""
    hospital = crud.get_hospital(db, hospital_id=hospital_id)
    if hospital is None:
        raise HTTPException(status_code=404, detail="병원을 찾을 수 없습니다")
    return hospital

@router.post("/hospitals", response_model=Hospital)
def create_hospital(hospital: HospitalCreate, db: Session = Depends(get_db)):
    """새 병원 등록"""
    return crud.create_hospital(db=db, hospital=hospital)

@router.put("/hospitals/{hospital_id}", response_model=Hospital)
def update_hospital(
    hospital_id: int,
    hospital: HospitalUpdate,
    db: Session = Depends(get_db)
):
    """병원 정보 수정"""
    db_hospital = crud.update_hospital(db, hospital_id=hospital_id, hospital=hospital)
    if db_hospital is None:
        raise HTTPException(status_code=404, detail="병원을 찾을 수 없습니다")
    return db_hospital

@router.delete("/hospitals/{hospital_id}")
def delete_hospital(hospital_id: int, db: Session = Depends(get_db)):
    """병원 삭제"""
    db_hospital = crud.delete_hospital(db, hospital_id=hospital_id)
    if db_hospital is None:
        raise HTTPException(status_code=404, detail="병원을 찾을 수 없습니다")
    return {"message": "병원이 삭제되었습니다"}

# ========== 의사 API ==========
@router.get("/doctors", response_model=List[Doctor])
def get_doctors(
    skip: int = 0,
    limit: int = 100,
    hospital_id: Optional[int] = Query(None),
    specialization: Optional[str] = Query(None),
    min_rating: Optional[float] = Query(None),
    max_consultation_fee: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """의사 목록 조회 (검색 필터 포함)"""
    search_params = DoctorSearchParams(
        hospital_id=hospital_id,
        specialization=specialization,
        min_rating=min_rating,
        max_consultation_fee=max_consultation_fee
    )
    doctors = crud.get_doctors(db, skip=skip, limit=limit, search_params=search_params)
    return doctors

@router.get("/doctors/{doctor_id}", response_model=Doctor)
def get_doctor(doctor_id: int, db: Session = Depends(get_db)):
    """특정 의사 정보 조회"""
    doctor = crud.get_doctor(db, doctor_id=doctor_id)
    if doctor is None:
        raise HTTPException(status_code=404, detail="의사를 찾을 수 없습니다")
    return doctor

@router.post("/doctors", response_model=Doctor)
def create_doctor(doctor: DoctorCreate, db: Session = Depends(get_db)):
    """새 의사 등록"""
    return crud.create_doctor(db=db, doctor=doctor)

@router.put("/doctors/{doctor_id}", response_model=Doctor)
def update_doctor(
    doctor_id: int,
    doctor: DoctorUpdate,
    db: Session = Depends(get_db)
):
    """의사 정보 수정"""
    db_doctor = crud.update_doctor(db, doctor_id=doctor_id, doctor=doctor)
    if db_doctor is None:
        raise HTTPException(status_code=404, detail="의사를 찾을 수 없습니다")
    return db_doctor

# ========== 예약 API ==========
@router.get("/appointments", response_model=List[Appointment])
def get_appointments(
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = Query(None),
    doctor_id: Optional[int] = Query(None),
    hospital_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    db: Session = Depends(get_db)
):
    """예약 목록 조회 (검색 필터 포함)"""
    search_params = AppointmentSearchParams(
        user_id=user_id,
        doctor_id=doctor_id,
        hospital_id=hospital_id,
        status=status,
        date_from=date_from,
        date_to=date_to
    )
    appointments = crud.get_appointments(db, skip=skip, limit=limit, search_params=search_params)
    return appointments

@router.get("/appointments/{appointment_id}", response_model=Appointment)
def get_appointment(appointment_id: int, db: Session = Depends(get_db)):
    """특정 예약 정보 조회"""
    appointment = crud.get_appointment(db, appointment_id=appointment_id)
    if appointment is None:
        raise HTTPException(status_code=404, detail="예약을 찾을 수 없습니다")
    return appointment

@router.post("/appointments", response_model=Appointment)
async def create_appointment(request: Request, db: Session = Depends(get_db)):
    """새 예약 생성"""
    try:
        # Raw request body 읽기
        body = await request.body()
        print(f"🔍 Raw request body: {body}")
        
        # JSON 파싱
        import json
        data = json.loads(body.decode('utf-8'))
        print(f"🔍 파싱된 JSON 데이터: {data}")
        
        from datetime import datetime
        
        print(f"🔍 받은 예약 데이터: {data}")
        
        # images 필드 제거하고 AppointmentCreate 스키마에 맞는 데이터만 추출
        appointment_data_dict = {
            "user_id": data.get("userId", 1),  # 기본값
            "doctor_id": data["doctorId"],
            "hospital_id": data.get("hospitalId", 1),  # 기본값
            "appointment_date": datetime.strptime(data["date"], "%Y-%m-%d").date(),
            "appointment_time": datetime.strptime(data["time"], "%H:%M").time(),
            "symptoms": data.get("symptoms", ""),
            "consultation_type": data.get("consultationType", "일반진료"),
            "diagnosis_request_id": data.get("diagnosisRequestId", None)
        }
        
        print(f"🔍 변환된 예약 데이터: {appointment_data_dict}")
        
        appointment_create = AppointmentCreate(**appointment_data_dict)
        print(f"🔍 AppointmentCreate 객체 생성 성공")
        
        appointment = crud.create_appointment(db=db, appointment=appointment_create)
        print(f"🔍 예약 생성 성공: {appointment.id}")
        
        return appointment
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

@router.put("/appointments/{appointment_id}", response_model=Appointment)
def update_appointment(
    appointment_id: int,
    appointment: AppointmentUpdate,
    db: Session = Depends(get_db)
):
    """예약 정보 수정"""
    db_appointment = crud.update_appointment(db, appointment_id=appointment_id, appointment=appointment)
    if db_appointment is None:
        raise HTTPException(status_code=404, detail="예약을 찾을 수 없습니다")
    return db_appointment

@router.patch("/appointments/{appointment_id}/cancel")
def cancel_appointment(appointment_id: int, db: Session = Depends(get_db)):
    """예약 취소"""
    db_appointment = crud.cancel_appointment(db, appointment_id=appointment_id)
    if db_appointment is None:
        raise HTTPException(status_code=404, detail="예약을 찾을 수 없습니다")
    return {"message": "예약이 취소되었습니다"}

# ========== 진료 기록 API ==========
@router.get("/medical-records", response_model=List[MedicalRecord])
def get_medical_records(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """사용자의 진료 기록 조회"""
    records = crud.get_medical_records(db, user_id=user_id, skip=skip, limit=limit)
    return records

@router.get("/medical-records/{record_id}", response_model=MedicalRecord)
def get_medical_record(record_id: int, db: Session = Depends(get_db)):
    """특정 진료 기록 조회"""
    record = crud.get_medical_record(db, record_id=record_id)
    if record is None:
        raise HTTPException(status_code=404, detail="진료 기록을 찾을 수 없습니다")
    return record

@router.post("/medical-records", response_model=MedicalRecord)
def create_medical_record(record: MedicalRecordCreate, db: Session = Depends(get_db)):
    """새 진료 기록 생성"""
    return crud.create_medical_record(db=db, record=record)

@router.put("/medical-records/{record_id}", response_model=MedicalRecord)
def update_medical_record(
    record_id: int,
    record: MedicalRecordUpdate,
    db: Session = Depends(get_db)
):
    """진료 기록 수정"""
    db_record = crud.update_medical_record(db, record_id=record_id, record=record)
    if db_record is None:
        raise HTTPException(status_code=404, detail="진료 기록을 찾을 수 없습니다")
    return db_record

# ========== 의사 리뷰 API ==========
@router.get("/doctors/{doctor_id}/reviews", response_model=List[DoctorReview])
def get_doctor_reviews(
    doctor_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """의사 리뷰 목록 조회"""
    reviews = crud.get_doctor_reviews(db, doctor_id=doctor_id, skip=skip, limit=limit)
    return reviews

@router.post("/reviews", response_model=DoctorReview)
def create_doctor_review(review: DoctorReviewCreate, db: Session = Depends(get_db)):
    """의사 리뷰 작성"""
    try:
        return crud.create_doctor_review(db=db, review=review)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ========== 의사 스케줄 API ==========
@router.get("/doctors/{doctor_id}/schedule/{date}", response_model=DoctorSchedule)
def get_doctor_schedule(doctor_id: int, date: date, db: Session = Depends(get_db)):
    """특정 날짜의 의사 스케줄 조회"""
    schedule = crud.get_doctor_schedule(db, doctor_id=doctor_id, date=date)
    if schedule is None:
        raise HTTPException(status_code=404, detail="해당 날짜의 스케줄을 찾을 수 없습니다")
    return schedule

@router.post("/doctors/schedule", response_model=DoctorSchedule)
def create_doctor_schedule(schedule: DoctorScheduleCreate, db: Session = Depends(get_db)):
    """의사 스케줄 생성"""
    return crud.create_doctor_schedule(db=db, schedule=schedule)

@router.get("/doctors/{doctor_id}/available-times/{date}")
def get_available_times(doctor_id: int, date: date, db: Session = Depends(get_db)):
    """특정 날짜의 예약 가능한 시간 조회"""
    available_times = crud.get_available_times(db, doctor_id=doctor_id, date=date)
    return {"available_times": available_times} 