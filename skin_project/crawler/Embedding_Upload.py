# 파일명: embedding_upload.py

import pandas as pd
import os
import time
from openai import OpenAI
from pinecone import Pinecone
from dotenv import load_dotenv

# 🔑 환경 변수 로드
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
pinecone_api_key = os.getenv("PINECONE_API_KEY")
pinecone_env = os.getenv("PINECONE_ENV", "us-east-1")
pinecone_index = os.getenv("PINECONE_INDEX", "toner")

client = OpenAI(api_key=openai_api_key)
pc = Pinecone(api_key=pinecone_api_key)
index = pc.Index(pinecone_index)

# 📄 리뷰 데이터 로드
df = pd.read_csv("./crawler/data/reviews_bulk.csv")
products = pd.read_csv("./crawler/data/product_list.csv")

# 🔁 제품명으로 이미지/가격 매칭
df = df.merge(products, left_on="product_name", right_on="name", how="left")

# 🧠 임베딩 생성 함수
def get_embedding(text):
    try:
        res = client.embeddings.create(
            input=[text],
            model="text-embedding-3-large"
        )
        return res.data[0].embedding
    except Exception as e:
        print(f"❌ 임베딩 실패: {e}")
        return None

# 📦 Pinecone 업로드용 벡터 리스트
vectors = []

# ✅ 테스트용으로 5개만 처리
for i, row in df.iterrows():
    combined = f"{row['skin_type']} | {row['review']}"
    embedding = get_embedding(combined)
    if not embedding:
        continue

    vector = (
        f"{row['product_name']}_{i}",
        embedding,
        {
            "product_name": row["product_name"],
            "review": row["review"],
            "skin_type": row["skin_type"],
            "link": row.get("link", ""),
            "image_url": row.get("image_url", ""),
            "price": row.get("price", "")
        }
    )
    vectors.append(vector)

# 한 번에 업로드
if vectors:
    index.upsert(vectors=vectors)
    print(f"✅ 테스트용 {len(vectors)}개 벡터 업로드 완료")
