from datetime import datetime
from sqlalchemy import String, Integer, ForeignKey, JSON, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class Persona(Base):
    __tablename__ = "personas"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Interests and Traits stored as JSON list of strings
    interests: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    traits: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="personas")
    history_logs: Mapped[list["CommentHistory"]] = relationship("CommentHistory", back_populates="persona")
