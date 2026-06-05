from datetime import datetime
from sqlalchemy import String, Integer, ForeignKey, DateTime, Boolean, Float, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from app.database import Base

class CommentHistory(Base):
    __tablename__ = "comment_history"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    persona_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("personas.id", ondelete="SET NULL"), nullable=True)
    
    platform: Mapped[str] = mapped_column(String(100), nullable=False) # e.g. "LinkedIn", "Twitter/X", "YouTube"
    input_content: Mapped[str] = mapped_column(Text, nullable=False)
    output_content: Mapped[str] = mapped_column(Text, nullable=False)
    style: Mapped[str] = mapped_column(String(100), nullable=False) # e.g. "Friendly", "Professional"
    comment_type: Mapped[str] = mapped_column(String(50), default="comment") # "comment" or "reply"
    
    # Advanced AI humanization metrics
    humanization_score: Mapped[int] = mapped_column(Integer, default=85) # 1-100
    spam_detected: Mapped[bool] = mapped_column(Boolean, default=False)
    duplicate_detected: Mapped[bool] = mapped_column(Boolean, default=False)
    quality_rating: Mapped[int] = mapped_column(Integer, default=4) # 1-5 rating
    
    generation_time_ms: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="history_logs")
    persona: Mapped[Optional["Persona"]] = relationship("Persona", back_populates="history_logs")
