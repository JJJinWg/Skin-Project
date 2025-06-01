from sqlalchemy import Column, Integer, String, Enum, UniqueConstraint, Float, DateTime
from core.database import Base
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
