# 파일명: embedding_upload_local.py

import pandas as pd
from sentence_transformers import SentenceTransformer
import pinecone
from dotenv import load_dotenv
import os

# 환경변수 불러오기
load_dotenv()
pinecone.init(api_key=os.getenv("PINECONE_API_KEY"), environment=os.getenv("PINECONE_ENV"))
index = pinecone.Index(os.getenv("PINECONE_INDEX"))

# 모델 로딩 (한 번만)
model = SentenceTransformer("jhgan/ko-sbert-nli")

# 데이터 로드
df = pd.read_csv("./crawler/data/reviews_bulk.csv", encoding="utf-8")
products = pd.read_csv("./crawler/data/product_list.csv", encoding="utf-8")
df = df.merge(products, left_on="product_name", right_on="name", how="left")

# 벡터 생성
vectors = []
for i, row in df.iterrows():
    query_text = f"{row['skin_type']} | {row['review']}"
    embedding = model.encode(query_text).tolist()

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

# Pinecone 업로드
if vectors:
    index.upsert(vectors=vectors)
    print(f"✅ 총 {len(vectors)}개 벡터 업로드 완료 (ko-sbert)")
