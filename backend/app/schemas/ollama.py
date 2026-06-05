from typing import List, Optional
from pydantic import BaseModel

class OllamaModel(BaseModel):
    name: str
    size: int  # in bytes
    parameters: Optional[str] = None
    last_updated: Optional[str] = None

class OllamaStatusResponse(BaseModel):
    available: bool
    default_model: str
    models: List[OllamaModel]

class OllamaPullRequest(BaseModel):
    model_name: str

class OllamaDeleteRequest(BaseModel):
    model_name: str

class OllamaDefaultRequest(BaseModel):
    model_name: str
