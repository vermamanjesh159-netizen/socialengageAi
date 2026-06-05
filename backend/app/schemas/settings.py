from typing import Optional, Dict
from pydantic import BaseModel

class SettingsOut(BaseModel):
    default_model: str
    ollama_url: str
    saas_plan: str
    comments_used: int
    max_comments: int
    system_health: Dict[str, str]

class SettingsUpdate(BaseModel):
    default_model: Optional[str] = None
    ollama_url: Optional[str] = None
    saas_plan: Optional[str] = None
