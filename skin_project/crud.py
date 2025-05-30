from sqlalchemy.orm import Session
from core.models.db_models import User, Review
from schemas import UserCreate, ReviewCreate
from core.security import hash_password

def create_review(db: Session, review: ReviewCreate):
    db_review = Review(**review.dict())
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

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
