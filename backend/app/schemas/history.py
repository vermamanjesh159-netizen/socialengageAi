from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.schemas.persona import PersonaOut

class HistoryOut(BaseModel):
    id: int
    user_id: int
    persona_id: Optional[int] = None
    platform: str
    input_content: str
    output_content: str
    style: str
    comment_type: str
    humanization_score: int
    spam_detected: bool
    duplicate_detected: bool
    quality_rating: int
    generation_time_ms: int
    created_at: datetime

    class Config:
        from_attributes = True

class HistoryOutWithPersona(HistoryOut):
    persona: Optional[PersonaOut] = None
