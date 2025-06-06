import requests
from bs4 import BeautifulSoup
import pandas as pd
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
import os
from dotenv import load_dotenv

# 1. 환경 변수 로딩
load_dotenv()

# 2. API 키 및 Pinecone 초기화
SERVICE_KEY = os.getenv("MEDICINE_API_KEY")  # 반드시 .env에 정확히 저장되어 있어야 함
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("ointment")
model = SentenceTransformer("jhgan/ko-sbert-nli")

# 3. 연고 데이터 수집 함수
def fetch_ointments(keyword="연고", num_rows=30, service_key=""):
    url = 'http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList'
    params = {
        'serviceKey': service_key,
        'pageNo': '1',
        'numOfRows': num_rows,
        'itemName': keyword,  # ✅ 유효한 파라미터로 수정
        'type': 'xml'
    }
    res = requests.get(url, params=params)
    print(f"[응답코드] {res.status_code}")
    print("[응답 일부]:", res.text[:300])

    soup = BeautifulSoup(res.content, features="xml")
    items = soup.find_all("item")
    data = []
    for i, item in enumerate(items):
        name = item.find("itemname").text if item.find("itemname") else ""
        effect = item.find("efcyqesitm").text if item.find("efcyqesitm") else ""
        howto = item.find("usemethodqesitm").text if item.find("usemethodqesitm") else ""
        if not name:
            continue
        data.append({
            "id": f"ointment_{i}",
            "product_name": name,
            "review": effect,
            "effect": effect,
            "how_to": howto,
            "skin_type": "지성",
            "category": "ointment",
            "image_url": "",
            "link": ""
        })
    return data

# 4. 실행
if __name__ == "__main__":
    data = fetch_ointments(service_key=SERVICE_KEY)

    print(f"✅ 가져온 연고 수: {len(data)}개")
    if len(data) == 0:
        print("❗ [중단] 가져온 데이터가 없습니다. 인증키 또는 키워드를 확인하세요.")
        exit()

    vectors = []
    for item in data:
        text = f"{item['skin_type']} | {item['review']}"
        emb = model.encode(text).tolist()
        metadata = {
            "product_name": item["product_name"],
            "review": item["review"],
            "skin_type": item["skin_type"],
            "category": item["category"],
            "effect": item["effect"],
            "how_to": item["how_to"],
            "image_url": item["image_url"],
            "link": item["link"]
        }
        vectors.append({
            "id": item["id"],
            "values": emb,
            "metadata": metadata
        })

    print("📦 업로드할 첫 벡터 예시:\n", vectors[0])
    index.upsert(vectors=vectors)
    print(f"✅ 연고 {len(vectors)}개 Pinecone 업로드 완료!")

    # CSV 저장 (옵션)
    pd.DataFrame(data).to_csv("ointments_acne.csv", index=False, encoding="utf-8")
