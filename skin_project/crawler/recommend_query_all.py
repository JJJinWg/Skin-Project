import os
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
import pandas as pd
import openai

# 1. .env 환경변수 로드
load_dotenv()
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# 2. 카테고리별 인덱스 이름
INDEXES = {
    "토너": "toner",
    "앰플": "ampoule",
    "크림": "cream"
}

# 3. 임베딩/OPENAI 준비
model = SentenceTransformer('jhgan/ko-sbert-nli')
pc = Pinecone(api_key=PINECONE_API_KEY)
client = openai.OpenAI(api_key=OPENAI_API_KEY)

# 4. AI 분석 결과 (입력 부분 바꿔서 실험!)
ai_results = ["염증성", "색소침착", "건성"]
query = " ".join(ai_results)
query_embedding = model.encode([query])[0].tolist()

final_recommend_list = []

for category, index_name in INDEXES.items():
    index = pc.Index(index_name)
    result = index.query(
        vector=query_embedding,
        top_k=30,
        include_metadata=True
    )
    matches = result['matches']
    if not matches:
        continue

    df = pd.DataFrame([
        {
            **m['metadata'],
            'score': m['score']
        } for m in matches
    ])

    # 입력 키워드가 하나라도 리뷰/피부타입 컬럼에 포함된 리뷰만 남김
    for keyword in ai_results:
        filtered = df[
            df['review'].apply(lambda x: keyword in x if isinstance(x, str) else False) |
            df['skin_type'].apply(lambda x: keyword in x if isinstance(x, str) else False)
        ]
        if not filtered.empty:
            df = filtered

    if len(df) == 0:
        df = pd.DataFrame([
            {
                **m['metadata'],
                'score': m['score']
            } for m in matches
        ])

    top_products = (
        df.groupby("product_name")
        .agg(
            review_count=("review", "count"),
            sum_score=("score", "sum")
        )
        .sort_values("sum_score", ascending=False)
        .head(1)
        .reset_index()
    )

    for pname in top_products['product_name']:
        review_row = df[df['product_name'] == pname].iloc[0]
        final_recommend_list.append({
            "카테고리": category,
            "제품명": pname,
            "피부타입": review_row.get("skin_type", "")
        })

# 5. GPT 프롬프트 생성 (카테고리별 1개씩 추천)
user_state = ai_results
prompt = (
    f"피부 고민: {', '.join(user_state)}\n"
    f"추천 제품과 리뷰:\n"
)
for p in final_recommend_list:
    prompt += f"- {p['카테고리']} | {p['제품명']}:\"\n"

prompt += (
    "위에서 각 카테고리(토너, 앰플, 크림)별로 딱 1개씩, 총 3개만 이름과 추천 이유(추천 이유는 조금 자세히)를 각각 한 줄로 아주 간단하게 추천해줘. "
    "예: '라운드랩 자작나무 토너 - 민감 피부에 진정효과 검증.'"
)

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "system", "content": "너는 화장품 전문가야. 각 제품은 반드시 한 줄로, 총 3줄 이내로만 아주 간단하게 추천해줘."},
        {"role": "user", "content": prompt}
    ],
    max_tokens=200,
    temperature=0.3
)

print("\n=== [AI 피부 진단 기반 카테고리별 Top-1 추천 결과] ===\n")
print(response.choices[0].message.content.strip())
