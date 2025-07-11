from pydantic import BaseModel, EmailStr, Field
from enum import Enum
from datetime import datetime
from typing import List, Optional

class GenderEnum(str, Enum):
    male = "male"
    female = "female"
    other = "other"

class UserBase(BaseModel):
    username: str
    email: str
    phone_number: str
    gender: str
    age: int
    skin_type: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    phone_number: str
    gender: GenderEnum
    age: int
    skin_type: str

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username: str
    password: str

class ProductIngredientBase(BaseModel):
    ingredient: str

class ProductIngredientCreate(ProductIngredientBase):
    pass

class ProductIngredient(ProductIngredientBase):
    id: int
    product_id: int

    class Config:
        from_attributes = True

class ProductSkinTypeBase(BaseModel):
    skin_type: str

class ProductSkinTypeCreate(ProductSkinTypeBase):
    pass

class ProductSkinType(ProductSkinTypeBase):
    id: int
    product_id: int

    class Config:
        from_attributes = True

class ProductBenefitBase(BaseModel):
    benefit: str

class ProductBenefitCreate(ProductBenefitBase):
    pass

class ProductBenefit(ProductBenefitBase):
    id: int
    product_id: int

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    brand: str
    category: str
    price: int
    original_price: Optional[int] = None
    rating: Optional[float] = 0.0
    review_count: Optional[int] = 0
    description: Optional[str] = None
    volume: Optional[str] = None
    is_popular: Optional[bool] = False
    is_new: Optional[bool] = False
    image_url: Optional[str] = None

class ProductCreate(ProductBase):
    ingredients: Optional[List[str]] = []
    skin_types: Optional[List[str]] = []
    benefits: Optional[List[str]] = []

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    price: Optional[int] = None
    original_price: Optional[int] = None
    rating: Optional[float] = None
    review_count: Optional[int] = None
    description: Optional[str] = None
    volume: Optional[str] = None
    is_popular: Optional[bool] = None
    is_new: Optional[bool] = None
    image_url: Optional[str] = None

class Product(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime
    ingredients: List[ProductIngredient] = []
    skin_types: List[ProductSkinType] = []
    benefits: List[ProductBenefit] = []

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

# AI 추천 시스템용 스키마 (main 브랜치에서 추가)
class RecommendAIRequest(BaseModel):
    diagnosis: List[str]
    skin_type: str
    sensitivity: str

# 추천 내역 저장용 스키마
class RecommendationHistoryCreate(BaseModel):
    user_id: int
    skin_type: str
    sensitivity: str
    concerns: List[str]
    ai_explanation: str
    recommended_products: List[dict]  # AI 응답의 제품 리스트

class RecommendationHistoryResponse(BaseModel):
    id: int
    user_id: int
    skin_type: str
    sensitivity: str
    concerns: List[str]
    ai_explanation: str
    created_at: datetime
    recommended_products: List[dict]
    
    class Config:
        from_attributes = True
