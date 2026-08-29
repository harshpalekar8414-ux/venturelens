from fastapi import APIRouter

from app.api.v1.endpoints import health, research

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(research.router, tags=["Research"])
