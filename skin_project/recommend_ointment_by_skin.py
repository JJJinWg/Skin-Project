import os
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
import openai
import pandas as pd

# 1. 환경 변수 로딩
load_dotenv()
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# 2. 모델 초기화
model = SentenceTransformer("jhgan/ko-sbert-nli")
pc = Pinecone(api_key=PINECONE_API_KEY)
client = openai.OpenAI(api_key=OPENAI_API_KEY)

# 3. 사용자 입력 예시
user_input = {
    "skin_type": "지성",
    "sensitivity": "높음",
    "diagnosis": ["여드름", "염증성"]
}
query = " ".join(user_input["diagnosis"])
query_embedding = model.encode([query])[0].tolist()

INDEXES = {
    "토너": "toner",
    "앰플": "ampoule",
    "크림": "cream"
}

final_recommend_list = []

for category, index_name in INDEXES.items():
    index = pc.Index(index_name)
    result = index.query(vector=query_embedding, top_k=20, include_metadata=True)
    matches = result.get("matches", [])
    if not matches:
        continue
    best = max(matches, key=lambda x: x["score"])
    meta = best["metadata"]
    final_recommend_list.append({
        "카테고리": category,
        "제품명": meta.get("product_name", ""),
        "피부타입": meta.get("skin_type", "")
    })

# 연고도 같이 검색
ointment_index = pc.Index("ointment")
result = ointment_index.query(vector=query_embedding, top_k=5, include_metadata=True)
matches = result.get("matches", [])
best_ointment = max(matches, key=lambda x: x["score"]) if matches else None
ointment_meta = best_ointment["metadata"] if best_ointment else {}

# 4. GPT 프롬프트 구성
prompt = f"""너는 피부과 추천 전문가야.

피부 타입: {user_input['skin_type']}
민감도: {user_input['sensitivity']}
피부 진단 결과: {', '.join(user_input['diagnosis'])}

아래는 각 화장품 카테고리별 추천 후보야:
"""

for r in final_recommend_list:
    prompt += f"- {r['카테고리']} | {r['제품명']}:\"\n"

if ointment_meta:
    prompt += f"""
추가 연고 후보:
- 연고 | {ointment_meta.get('product_name', '')}: \"{ointment_meta.get('effect', '')}\"
"""

prompt += """
추천 결과는 아래 형식처럼 정리해줘:

1. 화장품 추천 (토너, 앰플, 크림): 각 1개씩, 이름과 추천 이유 한 줄로
2. 연고 추천: 제품명 - 이유
3. 시술 추천:
   - 시술1 - 이유
   - 시술2 - 이유

불필요한 말투, 이모지 없이 깔끔하고 정확하게. 각 문장은 1줄 이내로.
"""

# 5. GPT 호출
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": prompt}],
    temperature=0.4,
    max_tokens=400
)

# 6. 결과 출력
print("\n🎯 GPT 종합 추천 결과:\n")
print(response.choices[0].message.content.strip())
