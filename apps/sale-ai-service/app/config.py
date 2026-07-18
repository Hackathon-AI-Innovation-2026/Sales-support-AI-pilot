import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # App Settings
    PORT: int = 8002
    HOST: str = "0.0.0.0"
    
    # AI Settings
    GEMINI_API_KEY: str | None = None
    OPENAI_API_KEY: str | None = None
    LLM_PROVIDER: str = "gemini"  # "gemini" or "openai"
    
    # Vector DB Settings
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_API_KEY: str | None = None

    # Configuration for loading env vars from .env
    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parent.parent / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
