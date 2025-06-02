import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# 환경변수 로드 (절대 경로로 확실히 로드)
env_path = os.path.join(os.path.dirname(__file__), "config.env")
load_dotenv(env_path)

# 환경변수에서 데이터베이스 정보 가져오기
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "skin_project")  # 기본값을 skin_project로 설정
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "1345")

# 데이터베이스 URL 구성 (인코딩 문제 해결)
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?client_encoding=utf8"

print(f"🔗 데이터베이스 연결 시도: {DB_HOST}:{DB_PORT}/{DB_NAME}")

# 인코딩 관련 설정 추가
engine = create_engine(
    DATABASE_URL, 
    echo=False, 
    connect_args={
        "client_encoding": "utf8",
        "options": "-c client_encoding=utf8"
    },
    pool_pre_ping=True  # 연결 상태 확인
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
