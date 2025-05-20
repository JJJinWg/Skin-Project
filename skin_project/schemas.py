from pydantic import BaseModel, EmailStr, Field
from enum import Enum
from pydantic import BaseModel
from datetime import datetime

class GenderEnum(str, Enum):
    male = "male"
    female = "female"
    other = "other"

class UserCreate(BaseModel):
    username: str
    password: str
    password_check: str
    email: EmailStr
    phone_number: str
    gender: GenderEnum
    age: int = Field(ge=0, le=120)
    skin_type: str

    class Config:
        schema_extra = {
            "example": {
                "username": "skinguide123",
                "password": "secure1234",
                "password_check": "secure1234",
                "email": "test@example.com",
                "phone_number": "01012345678",
                "gender": "female",
                "age": 25,
                "skin_type": "건성"
            }
        }

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    phone_number: str
    gender: GenderEnum
    age: int
    skin_type: str

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    username: str
    password: str

class ReviewCreate(BaseModel):
    username: str
    review_text: str
    skin_type: str
    skin_concern: str
    sensitivity: str
    rating: float
    created_at: datetime | None = None