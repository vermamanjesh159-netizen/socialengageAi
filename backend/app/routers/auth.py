from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.schemas.user import (
    UserCreate, UserOut, Token, LoginRequest,
    ForgotPasswordRequest, ResetPasswordRequest, RefreshTokenRequest
)
from app.crud.user import get_user_by_email, create_user, update_user
from app.core import security
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, email=user_in.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )
    user = create_user(db, user_in=user_in)
    return user

@router.post("/login", response_model=Token)
def login_json(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, email=login_data.username)
    if not user or not security.verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token = security.create_access_token(subject=user.id)
    refresh_token = security.create_refresh_token(subject=user.id)
    return Token(access_token=access_token, refresh_token=refresh_token)

@router.post("/login/oauth", response_model=Token)
def login_oauth(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user_by_email(db, email=form_data.username)
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token = security.create_access_token(subject=user.id)
    refresh_token = security.create_refresh_token(subject=user.id)
    return Token(access_token=access_token, refresh_token=refresh_token)

@router.post("/refresh", response_model=Token)
def refresh_token(refresh_data: RefreshTokenRequest, db: Session = Depends(get_db)):
    user_id = security.verify_token(refresh_data.refresh_token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or inactive"
        )
    
    access_token = security.create_access_token(subject=user.id)
    new_refresh_token = security.create_refresh_token(subject=user.id)
    return Token(access_token=access_token, refresh_token=new_refresh_token)

@router.post("/forgot-password")
def forgot_password(request_data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, email=request_data.email)
    if user:
        reset_token = security.create_access_token(subject=user.id, expires_delta=timedelta(minutes=15))
        return {"message": "Password reset email sent (simulated).", "reset_token": reset_token}
    return {"message": "Password reset email sent (simulated)."}

@router.post("/reset-password")
def reset_password(request_data: ResetPasswordRequest, db: Session = Depends(get_db)):
    user_id = security.verify_token(request_data.token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    update_user(db, db_user=user, user_in={"password": request_data.new_password})
    return {"message": "Password reset successfully."}
