from sqlalchemy import Column, Integer, String, Enum, UniqueConstraint
from core.database import Base
import enum

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
