import os
import requests
from fastapi import APIRouter, Query
from dotenv import load_dotenv

load_dotenv("config.env")

router = APIRouter()

NAVER_CLIENT_ID = os.getenv("NAVER_CLIENT_ID")
NAVER_CLIENT_SECRET = os.getenv("NAVER_CLIENT_SECRET")

@router.get("/api/naver/lowest-price")
def naver_lowest_price(query: str = Query(..., description="검색할 상품명")):
    headers = {
        "X-Naver-Client-Id": NAVER_CLIENT_ID,
        "X-Naver-Client-Secret": NAVER_CLIENT_SECRET,
    }
    params = {
        "query": query,
        "display": 10,
        "sort": "sim"
    }
    resp = requests.get("https://openapi.naver.com/v1/search/shop.json", headers=headers, params=params)
    return resp.json() 