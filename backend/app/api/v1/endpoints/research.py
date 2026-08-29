from fastapi import APIRouter, HTTPException, status
from app.schemas.research import CompanyAnalysisReport, CompanyResearchRequest
from app.services.analyzer import get_analyzer_service
from app.services.extractor import extract_sources_evidence
from app.services.search import get_search_provider

router = APIRouter(prefix="/research", tags=["Research"])


@router.post(
    "/analyze",
    response_model=CompanyAnalysisReport,
    summary="End-to-end grounded startup research and analysis",
    status_code=status.HTTP_200_OK,
)
async def analyze_company(request: CompanyResearchRequest) -> CompanyAnalysisReport:
    """
    Executes M1 end-to-end research flow:
    1. Search public web sources for the given company.
    2. Extract and index source text and evidence snippets.
    3. Generate structured 11-section analysis grounded in evidence.
    4. Return full report with source citations and epistemic classifications.
    """
    company_name = request.company_name.strip()
    if not company_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company name cannot be empty.",
        )

    search_provider = get_search_provider()
    analyzer = get_analyzer_service()

    # Step 1: Discover web sources
    raw_results = await search_provider.search(company_name, limit=5)
    
    # Step 2: Extract clean text snippets & compile source evidence
    sources = await extract_sources_evidence(raw_results, max_sources=5)

    # Step 3: Run grounded analysis
    report = await analyzer.analyze(company_name, sources)

    return report
