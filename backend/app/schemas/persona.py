from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class PersonaBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    interests: List[str] = Field(default_factory=list)
    traits: List[str] = Field(default_factory=list)

class PersonaCreate(PersonaBase):
    pass

class PersonaUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    interests: Optional[List[str]] = None
    traits: Optional[List[str]] = None

class PersonaOut(PersonaBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
