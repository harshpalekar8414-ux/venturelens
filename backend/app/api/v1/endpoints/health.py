from fastapi import APIRouter
from sqlalchemy import text

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.schemas.health import DatabaseHealth, HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse, summary="System Health & Connectivity Check")
async def check_health() -> HealthResponse:
    """Checks the health of the FastAPI service and verifies PostgreSQL + pgvector connectivity."""
    db_connected = False
    pgvector_ready = False
    db_version = None
    error_msg = None

    try:
        async with AsyncSessionLocal() as session:
            # Check basic connection and database version
            ver_result = await session.execute(text("SELECT version();"))
            db_version_row = ver_result.scalar()
            if db_version_row:
                db_connected = True
                db_version = str(db_version_row).split(",")[0]

            # Verify that the vector extension is actively enabled in the database
            ext_result = await session.execute(
                text("SELECT extversion FROM pg_extension WHERE extname = 'vector';")
            )
            ext_version = ext_result.scalar()
            if ext_version:
                pgvector_ready = True
    except Exception as exc:
        error_msg = str(exc)

    return HealthResponse(
        status="healthy" if (db_connected and pgvector_ready) else ("degraded" if db_connected else "down"),
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        database=DatabaseHealth(
            connected=db_connected,
            pgvector_installed=pgvector_ready,
            database_version=db_version,
            error=error_msg,
        ),
    )
