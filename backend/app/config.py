import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import EmailStr

class Settings(BaseSettings):
    PROJECT_NAME: str = "SocialEngage AI"
    API_V1_STR: str = "/api"
    
    # Security & JWT
    SECRET_KEY: str = "supersecretjwtkey1234567890abcdef"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # Databases & Caches
    DATABASE_URL: str = "postgresql://postgres:postgrespassword@localhost:5432/socialengage"
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"
    
    # Ollama Local settings
    OLLAMA_URL: str = "http://localhost:11434"
    DEFAULT_OLLAMA_MODEL: str = "llama3:latest"
    GROQ_API_KEY: Optional[str] = None
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000", "http://127.0.0.1:3000"]
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
