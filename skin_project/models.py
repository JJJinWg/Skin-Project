from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
<<<<<<< HEAD
from core.database import Base
=======
from database import Base
>>>>>>> main
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
<<<<<<< HEAD
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    phone_number = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)  # ✅ 필드 이름 맞춰야 함
    gender = Column(String)
    age = Column(Integer)
    skin_type = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


=======
    email = Column(String, unique=True, index=True)
    password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

>>>>>>> main
class SkinAnalysis(Base):
    __tablename__ = "skin_analysis"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    image_url = Column(String)
    analysis_summary = Column(String)
    redness_level = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
