from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PORT: int = 8001
    HOST: str = "0.0.0.0"
    MODEL_PATH: str = "model/lead_scoring.pkl"
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:3001"

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
