import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_root_endpoint(async_client: AsyncClient):
    """Tests the root endpoint returns metadata and documentation paths."""
    response = await async_client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "VentureLens"
    assert "version" in data
    assert data["docs"] == "/api/v1/docs"
    assert data["health"] == "/api/v1/health"


@pytest.mark.asyncio
async def test_health_endpoint(async_client: AsyncClient):
    """Tests the health endpoint returns structured service status."""
    response = await async_client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] in ("healthy", "degraded", "down")
    assert "version" in data
    assert "environment" in data
    assert "database" in data
    assert "connected" in data["database"]
    assert "pgvector_installed" in data["database"]


@pytest.mark.asyncio
async def test_database_pgvector_integration(async_client: AsyncClient):
    """Tests that if database is connected, pgvector is actively verified."""
    response = await async_client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    if data["database"]["connected"]:
        assert data["database"]["pgvector_installed"] is True
        assert data["status"] == "healthy"
