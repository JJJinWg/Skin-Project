from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI
from pinecone import Pinecone
from dotenv import load_dotenv
import os

# 환경 변수 로딩
load_dotenv()

# API 키 직접 설정 (보안상 권장되진 않음 - 개발용 한정)
openai_api_key = "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"
pinecone_api_key = "pcsk_5Tcupo_PtDQGSRLYRwndrxfzFZirwnxYxii6RDrzkiTTariSPiwLegpGXThdnNw2Wsgp6i"

# 클라이언트 초기화
client = OpenAI(api_key=openai_api_key)
pc = Pinecone(api_key=pinecone_api_key)
index = pc.Index("toner")  # 'toner'라는 Pinecone 인덱스 사용

# FastAPI 앱 생성
app = FastAPI()

# 입력 스키마 정의
class RecommendQuery(BaseModel):
    skin_type: str
    description: str

# 유저 입력 임베딩
def extract_embedding(text: str) -> list:
    response = client.embeddings.create(
        input=[text],
        model="text-embedding-3-large"
    )
    return response.data[0].embedding

# Pinecone 유사 리뷰 검색
def search_pinecone(embedding: list, skin_type: str = None):
    results = index.query(
        vector=embedding,
        top_k=3,
        include_metadata=True,
        filter={"skin_type": skin_type} if skin_type else {}
    )
    return results

# GPT 추천 멘트 생성
def generate_recommendation(query, results):
    matches = results["matches"]
    items = [x["metadata"] for x in matches]

    prompt = f"""
당신은 올리브영 AI 점장입니다.
피부타입: {query['skin_type']}
원하는 제품 특징: {query['description']}
후보 제품:
"""
    for i, item in enumerate(items, 1):
        prompt += f"\n{i}. {item['product_name']} - {item['review']}"

    prompt += """
위 정보를 참고하여 고객에게 따뜻하고 친근한 말투로 제품 추천 멘트를 작성해주세요. 이모지도 적절히 포함해주세요.
"""

    chat = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}]
    )
    return chat.choices[0].message.content

# API 엔드포인트
@app.post("/recommend")
def recommend_endpoint(query: RecommendQuery):
    embedding = extract_embedding(f"{query.skin_type} 피부, {query.description}")
    results = search_pinecone(embedding, skin_type=query.skin_type)
    message = generate_recommendation(query.model_dump(), results)
    return {"추천 멘트": message}
