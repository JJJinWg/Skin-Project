from sqlalchemy import create_engine

url = "postgresql://postgres:jin55330@localhost:5432/skin_project"
engine = create_engine(url)

conn = engine.connect()
print("✅ DB 연결 성공")
conn.close()
