from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class TemplateBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    platform: Optional[str] = Field(None, max_length=100)
    style: Optional[str] = Field(None, max_length=100)
    content: str = Field(..., min_length=1)

class TemplateCreate(TemplateBase):
    pass

class TemplateUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    platform: Optional[str] = Field(None, max_length=100)
    style: Optional[str] = Field(None, max_length=100)
    content: Optional[str] = None

class TemplateOut(TemplateBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
