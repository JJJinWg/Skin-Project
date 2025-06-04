"""
AI 피부 분석 관련 테이블들을 생성하는 스크립트
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, Base
from core.models.db_models import (
    SkinAnalysisResult, 
    SkinAnalysisConcern, 
    SkinAnalysisRecommendation, 
    SkinAnalysisImage
)
from sqlalchemy import text

def create_skin_analysis_tables():
    """AI 피부 분석 관련 테이블들을 생성합니다."""
    try:
        print("🗄️ AI 피부 분석 테이블 생성 시작...")
        
        # 기존 테이블들이 있는지 확인
        with engine.connect() as conn:
            # 테이블 존재 확인
            tables_to_check = [
                'skin_analysis_results',
                'skin_analysis_concerns', 
                'skin_analysis_recommendations',
                'skin_analysis_images'
            ]
            
            existing_tables = []
            for table_name in tables_to_check:
                result = conn.execute(text(f"""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_name = '{table_name}'
                    );
                """)).fetchone()
                
                if result[0]:
                    existing_tables.append(table_name)
            
            if existing_tables:
                print(f"⚠️ 이미 존재하는 테이블들: {existing_tables}")
                user_input = input("기존 테이블을 삭제하고 새로 생성하시겠습니까? (y/N): ")
                if user_input.lower() != 'y':
                    print("❌ 테이블 생성이 취소되었습니다.")
                    return False
                
                # 기존 테이블들 삭제 (외래키 순서 고려)
                drop_order = [
                    'skin_analysis_images',
                    'skin_analysis_recommendations', 
                    'skin_analysis_concerns',
                    'skin_analysis_results'
                ]
                
                for table_name in drop_order:
                    if table_name in existing_tables:
                        print(f"🗑️ 테이블 삭제 중: {table_name}")
                        conn.execute(text(f"DROP TABLE IF EXISTS {table_name} CASCADE;"))
                        conn.commit()
        
        # 새 테이블들 생성
        print("📋 새 테이블들 생성 중...")
        
        # 특정 테이블들만 생성 (다른 테이블들은 건드리지 않음)
        tables_to_create = [
            SkinAnalysisResult.__table__,
            SkinAnalysisConcern.__table__,
            SkinAnalysisRecommendation.__table__,
            SkinAnalysisImage.__table__
        ]
        
        for table in tables_to_create:
            print(f"✅ 테이블 생성: {table.name}")
            table.create(engine, checkfirst=True)
        
        print("🎉 AI 피부 분석 테이블 생성 완료!")
        
        # 테이블 구조 확인
        print("\n📊 생성된 테이블 구조:")
        with engine.connect() as conn:
            for table_name in ['skin_analysis_results', 'skin_analysis_concerns', 'skin_analysis_recommendations', 'skin_analysis_images']:
                result = conn.execute(text(f"""
                    SELECT column_name, data_type, is_nullable 
                    FROM information_schema.columns 
                    WHERE table_name = '{table_name}' 
                    ORDER BY ordinal_position;
                """)).fetchall()
                
                print(f"\n🔍 {table_name}:")
                for row in result:
                    nullable = "NULL" if row[2] == "YES" else "NOT NULL"
                    print(f"  - {row[0]}: {row[1]} ({nullable})")
        
        return True
        
    except Exception as e:
        print(f"❌ 테이블 생성 실패: {e}")
        return False

def create_indexes():
    """성능 향상을 위한 인덱스들을 생성합니다."""
    try:
        print("\n🚀 인덱스 생성 중...")
        
        with engine.connect() as conn:
            indexes = [
                # 사용자별 최근 분석 결과 조회용
                "CREATE INDEX IF NOT EXISTS idx_user_recent_analysis ON skin_analysis_results(user_id, analysis_date DESC);",
                
                # 의료진 상담이 필요한 케이스 조회용  
                "CREATE INDEX IF NOT EXISTS idx_medical_attention_cases ON skin_analysis_results(needs_medical_attention, analysis_date DESC);",
                
                # 피부 타입별 통계 조회용
                "CREATE INDEX IF NOT EXISTS idx_skin_type_stats ON skin_analysis_results(skin_type, analysis_date);",
                
                # 고민사항별 검색용
                "CREATE INDEX IF NOT EXISTS idx_concern_search ON skin_analysis_concerns(concern, severity);",
                
                # 추천사항 타입별 검색용
                "CREATE INDEX IF NOT EXISTS idx_recommendation_type ON skin_analysis_recommendations(recommendation_type, priority);"
            ]
            
            for index_sql in indexes:
                print(f"📌 인덱스 생성: {index_sql}")
                conn.execute(text(index_sql))
                conn.commit()
        
        print("✅ 인덱스 생성 완료!")
        return True
        
    except Exception as e:
        print(f"❌ 인덱스 생성 실패: {e}")
        return False

if __name__ == "__main__":
    print("🏥 AI 피부 분석 데이터베이스 설정 스크립트")
    print("=" * 50)
    
    # 테이블 생성
    if create_skin_analysis_tables():
        # 인덱스 생성
        create_indexes()
        
        print("\n🎉 모든 설정이 완료되었습니다!")
        print("\n사용 가능한 API 엔드포인트:")
        print("- POST /api/skin-analysis/save           # 분석 결과 저장")
        print("- GET  /api/skin-analysis/history/{user_id}  # 사용자 분석 내역")
        print("- GET  /api/skin-analysis/{analysis_id}   # 분석 결과 상세 조회") 
        print("- DELETE /api/skin-analysis/{analysis_id} # 분석 결과 삭제")
    else:
        print("\n❌ 설정 실패!")
        sys.exit(1) 