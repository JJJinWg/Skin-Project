from sqlalchemy.orm import Session
from core.models.db_models import User, Product, ProductIngredient, ProductSkinType, ProductBenefit, RecommendationHistory, RecommendationProduct, ProductReview, CrawledReview
from schemas import UserCreate, ProductCreate, ProductUpdate, RecommendationHistoryCreate
from core.security import hash_password
from typing import List, Optional
from sqlalchemy import func

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def get_user_by_phone(db: Session, phone: str):
    return db.query(User).filter(User.phone_number == phone).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate):
    db_user = User(
        username=user.username,
        email=user.email,
        phone_number=user.phone_number,
        hashed_password=hash_password(user.password),
        gender=user.gender,
        age=user.age,
        skin_type=user.skin_type
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# 제품 관련 CRUD 함수들
def create_product(db: Session, product: ProductCreate):
    # 제품 기본 정보 생성
    db_product = Product(
        name=product.name,
        brand=product.brand,
        category=product.category,
        price=product.price,
        original_price=product.original_price,
        rating=product.rating,
        review_count=product.review_count,
        description=product.description,
        volume=product.volume,
        is_popular=product.is_popular,
        is_new=product.is_new,
        image_url=product.image_url
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    # 성분 추가
    for ingredient in product.ingredients:
        db_ingredient = ProductIngredient(product_id=db_product.id, ingredient=ingredient)
        db.add(db_ingredient)
    
    # 피부타입 추가
    for skin_type in product.skin_types:
        db_skin_type = ProductSkinType(product_id=db_product.id, skin_type=skin_type)
        db.add(db_skin_type)
    
    # 효능 추가
    for benefit in product.benefits:
        db_benefit = ProductBenefit(product_id=db_product.id, benefit=benefit)
        db.add(db_benefit)
    
    db.commit()
    db.refresh(db_product)
    return db_product

def get_products(db: Session, skip: int = 0, limit: int = 100, category: Optional[str] = None):
    query = db.query(Product)
    if category:
        query = query.filter(Product.category == category)
    return query.offset(skip).limit(limit).all()

def get_product(db: Session, product_id: int):
    return db.query(Product).filter(Product.id == product_id).first()

def get_popular_products(db: Session, limit: int = 10):
    return db.query(Product).filter(Product.is_popular == True).limit(limit).all()

def get_new_products(db: Session, limit: int = 10):
    return db.query(Product).filter(Product.is_new == True).limit(limit).all()

def update_product(db: Session, product_id: int, product_update: ProductUpdate):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product:
        update_data = product_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_product, field, value)
        db.commit()
        db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product:
        # 관련 데이터 삭제
        db.query(ProductIngredient).filter(ProductIngredient.product_id == product_id).delete()
        db.query(ProductSkinType).filter(ProductSkinType.product_id == product_id).delete()
        db.query(ProductBenefit).filter(ProductBenefit.product_id == product_id).delete()
        
        # 제품 삭제
        db.delete(db_product)
        db.commit()
        return True
    return False

def search_products(db: Session, query: str, skip: int = 0, limit: int = 100):
    return db.query(Product).filter(
        Product.name.contains(query) | 
        Product.brand.contains(query) | 
        Product.description.contains(query)
    ).offset(skip).limit(limit).all()

# 추천 내역 관련 CRUD 함수들
def create_recommendation_history(db: Session, recommendation_data: dict):
    """추천 내역 저장"""
    # 추천 기본 정보 저장
    db_history = RecommendationHistory(
        user_id=recommendation_data["user_id"],
        skin_type=recommendation_data["skin_type"],
        sensitivity=recommendation_data["sensitivity"],
        concerns=recommendation_data["concerns"],  # JSON 필드
        ai_explanation=recommendation_data["ai_explanation"]
    )
    db.add(db_history)
    db.commit()
    db.refresh(db_history)
    
    # 추천 제품들 저장
    for product_data in recommendation_data["recommended_products"]:
        db_product = RecommendationProduct(
            recommendation_id=db_history.id,
            product_name=product_data.get("제품명", ""),
            product_brand=product_data.get("제품명", "").split()[0] if product_data.get("제품명") else "",
            product_category=product_data.get("카테고리", ""),
            reason=product_data.get("추천이유", ""),
            ai_data=product_data  # 원본 AI 데이터 저장
        )
        db.add(db_product)
    
    db.commit()
    db.refresh(db_history)
    return db_history

def get_recommendation_history(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """사용자의 추천 내역 조회"""
    return db.query(RecommendationHistory).filter(
        RecommendationHistory.user_id == user_id
    ).order_by(RecommendationHistory.created_at.desc()).offset(skip).limit(limit).all()

def get_recommendation_detail(db: Session, history_id: int):
    """특정 추천 내역의 상세 정보 조회"""
    history = db.query(RecommendationHistory).filter(RecommendationHistory.id == history_id).first()
    if history:
        products = db.query(RecommendationProduct).filter(
            RecommendationProduct.recommendation_id == history_id
        ).all()
        return {
            "history": history,
            "products": products
        }
    return None

def delete_recommendation_history(db: Session, history_id: int):
    """추천 내역 삭제"""
    db_history = db.query(RecommendationHistory).filter(RecommendationHistory.id == history_id).first()
    if db_history:
        # 관련 제품 데이터 삭제
        db.query(RecommendationProduct).filter(RecommendationProduct.recommendation_id == history_id).delete()
        
        # 추천 내역 삭제
        db.delete(db_history)
        db.commit()
        return True
    return False

# ========== 리뷰 CRUD 함수들 ==========

def create_product_review(db: Session, user_id: int, product_id: int, review_data: dict):
    """제품 리뷰 작성"""
    review = ProductReview(
        user_id=user_id,
        product_id=product_id,
        rating=review_data.get("rating"),
        title=review_data.get("title"),
        content=review_data.get("content"),
        skin_type=review_data.get("skin_type"),
        skin_concern=review_data.get("skin_concern"),
        sensitivity=review_data.get("sensitivity"),
        is_verified_purchase=review_data.get("is_verified_purchase", False)
    )
    
    db.add(review)
    db.commit()
    db.refresh(review)
    
    # 제품의 평균 평점 및 리뷰 수 업데이트
    update_product_rating(db, product_id)
    
    return review

def get_product_reviews(db: Session, product_id: int, skip: int = 0, limit: int = 100):
    """제품의 리뷰 목록 조회"""
    return db.query(ProductReview).filter(
        ProductReview.product_id == product_id
    ).offset(skip).limit(limit).all()

def get_user_reviews(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """사용자가 작성한 리뷰 목록 조회"""
    return db.query(ProductReview).filter(
        ProductReview.user_id == user_id
    ).offset(skip).limit(limit).all()

def get_review_by_id(db: Session, review_id: int):
    """리뷰 상세 조회"""
    return db.query(ProductReview).filter(ProductReview.id == review_id).first()

def update_product_review(db: Session, review_id: int, user_id: int, review_data: dict):
    """리뷰 수정 (작성자만 가능)"""
    review = db.query(ProductReview).filter(
        ProductReview.id == review_id,
        ProductReview.user_id == user_id
    ).first()
    
    if not review:
        return None
    
    # 수정 가능한 필드만 업데이트
    for field in ['rating', 'title', 'content', 'skin_type', 'skin_concern', 'sensitivity']:
        if field in review_data:
            setattr(review, field, review_data[field])
    
    db.commit()
    db.refresh(review)
    
    # 제품의 평균 평점 업데이트
    update_product_rating(db, review.product_id)
    
    return review

def delete_product_review(db: Session, review_id: int, user_id: int):
    """리뷰 삭제 (작성자만 가능)"""
    review = db.query(ProductReview).filter(
        ProductReview.id == review_id,
        ProductReview.user_id == user_id
    ).first()
    
    if not review:
        return False
    
    product_id = review.product_id
    db.delete(review)
    db.commit()
    
    # 제품의 평균 평점 업데이트
    update_product_rating(db, product_id)
    
    return True

def update_product_rating(db: Session, product_id: int):
    """제품의 평균 평점 및 리뷰 수 업데이트"""
    # 제품 리뷰 통계 계산
    stats = db.query(
        func.avg(ProductReview.rating).label('avg_rating'),
        func.count(ProductReview.id).label('review_count')
    ).filter(ProductReview.product_id == product_id).first()
    
    # 제품 정보 업데이트
    product = db.query(Product).filter(Product.id == product_id).first()
    if product:
        product.rating = float(stats.avg_rating) if stats.avg_rating else 0.0
        product.review_count = stats.review_count if stats.review_count else 0
        db.commit()

# ========== 크롤링된 리뷰 CRUD 함수들 ==========

def create_crawled_review(db: Session, review_data: dict):
    """크롤링된 리뷰 데이터 저장"""
    review = CrawledReview(
        source=review_data.get("source", "oliveyoung"),
        source_product_name=review_data.get("source_product_name"),
        source_product_id=review_data.get("source_product_id"),
        reviewer_name=review_data.get("reviewer_name"),
        rating=review_data.get("rating"),
        content=review_data.get("content"),
        skin_type=review_data.get("skin_type"),
        age_group=review_data.get("age_group"),
        review_date=review_data.get("review_date"),
        helpful_count=review_data.get("helpful_count", 0)
    )
    
    db.add(review)
    db.commit()
    db.refresh(review)
    
    return review

def bulk_create_crawled_reviews(db: Session, reviews_data: list):
    """크롤링된 리뷰 데이터 대량 저장 (중복 방지)"""
    created_count = 0
    duplicate_count = 0
    
    print(f"🔍 리뷰 데이터 처리 시작: {len(reviews_data)}개")
    
    # 먼저 전체 리뷰 수 확인
    total_existing = db.query(CrawledReview).count()
    print(f"📊 기존 DB 리뷰 수: {total_existing}개")
    
    for i, review_data in enumerate(reviews_data):
        try:
            # 데이터 정리
            source = review_data.get("source", "oliveyoung")
            product_name = review_data.get("source_product_name", "")
            content = review_data.get("content", "")
            
            # 빈 데이터 스킵
            if not product_name or not content:
                print(f"⚠️ 빈 데이터 스킵: {i+1}")
                continue
            
            # 중복 확인 (더 간단한 조건)
            existing = db.query(CrawledReview).filter(
                CrawledReview.source == source,
                CrawledReview.source_product_name == product_name,
                CrawledReview.content == content
            ).first()
            
            if existing:
                duplicate_count += 1
                if duplicate_count <= 5:  # 처음 5개만 로그 출력
                    print(f"🔄 중복 발견: {product_name} - {content[:30]}...")
                continue
            
            # 새 리뷰 생성
            review = CrawledReview(
                source=source,
                source_product_name=product_name,
                source_product_id=str(review_data.get("source_product_id", "")),
                reviewer_name=review_data.get("reviewer_name"),
                rating=float(review_data.get("rating", 4.0)) if review_data.get("rating") is not None else 4.0,
                content=content,
                skin_type=review_data.get("skin_type"),
                age_group=review_data.get("age_group"),
                review_date=review_data.get("review_date"),
                helpful_count=int(review_data.get("helpful_count", 0)) if review_data.get("helpful_count") is not None else 0
            )
            
            db.add(review)
            created_count += 1
            
            # 진행 상황 출력 (100개마다)
            if created_count % 100 == 0:
                print(f"💾 진행 상황: {created_count}개 저장됨")
            
        except Exception as e:
            print(f"❌ 리뷰 {i+1} 처리 실패: {e}")
            continue
    
    try:
        db.commit()
        print(f"✅ DB 커밋 완료: {created_count}개 저장, {duplicate_count}개 중복")
    except Exception as e:
        print(f"❌ DB 커밋 실패: {e}")
        db.rollback()
        return {
            "created": 0,
            "duplicates": 0,
            "total": len(reviews_data),
            "error": str(e)
        }
    
    return {
        "created": created_count,
        "duplicates": duplicate_count,
        "total": len(reviews_data)
    }

def get_crawled_reviews(db: Session, skip: int = 0, limit: int = 100):
    """크롤링된 리뷰 목록 조회"""
    return db.query(CrawledReview).offset(skip).limit(limit).all()

def get_crawled_reviews_by_product_name(db: Session, product_name: str):
    """제품명으로 크롤링된 리뷰 조회"""
    return db.query(CrawledReview).filter(
        CrawledReview.source_product_name.ilike(f"%{product_name}%")
    ).all()
