"""
AI 피부 분석 관련 CRUD 함수들
"""
from sqlalchemy.orm import Session, joinedload
from core.models.db_models import SkinAnalysisResult, SkinAnalysisConcern, SkinAnalysisRecommendation, SkinAnalysisImage
from datetime import datetime
from typing import List, Optional, Dict, Any
import json

def create_skin_analysis_result(
    db: Session,
    user_id: int,
    image_url: str,
    skin_type: str,
    concerns: List[str],
    recommendations: List[str],
    skin_disease: Optional[str] = None,
    skin_state: Optional[str] = None,
    needs_medical_attention: bool = False,
    confidence: Optional[Dict[str, float]] = None,
    detailed_analysis: Optional[Dict[str, Any]] = None,
    skin_age: Optional[int] = None,
    moisture_score: Optional[int] = None,
    wrinkles_score: Optional[int] = None,
    pigmentation_score: Optional[int] = None,
    pores_score: Optional[int] = None,
    acne_score: Optional[int] = None,
    analysis_date: Optional[datetime] = None
) -> SkinAnalysisResult:
    """AI 피부 분석 결과 저장"""
    
    # 메인 분석 결과 생성
    analysis = SkinAnalysisResult(
        user_id=user_id,
        image_url=image_url,
        analysis_date=analysis_date or datetime.utcnow(),
        skin_type=skin_type,
        skin_disease=skin_disease,
        skin_state=skin_state,
        needs_medical_attention=needs_medical_attention,
        skin_age=skin_age,
        moisture_score=moisture_score,
        wrinkles_score=wrinkles_score,
        pigmentation_score=pigmentation_score,
        pores_score=pores_score,
        acne_score=acne_score,
        skin_type_confidence=confidence.get('skinType') if confidence else None,
        disease_confidence=confidence.get('disease') if confidence else None,
        state_confidence=confidence.get('state') if confidence else None,
        detailed_analysis=detailed_analysis
    )
    
    db.add(analysis)
    db.flush()  # ID를 얻기 위해 flush
    
    # 피부 고민사항 추가
    for concern in concerns:
        concern_obj = SkinAnalysisConcern(
            analysis_id=analysis.id,
            concern=concern,
            severity='medium'  # 기본값
        )
        db.add(concern_obj)
    
    # 추천사항 추가
    for recommendation in recommendations:
        recommendation_obj = SkinAnalysisRecommendation(
            analysis_id=analysis.id,
            recommendation_type='skincare',  # 기본값
            recommendation_text=recommendation,
            priority=1
        )
        db.add(recommendation_obj)
    
    db.commit()
    db.refresh(analysis)
    
    return analysis

def get_user_skin_analysis_history(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 20
) -> List[SkinAnalysisResult]:
    """사용자의 AI 피부 분석 내역 조회"""
    
    return db.query(SkinAnalysisResult)\
        .options(
            joinedload(SkinAnalysisResult.concerns),
            joinedload(SkinAnalysisResult.recommendations)
        )\
        .filter(SkinAnalysisResult.user_id == user_id)\
        .order_by(SkinAnalysisResult.analysis_date.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()

def get_skin_analysis_by_id(
    db: Session,
    analysis_id: int
) -> Optional[SkinAnalysisResult]:
    """특정 AI 피부 분석 결과 상세 조회"""
    
    return db.query(SkinAnalysisResult)\
        .options(
            joinedload(SkinAnalysisResult.concerns),
            joinedload(SkinAnalysisResult.recommendations)
        )\
        .filter(SkinAnalysisResult.id == analysis_id)\
        .first()

def delete_skin_analysis_result(
    db: Session,
    analysis_id: int,
    user_id: Optional[int] = None
) -> bool:
    """AI 피부 분석 결과 삭제"""
    
    query = db.query(SkinAnalysisResult).filter(SkinAnalysisResult.id == analysis_id)
    
    # 사용자 ID가 주어진 경우 해당 사용자의 분석 결과만 삭제
    if user_id:
        query = query.filter(SkinAnalysisResult.user_id == user_id)
    
    analysis = query.first()
    if not analysis:
        return False
    
    db.delete(analysis)
    db.commit()
    
    return True

def get_analysis_statistics(
    db: Session,
    user_id: Optional[int] = None,
    days: int = 30
) -> Dict[str, Any]:
    """분석 통계 조회 (선택적)"""
    
    from sqlalchemy import func
    from datetime import datetime, timedelta
    
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    query = db.query(SkinAnalysisResult)\
        .filter(SkinAnalysisResult.analysis_date >= cutoff_date)
    
    if user_id:
        query = query.filter(SkinAnalysisResult.user_id == user_id)
    
    # 기본 통계
    total_analyses = query.count()
    
    # 피부 타입별 분포
    skin_type_stats = db.query(
        SkinAnalysisResult.skin_type,
        func.count(SkinAnalysisResult.id).label('count')
    ).filter(SkinAnalysisResult.analysis_date >= cutoff_date)
    
    if user_id:
        skin_type_stats = skin_type_stats.filter(SkinAnalysisResult.user_id == user_id)
    
    skin_type_stats = skin_type_stats.group_by(SkinAnalysisResult.skin_type).all()
    
    # 의료진 상담 필요 비율
    medical_attention_needed = query.filter(SkinAnalysisResult.needs_medical_attention == True).count()
    
    return {
        'total_analyses': total_analyses,
        'medical_attention_needed': medical_attention_needed,
        'medical_attention_rate': medical_attention_needed / total_analyses if total_analyses > 0 else 0,
        'skin_type_distribution': {item.skin_type: item.count for item in skin_type_stats},
        'period_days': days
    }

def format_analysis_for_api(analysis: SkinAnalysisResult) -> Dict[str, Any]:
    """분석 결과를 API 응답 형식으로 변환"""
    
    return {
        'id': analysis.id,
        'user_id': analysis.user_id,
        'image_url': analysis.image_url,
        'analysis_date': analysis.analysis_date.isoformat(),
        'skin_type': analysis.skin_type,
        'skin_age': analysis.skin_age,
        'moisture': analysis.moisture_score,
        'wrinkles': analysis.wrinkles_score,
        'pigmentation': analysis.pigmentation_score,
        'pores': analysis.pores_score,
        'acne': analysis.acne_score,
        'concerns': [concern.concern for concern in analysis.concerns],
        'recommendations': [rec.recommendation_text for rec in analysis.recommendations],
        'skin_disease': analysis.skin_disease,
        'skin_state': analysis.skin_state,
        'needs_medical_attention': analysis.needs_medical_attention,
        'confidence': {
            'skinType': analysis.skin_type_confidence,
            'disease': analysis.disease_confidence,
            'state': analysis.state_confidence
        },
        'detailed_analysis': analysis.detailed_analysis,
        'created_at': analysis.created_at.isoformat(),
        'updated_at': analysis.updated_at.isoformat()
    } 