from pathlib import Path

from pydantic import model_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str | None = None
    SECRET_KEY: str = "dev-secret-key"
    OPENAI_API_KEY: str = "sk-dev-placeholder"
    DB_USER: str = "cvmaker_user"
    DB_PASSWORD: str = "your_strong_password_here"
    DB_NAME: str = "cvmaker"
    ENVIRONMENT: str = "development"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"

    class Config:
        env_file = Path(__file__).resolve().parents[2] / ".env"

    @model_validator(mode="after")
    def ensure_database_url(self):
        if not self.DATABASE_URL:
            self.DATABASE_URL = (
                f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}"
                f"@localhost:5432/{self.DB_NAME}"
            )
        return self


settings = Settings()