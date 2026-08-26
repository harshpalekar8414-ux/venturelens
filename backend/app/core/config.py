import json
from typing import Annotated, Any
from pydantic import BeforeValidator
from pydantic_settings import BaseSettings, SettingsConfigDict


def parse_cors(v: Any) -> list[str]:
    if isinstance(v, str) and not v.startswith("["):
        return [i.strip() for i in v.split(",")]
    elif isinstance(v, str) and v.startswith("["):
        return json.loads(v)
    elif isinstance(v, list):
        return v
    return ["http://localhost:3000"]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # General
    PROJECT_NAME: str = "VentureLens"
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    API_V1_STR: str = "/api/v1"
    CORS_ORIGINS: Annotated[list[str], BeforeValidator(parse_cors)] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Database & Vector Store
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/venturelens"
    EMBEDDING_MODEL: str = "gemini-embedding-2"
    EMBEDDING_DIMENSION: int = 768

    # AI Models (Google Gemini API)
    GEMINI_API_KEY: str = "mock_key_for_local_dev"
    GEMINI_EXTRACTION_MODEL: str = "gemini-3.7-flash"
    GEMINI_SYNTHESIS_MODEL: str = "gemini-3.7-flash"
    GEMINI_THINKING_BUDGET: int = 2048

    # Web Search
    SEARCH_PROVIDER: str = "mock"
    SEARCH_PROVIDER_API_KEY: str = "mock_search_key"


settings = Settings()
