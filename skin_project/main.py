import sys
import os
# main.py (수정 후)
print("🔥 main.py에서 보는 DATABASE_URL:", os.getenv("DATABASE_URL"))

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from core.database import SessionLocal
from schemas import ReviewCreate
from fastapi import FastAPI
from product_description.crawler import crawl_olive_young_reviews
from fastapi import HTTPException, status
from schemas import UserCreate, UserResponse
from crud import create_user, get_user_by_username, get_user_by_email, get_user_by_phone
from recommendation import recommend_endpoint, RecommendQuery
from fastapi import Body
from fastapi import FastAPI, Body
from recommendation import recommend_endpoint, RecommendQuery
from fastapi.middleware.cors import CORSMiddleware
from schemas import UserLogin
from core.security import verify_password
from core.database import Base, engine
from core.models import db_models
Base.metadata.create_all(bind=engine)
from crud import create_review
from fastapi import FastAPI
from product_description.crawler import crawl_olive_young_reviews



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발 중엔 * 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = get_user_by_username(db, user.username)
    if not db_user:
        raise HTTPException(status_code=404, detail="존재하지 않는 사용자입니다")

    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="비밀번호가 일치하지 않습니다")

    return {
        "message": "로그인 성공",
        "user": {
            "id": db_user.id,
            "username": db_user.username,
            "email": db_user.email
        }
    }

@app.post("/reviews")
def post_review(review: ReviewCreate, db: Session = Depends(get_db)):
    return create_review(db, review)


@app.get("/crawl")
def run_crawler():
    df = crawl_olive_young_reviews(max_products=5)  # 5개만 테스트용 크롤링
    return {
        "status": "크롤링 완료",
        "review_count": len(df),
        "samples": df.head(3).to_dict(orient="records")  # 예시 몇 개 보여줌
    }

@app.post("/signup", response_model=UserResponse)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    if user.password != user.password_check:
        raise HTTPException(status_code=400, detail="비밀번호가 일치하지 않습니다")

    if get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="이미 존재하는 아이디입니다")

    if get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="이미 존재하는 이메일입니다")

    if get_user_by_phone(db, user.phone_number):
        raise HTTPException(status_code=400, detail="이미 사용 중인 전화번호입니다")

    return create_user(db, user)

# 추천 API 경로 추가
@app.post("/recommend")
def get_recommendation(query: RecommendQuery = Body(...)):
    return recommend_endpoint(query)
