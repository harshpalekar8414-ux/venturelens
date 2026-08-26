from pydantic import BaseModel


class DatabaseHealth(BaseModel):
    connected: bool
    pgvector_installed: bool
    database_version: str | None = None
    error: str | None = None


class HealthResponse(BaseModel):
    status: str
    version: str
    environment: str
    database: DatabaseHealth
