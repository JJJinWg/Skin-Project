from database import Base
from sqlalchemy import Column, Integer, String, Enum, UniqueConstraint, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
import enum
from datetime import datetime

class GenderEnum(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"

class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        UniqueConstraint("username"),
        UniqueConstraint("email"),
        UniqueConstraint("phone_number"),
    )

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    phone_number = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)

    gender = Column(Enum(GenderEnum), nullable=False)
    age = Column(Integer, nullable=False)
    skin_type = Column(String, nullable=False)

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, nullable=False)
    review_text = Column(String, nullable=False)
    skin_type = Column(String)
    skin_concern = Column(String)
    sensitivity = Column(String)
    rating = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

# 제품 관련 모델들
class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    brand = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False, index=True)
    price = Column(Integer, nullable=False)
    original_price = Column(Integer, nullable=True)
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    description = Column(Text, nullable=True)
    volume = Column(String, nullable=True)
    is_popular = Column(Boolean, default=False)
    is_new = Column(Boolean, default=False)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 관계 설정
    ingredients = relationship("ProductIngredient", back_populates="product")
    skin_types = relationship("ProductSkinType", back_populates="product")
    benefits = relationship("ProductBenefit", back_populates="product")

class ProductIngredient(Base):
    __tablename__ = "product_ingredients"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    ingredient = Column(String, nullable=False)

    # 관계 설정
    product = relationship("Product", back_populates="ingredients")

class ProductSkinType(Base):
    __tablename__ = "product_skin_types"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    skin_type = Column(String, nullable=False)

    # 관계 설정
    product = relationship("Product", back_populates="skin_types")

class ProductBenefit(Base):
    __tablename__ = "product_benefits"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    benefit = Column(String, nullable=False)

    # 관계 설정
    product = relationship("Product", back_populates="benefits")

class Shop(Base):
    __tablename__ = "shops"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True, index=True)
    url = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)

    # 관계 설정
    product_shops = relationship("ProductShop", back_populates="shop")

class ProductShop(Base):
    __tablename__ = "product_shops"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    shop_id = Column(Integer, ForeignKey("shops.id"), nullable=False)
    price = Column(Integer, nullable=False)
    shipping = Column(String, nullable=True)
    shipping_fee = Column(Integer, nullable=True)
    installment = Column(String, nullable=True)
    is_free_shipping = Column(Boolean, default=False)
    is_lowest_price = Column(Boolean, default=False)
    is_card_discount = Column(Boolean, default=False)

    # 관계 설정
    shop = relationship("Shop", back_populates="product_shops")
    product = relationship("Product")
