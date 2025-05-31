import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from core.database import SessionLocal, Base, engine
from core.models import db_models
from core.security import verify_password
from schemas import UserCreate, UserResponse, UserLogin, ReviewCreate
from crud import (
    create_user,
    get_user_by_username,
    get_user_by_email,
    get_user_by_phone,
    create_review,
)
from product_description.crawler import crawl_olive_young_reviews
from recommendation import recommend_endpoint, RecommendQuery
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from core.security import verify_password, create_access_token
from jose import JWTError, jwt
from schemas import Token
from core.models.db_models import User




app = FastAPI()  
from recommendation import router as recommend_router
app.include_router(recommend_router)
from dotenv import load_dotenv
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "default-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

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

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@app.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user_by_username(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="아이디 또는 비밀번호가 틀렸습니다")
    token = create_access_token(data={"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(status_code=401, detail="자격 증명 실패")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user_by_username(db, username)
    if user is None:
        raise credentials_exception
    return user

@app.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user