-- 의료진/예약 시스템 DB 스키마
-- PostgreSQL 기준

-- 1. 병원 테이블
CREATE TABLE hospitals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    description TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    operating_hours JSONB, -- {"mon": "09:00-18:00", "tue": "09:00-18:00", ...}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 의사 테이블
CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER REFERENCES hospitals(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    specialization VARCHAR(100), -- 전문분야 (피부과, 성형외과 등)
    experience_years INTEGER,
    education TEXT,
    description TEXT,
    profile_image_url VARCHAR(255),
    rating DECIMAL(3,2) DEFAULT 0.00, -- 평점 (0.00 ~ 5.00)
    review_count INTEGER DEFAULT 0,
    consultation_fee INTEGER, -- 진료비
    available_days JSONB, -- ["mon", "tue", "wed", "thu", "fri"]
    available_times JSONB, -- {"start": "09:00", "end": "18:00"}
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 예약 테이블
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL, -- users 테이블 참조 (기존 테이블)
    doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
    hospital_id INTEGER REFERENCES hospitals(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, completed, cancelled
    symptoms TEXT, -- 증상 설명
    notes TEXT, -- 추가 메모
    consultation_type VARCHAR(50), -- 일반진료, 피부분석, 시술상담 등
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- 같은 의사, 같은 날짜/시간에 중복 예약 방지
    UNIQUE(doctor_id, appointment_date, appointment_time)
);

-- 4. 진료 기록 테이블
CREATE TABLE medical_records (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL,
    doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
    diagnosis TEXT, -- 진단 내용
    treatment TEXT, -- 치료 내용
    prescription TEXT, -- 처방전
    next_visit_date DATE, -- 다음 방문 예정일
    notes TEXT, -- 의사 메모
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. 의사 리뷰 테이블
CREATE TABLE doctor_reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- 한 예약당 하나의 리뷰만 가능
    UNIQUE(appointment_id)
);

-- 6. 의사 스케줄 테이블 (휴진일, 특별 스케줄 관리)
CREATE TABLE doctor_schedules (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT true,
    start_time TIME,
    end_time TIME,
    reason VARCHAR(100), -- 휴진 사유 등
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(doctor_id, date)
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_doctors_hospital_id ON doctors(hospital_id);
CREATE INDEX idx_doctors_specialization ON doctors(specialization);
CREATE INDEX idx_medical_records_user_id ON medical_records(user_id);
CREATE INDEX idx_doctor_reviews_doctor_id ON doctor_reviews(doctor_id);

-- 샘플 데이터 삽입
INSERT INTO hospitals (name, address, phone, description, latitude, longitude, operating_hours) VALUES
('서울피부과의원', '서울시 강남구 테헤란로 123', '02-1234-5678', '피부 전문 클리닉', 37.5665, 126.9780, '{"mon": "09:00-18:00", "tue": "09:00-18:00", "wed": "09:00-18:00", "thu": "09:00-18:00", "fri": "09:00-18:00", "sat": "09:00-13:00"}'),
('강남성형외과', '서울시 강남구 논현로 456', '02-2345-6789', '성형 및 피부 관리', 37.5172, 127.0473, '{"mon": "10:00-19:00", "tue": "10:00-19:00", "wed": "10:00-19:00", "thu": "10:00-19:00", "fri": "10:00-19:00", "sat": "10:00-15:00"}'),
('부산피부클리닉', '부산시 해운대구 해운대로 789', '051-3456-7890', '해운대 피부 전문의원', 35.1595, 129.1600, '{"mon": "09:00-18:00", "tue": "09:00-18:00", "wed": "09:00-18:00", "thu": "09:00-18:00", "fri": "09:00-18:00"}');

INSERT INTO doctors (hospital_id, name, specialization, experience_years, education, description, consultation_fee, available_days, available_times) VALUES
(1, '김피부', '피부과 전문의', 10, '서울대학교 의과대학', '여드름, 아토피 전문', 50000, '["mon", "tue", "wed", "thu", "fri"]', '{"start": "09:00", "end": "18:00"}'),
(1, '이미용', '피부과 전문의', 8, '연세대학교 의과대학', '미용 피부과 전문', 80000, '["tue", "wed", "thu", "fri", "sat"]', '{"start": "10:00", "end": "17:00"}'),
(2, '박성형', '성형외과 전문의', 15, '고려대학교 의과대학', '안면 성형 및 피부 관리', 100000, '["mon", "tue", "wed", "thu", "fri"]', '{"start": "10:00", "end": "19:00"}'),
(3, '최해운', '피부과 전문의', 12, '부산대학교 의과대학', '아토피, 건선 전문', 60000, '["mon", "tue", "wed", "thu", "fri"]', '{"start": "09:00", "end": "18:00"}'); 