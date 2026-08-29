import re
from urllib.parse import urlparse
from bs4 import BeautifulSoup
import httpx

from app.schemas.research import SourceEvidence
from app.services.search import RawSearchResult


def clean_html_text(html_content: str, max_chars: int = 1200) -> str:
    """Extract clean readable text from HTML content and truncate safely."""
    soup = BeautifulSoup(html_content, "html.parser")
    
    # Remove script, style, nav, footer, header elements
    for element in soup(["script", "style", "nav", "footer", "header", "noscript", "svg"]):
        element.extract()

    text = soup.get_text(separator=" ")
    # Collapse multiple whitespace characters
    cleaned = re.sub(r"\s+", " ", text).strip()
    return cleaned[:max_chars]


async def extract_sources_evidence(raw_results: list[RawSearchResult], max_sources: int = 5) -> list[SourceEvidence]:
    """
    Given raw search results, produces a list of indexed SourceEvidence objects.
    Enriches with fast page text fetching if search snippet is very short.
    """
    sources: list[SourceEvidence] = []
    
    for idx, result in enumerate(raw_results[:max_sources], start=1):
        domain = result.domain or urlparse(result.url).netloc
        snippet = result.snippet.strip()

        # If search snippet is very brief (< 60 chars) and URL looks valid, attempt quick fetch
        if len(snippet) < 60 and result.url.startswith("http"):
            try:
                async with httpx.AsyncClient(
                    timeout=4.0,
                    follow_redirects=True,
                    headers={"User-Agent": "VentureLensBot/0.1 (Startup Research Assistant)"}
                ) as client:
                    resp = await client.get(result.url)
                    if resp.status_code == 200:
                        extracted = clean_html_text(resp.text)
                        if len(extracted) > len(snippet):
                            snippet = extracted
            except Exception:
                pass

        # Final fallback snippet if still empty
        if not snippet:
            snippet = f"Public web source record for {result.title}."

        sources.append(
            SourceEvidence(
                id=idx,
                title=result.title,
                url=result.url,
                snippet=snippet,
                domain=domain,
            )
        )

    return sources
