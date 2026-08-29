import re
from abc import ABC, abstractmethod
from typing import Any
from urllib.parse import urlparse
import httpx
from pydantic import BaseModel

from app.core.config import settings


class RawSearchResult(BaseModel):
    """Raw result returned by a search provider."""
    title: str
    url: str
    snippet: str
    domain: str = ""


class SearchProvider(ABC):
    """Abstract interface for pluggable web search providers."""

    @abstractmethod
    async def search(self, company_name: str, limit: int = 5) -> list[RawSearchResult]:
        """Search public web sources for a given company name."""
        pass


class MockSearchProvider(SearchProvider):
    """Offline/Mock provider with realistic startup facts for testing and demo."""

    MOCK_KNOWLEDGE_BASE: dict[str, list[dict[str, str]]] = {
        "posthog": [
            {
                "title": "PostHog — Open-Source Product Analytics Suite",
                "url": "https://posthog.com/about",
                "snippet": "PostHog was founded in 2020 by James Hawkins (CEO) and Tim Glaser (CTO). It is an all-in-one open-source product OS combining product analytics, session recording, feature flags, A/B testing, and surveys.",
            },
            {
                "title": "PostHog raises $25M Series B led by GV for open-source analytics",
                "url": "https://techcrunch.com/posthog-series-b-funding",
                "snippet": "PostHog has raised a total of $27.1M to date across Seed, Series A, and Series B rounds. Investors include GV (Google Ventures), Y Combinator (W20), and prominent developer-focused angels.",
            },
            {
                "title": "PostHog transparent pricing and business model",
                "url": "https://posthog.com/pricing",
                "snippet": "PostHog operates an open-core SaaS business model with cloud hosting tiers and enterprise self-hosted licenses with usage-based volume pricing.",
            },
            {
                "title": "PostHog Competitors and Market Analysis",
                "url": "https://g2.com/categories/product-analytics/posthog",
                "snippet": "Key competitors in the product intelligence space include Mixpanel, Amplitude, FullStory, and Heap. PostHog differentiates via self-hosting data privacy and open-source transparency.",
            },
        ],
        "cursor": [
            {
                "title": "Cursor (Anysphere) — The AI-First Code Editor",
                "url": "https://cursor.com/about",
                "snippet": "Cursor is built by Anysphere, founded by Michael Truell, Aman Sanger, Sualeh Asif, and Arvid Lunnemark. It is a fork of VS Code with deeply integrated AI models for code generation, multi-file edits, and codebase chat.",
            },
            {
                "title": "Anysphere raises $60M Series A from Andreessen Horowitz and OpenAI Startup Fund",
                "url": "https://techcrunch.com/anysphere-cursor-series-a",
                "snippet": "Cursor creator Anysphere raised over $60M, valuing the AI coding editor company at $400M+. Backed by OpenAI Startup Fund, a16z, and prominent tech founders.",
            },
            {
                "title": "Cursor Subscription Tiers & Developer Pricing",
                "url": "https://cursor.com/pricing",
                "snippet": "Cursor monetizes through monthly and annual SaaS developer subscriptions ($20/mo Pro tier, enterprise custom contracts) with compute quota overages.",
            },
            {
                "title": "AI Code Editors Landscape: Cursor vs GitHub Copilot",
                "url": "https://techradar.com/best-ai-code-tools",
                "snippet": "Competitors include GitHub Copilot Workspace, Windsurf (Codeium), Zed, and JetBrains AI Assistant. Cursor differentiates with repo-wide context indexing and fast composer multi-file editing.",
            },
        ],
        "modal labs": [
            {
                "title": "Modal Labs — Serverless Cloud Infrastructure for AI & Data",
                "url": "https://modal.com/about",
                "snippet": "Modal Labs was founded in 2021 by Erik Bernhardsson (former CTO of Better.com and Spotify alumni). Modal provides serverless cloud compute infrastructure for running Python AI/ML workloads, GPU containers, and batch jobs.",
            },
            {
                "title": "Modal Labs secures $16M Series A led by Redpoint Ventures",
                "url": "https://techcrunch.com/modal-labs-serverless-ai-funding",
                "snippet": "Modal has raised over $23M across Seed and Series A rounds. Key investors include Redpoint Ventures, Amplify Partners, and Lux Capital.",
            },
            {
                "title": "Modal Pay-per-second Serverless GPU Pricing",
                "url": "https://modal.com/pricing",
                "snippet": "Modal monetizes through per-second compute billing for CPU and GPU resources (H100, A100, L4) with zero idle costs and enterprise volume commitments.",
            },
        ],
    }

    async def search(self, company_name: str, limit: int = 5) -> list[RawSearchResult]:
        clean_name = company_name.strip().lower()
        
        # Check direct or partial match in mock knowledge base
        for key, sources in self.MOCK_KNOWLEDGE_BASE.items():
            if key in clean_name or clean_name in key:
                results = []
                for s in sources[:limit]:
                    domain = urlparse(s["url"]).netloc
                    results.append(
                        RawSearchResult(
                            title=s["title"],
                            url=s["url"],
                            snippet=s["snippet"],
                            domain=domain,
                        )
                    )
                return results

        # Generic realistic fallback for unknown startups
        domain_name = re.sub(r"[^a-zA-Z0-9]", "", clean_name) or "startup"
        return [
            RawSearchResult(
                title=f"{company_name} — Official Website & Product Overview",
                url=f"https://{domain_name}.io/about",
                snippet=f"{company_name} provides modern software solutions and technology services for enterprise teams.",
                domain=f"{domain_name}.io",
            ),
            RawSearchResult(
                title=f"{company_name} Technology & Market Landscape",
                url=f"https://techcrunch.com/{domain_name}-overview",
                snippet=f"{company_name} operates in the software technology space. Early-stage venture backed with undisclosed founding details.",
                domain="techcrunch.com",
            ),
        ]


class TavilySearchProvider(SearchProvider):
    """Live web search provider using Tavily API."""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.api_url = "https://api.tavily.com/search"

    async def search(self, company_name: str, limit: int = 5) -> list[RawSearchResult]:
        if not self.api_key or self.api_key.startswith("mock") or self.api_key == "your_search_api_key_here":
            return await MockSearchProvider().search(company_name, limit)

        query = f"{company_name} startup founders funding business model competitors"
        payload: dict[str, Any] = {
            "api_key": self.api_key,
            "query": query,
            "search_depth": "basic",
            "include_answer": False,
            "max_results": limit,
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(self.api_url, json=payload)
                resp.raise_for_status()
                data = resp.json()
                
                results: list[RawSearchResult] = []
                for item in data.get("results", [])[:limit]:
                    url = item.get("url", "")
                    domain = urlparse(url).netloc
                    results.append(
                        RawSearchResult(
                            title=item.get("title", f"{company_name} Search Result"),
                            url=url,
                            snippet=item.get("content", item.get("snippet", "")),
                            domain=domain,
                        )
                    )
                if results:
                    return results
        except Exception:
            # On network or API key error, gracefully fall back to mock data
            pass
            
        return await MockSearchProvider().search(company_name, limit)


def get_search_provider() -> SearchProvider:
    """Factory function returning configured SearchProvider."""
    provider_type = settings.SEARCH_PROVIDER.strip().lower()
    api_key = settings.SEARCH_PROVIDER_API_KEY.strip()

    if provider_type == "tavily" and api_key and not api_key.startswith("mock"):
        return TavilySearchProvider(api_key=api_key)
    
    return MockSearchProvider()
