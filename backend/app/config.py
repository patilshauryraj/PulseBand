import os
from pydantic import BaseModel
from typing import List, Optional

class Settings(BaseModel):
    PROJECT_NAME: str = "PulseBand Health Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Database: Default to SQLite for zero-friction local run, or PostgreSQL
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite+aiosqlite:///./pulseband.db"
    )

    # Redis (Optional cache/pubsub)
    REDIS_URL: Optional[str] = os.getenv("REDIS_URL", None)

    # JWT Authentication
    JWT_SECRET: str = os.getenv("JWT_SECRET", "pulseband_super_secret_jwt_key_development_only_2026")
    JWT_REFRESH_SECRET: str = os.getenv("JWT_REFRESH_SECRET", "pulseband_super_secret_refresh_key_2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Google OAuth (Optional credentials)
    GOOGLE_CLIENT_ID: Optional[str] = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: Optional[str] = os.getenv("GOOGLE_CLIENT_SECRET", "")

    # CORS
    CORS_ORIGINS: List[str] = ["*"]

settings = Settings()
