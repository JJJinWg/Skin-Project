from fastapi import FastAPI, Body
from pydantic import BaseModel
from typing import List
import os
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
import openai

# 1. 환경 변수 로딩
load_dotenv()
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

model = SentenceTransformer("jhgan/ko-sbert-nli")
pc = Pinecone(api_key=PINECONE_API_KEY)
client = openai.OpenAI(api_key=OPENAI_API_KEY)

app = FastAPI()

class RecommendAIRequest(BaseModel):
    skin_type: str
    sensitivity: str
    diagnosis: List[str]

@app.post("/recommend/ai")
def recommend_ai(data: RecommendAIRequest = Body(...)):
    ai_results = data.diagnosis
    query = " ".join(ai_results)
    query_embedding = model.encode([query])[0].tolist()

    INDEXES = {
        "토너": "toner",
        "앰플": "ampoule",
        "크림": "cream"
    }

    final_recommend_list = []

    for category, index_name in INDEXES.items():
        index = pc.Index(index_name)
        result = index.query(vector=query_embedding, top_k=30, include_metadata=True)
        matches = result.get("matches", [])
        if not matches:
            continue
        best = max(matches, key=lambda x: x["score"])
        meta = best["metadata"]
        final_recommend_list.append({
            "카테고리": category,
            "제품명": meta.get("product_name", "")
        })

    # 연고도 검색
    ointment_index = pc.Index("ointment")
    result = ointment_index.query(vector=query_embedding, top_k=5, include_metadata=True)
    matches = result.get("matches", [])
    best_ointment = max(matches, key=lambda x: x["score"]) if matches else None
    ointment_meta = best_ointment["metadata"] if best_ointment else {}

    prompt = (
        f"피부 고민: {', '.join(ai_results)}\n"
        f"추천 제품 목록:\n"
    )
    for p in final_recommend_list:
        prompt += f"- {p['카테고리']} | {p['제품명']}\n"

    if ointment_meta:
        prompt += f"\n연고 후보: {ointment_meta.get('product_name', '')}\n"

    prompt += (
        "\n위 제품들을 기반으로 아래 형식처럼 아주 간단히 추천해줘:\n"
        "1. 화장품 추천: 토너, 앰플, 크림 각 1개씩.\n"
        "2. 연고 추천: 제품명 - 이유\n"
        "3. 시술 추천: 시술1 - 이유 / 시술2 - 이유\n"
        "모든 추천은 한 줄로, 간결하고 전문적인 문장으로. 이모지나 장난스러운 말투는 금지."
    )

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "너는 피부과 추천 전문가야. 요청한 형식 그대로, 아주 간단하고 깔끔하게 추천해."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=400,
        temperature=0.3
    )

    return {
        "추천 결과": response.choices[0].message.content.strip()
    }
