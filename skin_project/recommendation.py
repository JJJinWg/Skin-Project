from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
from openai import OpenAI
import os
from uuid import uuid4

# ✅ 환경 변수 로딩
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=env_path)

# ✅ 환경 변수 가져오기
openai_api_key = os.getenv("OPENAI_API_KEY")
pinecone_api_key = os.getenv("PINECONE_API_KEY")
pinecone_env = os.getenv("PINECONE_ENV")
pinecone_index_name = os.getenv("PINECONE_INDEX", "toner")

# ✅ 디버깅 출력
print("✅ OPENAI_API_KEY =", openai_api_key[:10] + "..." if openai_api_key else None)
print("🔍 PINECONE_API_KEY =", pinecone_api_key[:10] + "..." if pinecone_api_key else None)
print("🔍 PINECONE_ENV =", pinecone_env)
print("🔍 PINECONE_INDEX =", pinecone_index_name)

# ✅ 필수 키 확인
if not openai_api_key:
    raise RuntimeError("❌ OPENAI_API_KEY가 환경변수에서 로딩되지 않았습니다.")
if not pinecone_api_key or not pinecone_env:
    raise RuntimeError("❌ PINECONE_API_KEY 또는 PINECONE_ENV가 누락되었습니다.")

# ✅ 클라이언트 초기화
client = OpenAI(api_key=openai_api_key)
pc = Pinecone(api_key=pinecone_api_key, environment=pinecone_env)

if pinecone_index_name not in pc.list_indexes().names():
    raise RuntimeError(f"'{pinecone_index_name}' 인덱스가 존재하지 않습니다.")

index = pc.Index(pinecone_index_name)
model = SentenceTransformer("jhgan/ko-sbert-nli")
app = FastAPI()

# ✅ 샘플 토너 리뷰 업로드
@app.on_event("startup")
async def upload_sample_data():
    print("🚀 Pinecone에 테스트용 토너 데이터 업로드 중...")
    try:
        reviews = [
            ("건성", "라운드랩 자작나무 토너", "속보습이 잘 되고 각질 부각이 덜해요."),
            ("지성", "이니스프리 블루베리 리밸런싱 토너", "끈적임 없이 산뜻해서 여름에 좋아요."),
            ("민감성", "아벤느 토너", "자극 없이 진정돼서 피부 진정용으로 딱이에요."),
            ("복합성", "한율 어린쑥 토너", "유수분 밸런스가 잘 맞고 향도 순해요."),
            ("건성", "닥터지 레드 블레미쉬 토너", "붉은기 완화에 효과 있고 보습도 괜찮아요."),
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

# ✅ 요청 스키마
class RecommendQuery(BaseModel):
    skin_type: str
    description: str

# ✅ 임베딩 생성
def extract_embedding(text: str) -> list:
    return model.encode(text).tolist()

# ✅ Pinecone 유사 리뷰 검색
def search_pinecone(embedding: list, skin_type: str = None):
    results = index.query(
        vector=embedding,
        top_k=3,
        include_metadata=True,
        filter={"skin_type": skin_type} if skin_type else {}
    )
    return results

# ✅ GPT 추천 생성
def generate_recommendation(query, results):
    matches = results.get("matches", [])
    print("📌 matches =", matches)

    if not matches:
        return "😥 추천할 제품을 찾지 못했습니다."

    items = [x.get("metadata", {}) for x in matches]
    prompt = f"""
당신은 올리브영 AI 점장입니다.
피부타입: {query['skin_type']}
원하는 제품 특징: {query['description']}
후보 제품:
"""
    for i, item in enumerate(items, 1):
        product_name = item.get("product_name", "제품명 없음")
        review = item.get("review", "리뷰 없음")
        prompt += f"\n{i}. {product_name} - {review}"

    prompt += "\n\n위 정보를 참고하여 고객에게 따뜻하고 친근한 말투로 제품 추천 멘트를 작성해주세요. 이모지도 포함해주세요."

    try:
        chat = client.chat.completions.create(
            model="gpt-3.5-turbo",  # ✅ 비용 효율 모델
            messages=[{"role": "user", "content": prompt}]
        )
        return chat.choices[0].message.content
    except Exception as e:
        print("❌ GPT 호출 오류:", e)
        return f"❌ 추천 실패: {str(e)}"

# ✅ API 엔드포인트
@app.post("/recommend")
def recommend_endpoint(query: RecommendQuery):
    embedding = extract_embedding(f"{query.skin_type} 피부, {query.description}")
    results = search_pinecone(embedding, skin_type=query.skin_type)
    message = generate_recommendation(query.model_dump(), results)
    return {"추천 멘트": message}
