from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # SaaS Subscription Plan details
    plan: Mapped[str] = mapped_column(String(50), default="Free") # "Free", "Pro", "Business"
    comments_used_this_month: Mapped[int] = mapped_column(Integer, default=0)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    personas: Mapped[List["Persona"]] = relationship("Persona", back_populates="user", cascade="all, delete-orphan")
    templates: Mapped[List["Template"]] = relationship("Template", back_populates="user", cascade="all, delete-orphan")
    history_logs: Mapped[List["CommentHistory"]] = relationship("CommentHistory", back_populates="user", cascade="all, delete-orphan")
