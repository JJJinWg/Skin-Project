from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class SkinAnalysis(Base):
    __tablename__ = "skin_analysis"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    image_url = Column(String)
    analysis_summary = Column(String)
    redness_level = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
