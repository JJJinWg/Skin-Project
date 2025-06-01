import pandas as pd
import os
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
import pinecone

# 환경 변수 로드
load_dotenv()
pinecone.init(api_key=os.getenv("PINECONE_API_KEY"), environment=os.getenv("PINECONE_ENV"))
index = pinecone.Index(os.getenv("PINECONE_INDEX"))

# 모델 로딩
model = SentenceTransformer("jhgan/ko-sbert-nli")

# 리뷰 데이터 불러오기
df = pd.read_csv("./crawler/data/reviews_bulk.csv")
products = pd.read_csv("./crawler/data/product_list.csv")
df = df.merge(products, left_on="product_name", right_on="name", how="left")

vectors = []

for i, row in df.iterrows():
    text = f"{row['skin_type']} | {row['review']}"
    embedding = model.encode(text).tolist()

    vectors.append((
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
    ))

index.upsert(vectors)
print(f"✅ 총 {len(vectors)}개 벡터 업로드 완료")
