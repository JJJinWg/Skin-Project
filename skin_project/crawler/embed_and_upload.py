import os
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
import pandas as pd

load_dotenv()
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
model = SentenceTransformer('jhgan/ko-sbert-nli')
pc = Pinecone(api_key=PINECONE_API_KEY)

# 카테고리별로 아래 부분만 바꿔서 3번 실행 (toner/ampoule/cream)
category = "cream"   # ← 여기만 "ampoule", "cream"으로 바꿔서 실행
index = pc.Index(category)
csv_path = f"./crawler/data/reviews_bulk_{category}.csv"

df = pd.read_csv(csv_path)
df['embedding'] = model.encode(df['review'].astype(str).tolist(), show_progress_bar=True).tolist()

batch_size = 100
for i in range(0, len(df), batch_size):
    batch = df.iloc[i:i+batch_size]
    vectors = [
        {
            "id": str(idx),
            "values": row['embedding'],
            "metadata": {
                "product_name": row["product_name"],
                "review": row["review"],
                "skin_type": row["skin_type"],
                "star": str(row["star"]),
                "category": category
            }
        }
        for idx, row in batch.iterrows()
    ]
    index.upsert(vectors=vectors)
print(f"✅ {category} 카테고리 리뷰 임베딩 및 Pinecone 업로드 완료!")
