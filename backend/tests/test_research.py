import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.schemas.research import CompanyAnalysisReport
from app.services.extractor import clean_html_text
from app.services.search import MockSearchProvider


@pytest.mark.asyncio
async def test_mock_search_provider():
    provider = MockSearchProvider()
    results = await provider.search("PostHog", limit=3)
    assert len(results) >= 2
    assert "PostHog" in results[0].title or "posthog" in results[0].url
    assert results[0].snippet != ""


@pytest.mark.asyncio
async def test_mock_search_provider_unknown_company():
    provider = MockSearchProvider()
    results = await provider.search("AcmeCorpAI", limit=2)
    assert len(results) == 2
    assert "AcmeCorpAI" in results[0].title


def test_html_cleaner():
    html = """
    <html>
      <head><title>Test</title></head>
      <body>
        <nav>Nav bar</nav>
        <script>alert('hidden')</script>
        <p>Main content about startup funding and metrics.</p>
        <footer>Footer info</footer>
      </body>
    </html>
    """
    cleaned = clean_html_text(html)
    assert "Main content about startup funding" in cleaned
    assert "alert('hidden')" not in cleaned
    assert "Nav bar" not in cleaned


@pytest.mark.asyncio
async def test_research_endpoint_end_to_end():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/v1/research/analyze",
            json={"company_name": "PostHog"},
        )
        assert response.status_code == 200
        data = response.json()

        # Validate that response conforms to CompanyAnalysisReport
        report = CompanyAnalysisReport.model_validate(data)
        assert report.company_name == "PostHog"
        assert len(report.overview) > 0
        assert report.overview_tier in ["FACT", "CALCULATED", "ASSUMPTION", "AI_INTERPRETATION"]
        assert len(report.founders) > 0
        assert report.funding.stage != ""
        assert len(report.competitors) > 0
        assert len(report.investment_thesis) > 0
        assert len(report.bull_case) > 0
        assert len(report.bear_case) > 0
        assert len(report.key_risks) > 0
        assert len(report.due_diligence_questions) > 0
        assert len(report.sources) > 0
        assert report.sources[0].url.startswith("http")


@pytest.mark.asyncio
async def test_research_endpoint_empty_name():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/v1/research/analyze",
            json={"company_name": ""},
        )
        # Empty string violates min_length=1 in Pydantic schema -> 422
        assert response.status_code in [400, 422]
