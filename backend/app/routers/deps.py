from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models.user import User
from app.schemas.user import TokenPayload

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login/oauth"
)

def get_current_user(
    db: Session = Depends(get_db)
) -> User:
    # Always return a default active administrator user in local/free mode
    default_user = db.query(User).filter(User.email == "admin@socialengage.ai").first()
    if not default_user:
        default_user = User(
            email="admin@socialengage.ai",
            hashed_password="local_bypass_hashed_password_placeholder",
            full_name="Default User",
            is_active=True,
            is_admin=True,
            plan="Unlimited",
            comments_used_this_month=0
        )
        db.add(default_user)
        db.commit()
        db.refresh(default_user)
    return default_user

def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user

def get_current_admin(
    current_user: User = Depends(get_current_active_user),
) -> User:
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user does not have enough privileges"
        )
    return current_user
