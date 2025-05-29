from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
from openai import OpenAI
from skin_project.recommend_utils import generate_recommend_query
import os
from uuid import uuid4
from typing import List  # ✅ 추가

# ✅ 환경 변수 로딩
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=env_path)

openai_api_key = os.getenv("OPENAI_API_KEY")
pinecone_api_key = os.getenv("PINECONE_API_KEY")
pinecone_env = os.getenv("PINECONE_ENV")
pinecone_index_name = os.getenv("PINECONE_INDEX", "toner")

print("✅ OPENAI_API_KEY =", openai_api_key[:10] + "..." if openai_api_key else None)
print("🔍 PINECONE_API_KEY =", pinecone_api_key[:10] + "..." if pinecone_api_key else None)
print("🔍 PINECONE_ENV =", pinecone_env)
print("🔍 PINECONE_INDEX =", pinecone_index_name)

if not openai_api_key:
    raise RuntimeError("❌ OPENAI_API_KEY가 환경변수에서 로딩되지 않았습니다.")
if not pinecone_api_key or not pinecone_env:
    raise RuntimeError("❌ PINECONE_API_KEY 또는 PINECONE_ENV가 누락되었습니다.")

client = OpenAI(api_key=openai_api_key)
pc = Pinecone(api_key=pinecone_api_key, environment=pinecone_env)

if pinecone_index_name not in pc.list_indexes().names():
    raise RuntimeError(f"'{pinecone_index_name}' 인덱스가 존재하지 않습니다.")

index = pc.Index(pinecone_index_name)
model = SentenceTransformer("jhgan/ko-sbert-nli")
app = FastAPI()

# ✅ 샘플 토너 데이터 업로드
@app.on_event("startup")
async def upload_sample_data():
    try:
        reviews = [
            ("건성", "라운드랩 자작나무 토너", "속보습이 잘 되고 각질 부각이 덜해요."),
            ("지성", "이니스프리 블루베리 리밸런싱 토너", "끈적임 없이 산뜻해서 여름에 좋아요."),
            ("민감성", "아벤느 토너", "자극 없이 진정돼서 피부 진정용으로 딱이에요."),
        ]
        for skin_type, product_name, review in reviews:
            embedding = model.encode(review).tolist()
            index.upsert([{
                "id": str(uuid4()),
                "values": embedding,
                "metadata": {
                    "skin_type": skin_type,
                    "product_name": product_name,
                    "review": review
                }
            }])
        print("✅ 테스트 데이터 업로드 완료")
    except Exception as e:
        print("❌ 샘플 업로드 실패:", e)


# ✅ 기존 /recommend용 스키마
class RecommendQuery(BaseModel):
    skin_type: str
    description: str

# ✅ 새로운 /recommend/ai용 스키마
class RecommendAIRequest(BaseModel):
    diagnosis: List[str]
    skin_type: str
    sensitivity: str


# ✅ 임베딩 생성
def extract_embedding(text: str) -> list:
    return model.encode(text).tolist()

# ✅ Pinecone 검색
def search_pinecone(embedding: list, skin_type: str = None):
    return index.query(
        vector=embedding,
        top_k=3,
        include_metadata=True,
        filter={"skin_type": skin_type} if skin_type else {}
    )

# ✅ GPT 응답 생성
def generate_recommendation(query, results):
    matches = results.get("matches", [])
    if not matches:
        return "추천할 제품을 찾지 못했습니다."

    items = [x.get("metadata", {}) for x in matches]
    
    prompt = f"""
아래 피부 상태에 맞는 제품을 추천해주세요.  
각 제품에 대해 제품명, 주요 효과, 어떤 피부 상태에 적합한지 간단하게 설명해주세요.  

피부 정보:
- 피부타입: {query['skin_type']}
- 민감도: {query.get('sensitivity', '')}
- 진단: {query.get('description', '') or query.get('diagnosis', '')}

추천 대상 제품:
"""
    for i, item in enumerate(items, 1):
        product_name = item.get("product_name", "제품명 없음")
        review = item.get("review", "리뷰 없음")
        prompt += f"{i}. {product_name} - {review}\n"

    prompt += "\n말투는 간결하고, 이모지 없이, 정보 위주로 써주세요. 역할극이나 점장처럼 말하지 마세요."

    try:
        chat = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )
        return chat.choices[0].message.content
    except Exception as e:
        return f"❌ 추천 실패: {str(e)}"



# ✅ 기존 텍스트 기반 추천 API
@app.post("/recommend")
def recommend_endpoint(query: RecommendQuery):
    embedding = extract_embedding(f"{query.skin_type} 피부, {query.description}")
    results = search_pinecone(embedding, skin_type=query.skin_type)
    message = generate_recommendation(query.model_dump(), results)
    return {"추천 멘트": message}


# ✅ AI 분석 결과 기반 추천 API
@app.post("/recommend/ai")
def recommend_ai(data: RecommendAIRequest):
    query_text = generate_recommend_query(data.diagnosis, data.skin_type, data.sensitivity)
    embedding = extract_embedding(query_text)
    results = search_pinecone(embedding, skin_type=data.skin_type)
    message = generate_recommendation(data.model_dump(), results)
    return {"추천 멘트": message}
