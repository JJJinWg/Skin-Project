from sqlalchemy.orm import Session
from core.models.db_models import User, Review, Product, ProductIngredient, ProductSkinType, ProductBenefit
from schemas import UserCreate, ReviewCreate, ProductCreate, ProductUpdate
from core.security import hash_password
from typing import List, Optional

def create_review(db: Session, review: ReviewCreate):
    db_review = Review(**review.dict())
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

def get_reviews(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Review).offset(skip).limit(limit).all()

def get_review(db: Session, review_id: int):
    return db.query(Review).filter(Review.id == review_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_phone(db: Session, phone: str):
    return db.query(User).filter(User.phone_number == phone).first()

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
