import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from core.database import SessionLocal
from schemas import ReviewCreate
from crud import create_review
from fastapi import FastAPI
from product_description.crawler import crawl_olive_young_reviews
from fastapi import HTTPException, status
from schemas import UserCreate, UserResponse
from crud import create_user, get_user_by_username, get_user_by_email, get_user_by_phone
from recommendation import recommend_endpoint, RecommendQuery
from fastapi import Body
from fastapi import FastAPI, Body
from recommendation import recommend_endpoint, RecommendQuery

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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