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
