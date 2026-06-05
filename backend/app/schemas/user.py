from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6, max_length=100)
    full_name: Optional[str] = None
    plan: Optional[str] = None
    comments_used_this_month: Optional[int] = None

class UserOut(UserBase):
    id: int
    plan: str
    comments_used_this_month: int
    is_active: bool
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Auth Schemas
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: Optional[int] = None
    exp: Optional[int] = None

class LoginRequest(BaseModel):
    username: EmailStr  # Email input
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6, max_length=100)

class RefreshTokenRequest(BaseModel):
    refresh_token: str
