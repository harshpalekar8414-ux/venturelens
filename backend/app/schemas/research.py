from typing import Literal
from pydantic import BaseModel, Field


EpistemicTier = Literal["FACT", "CALCULATED", "ASSUMPTION", "AI_INTERPRETATION"]


class SourceEvidence(BaseModel):
    """A retrieved web source and extracted evidence snippet."""
    id: int = Field(description="Unique 1-based index of the source")
    title: str = Field(description="Title of the source page or document")
    url: str = Field(description="Canonical URL of the source")
    snippet: str = Field(description="Extracted verbatim or near-verbatim text snippet")
    domain: str = Field(default="", description="Domain name of the source (e.g. techcrunch.com)")


class FounderItem(BaseModel):
    """Information about a founder or executive."""
    name: str = Field(description="Name of the founder")
    role: str = Field(default="", description="Role or title (e.g. CEO & Co-founder)")
    background: str = Field(default="Unverified", description="Previous experience or background. State 'Unverified' if not in sources.")
    source_ids: list[int] = Field(default_factory=list, description="IDs of sources backing this claim")


class FundingRoundItem(BaseModel):
    """Funding round information."""
    round_name: str = Field(description="Round type (e.g. Seed, Series A, Venture Round)")
    amount: str = Field(default="Undisclosed", description="Amount raised or 'Undisclosed' if unknown")
    date: str = Field(default="Unknown", description="Date or year of round")
    lead_investors: list[str] = Field(default_factory=list, description="Notable lead investors")
    source_ids: list[int] = Field(default_factory=list, description="IDs of sources backing this claim")


class FundingInfo(BaseModel):
    """Consolidated funding profile."""
    total_raised: str = Field(default="Unknown / Undisclosed", description="Total capital raised across all rounds")
    stage: str = Field(default="Unknown", description="Current company stage (e.g. Early Stage, Growth, Private)")
    valuation: str = Field(default="Undisclosed", description="Estimated or verified valuation")
    rounds: list[FundingRoundItem] = Field(default_factory=list, description="List of recorded funding rounds")
    epistemic_tier: EpistemicTier = Field(default="FACT")


class CompetitorItem(BaseModel):
    """Identified competitor and differentiation."""
    name: str = Field(description="Competitor name")
    differentiation: str = Field(description="How the analyzed company differentiates itself")
    source_ids: list[int] = Field(default_factory=list, description="IDs of sources supporting competitor context")


class RiskItem(BaseModel):
    """Identified operational, market, or execution risk."""
    category: str = Field(description="Category (e.g. Market Risk, Regulatory, Execution, Defensibility)")
    description: str = Field(description="Specific risk description grounded in industry context")
    severity: Literal["HIGH", "MEDIUM", "LOW"] = Field(default="MEDIUM", description="Assessed severity level")
    mitigation: str = Field(default="", description="Potential or observed mitigation strategy")


class DueDiligenceQuestion(BaseModel):
    """Recommended investor diligence question."""
    question: str = Field(description="Targeted question to ask during due diligence")
    rationale: str = Field(description="Why this question is critical for investment evaluation")


class CompanyAnalysisReport(BaseModel):
    """Complete 11-section structured research and investment intelligence report."""
    company_name: str = Field(description="Standardized company name")
    tagline: str = Field(default="", description="One-line company summary")
    
    # 1. Company overview
    overview: str = Field(description="Grounded company summary detailing product, market, and value proposition.")
    overview_tier: EpistemicTier = Field(default="FACT")
    overview_source_ids: list[int] = Field(default_factory=list)

    # 2. Founders
    founders: list[FounderItem] = Field(default_factory=list, description="Founding team and key leadership")

    # 3. Funding
    funding: FundingInfo = Field(default_factory=FundingInfo, description="Funding status, stage, and rounds")

    # 4. Business model
    business_model: str = Field(description="Monetization structure, pricing model, target customers, and distribution channels.")
    business_model_tier: EpistemicTier = Field(default="FACT")
    business_model_source_ids: list[int] = Field(default_factory=list)

    # 5. Competitors
    competitors: list[CompetitorItem] = Field(default_factory=list, description="Key competitors and market landscape")

    # 6. Investment thesis
    investment_thesis: str = Field(description="Core rationale for investing in this company and why it could become a market leader.")
    investment_thesis_tier: EpistemicTier = Field(default="AI_INTERPRETATION")

    # 7. Bull case
    bull_case: str = Field(description="Optimistic upside scenario assuming maximum market expansion and strong execution.")
    bull_case_tier: EpistemicTier = Field(default="AI_INTERPRETATION")

    # 8. Bear case
    bear_case: str = Field(description="Downside failure modes, macroeconomic hurdles, and competitive squeeze risks.")
    bear_case_tier: EpistemicTier = Field(default="AI_INTERPRETATION")

    # 9. Key risks
    key_risks: list[RiskItem] = Field(default_factory=list, description="Top operational and market risks")

    # 10. Due diligence questions
    due_diligence_questions: list[DueDiligenceQuestion] = Field(default_factory=list, description="Key questions for the investment team to explore")

    # 11. Sources / evidence
    sources: list[SourceEvidence] = Field(default_factory=list, description="All retrieved web sources used to ground this report")


class CompanyResearchRequest(BaseModel):
    """Input payload for initiating company research."""
    company_name: str = Field(min_length=1, max_length=100, description="Name or domain of the company to analyze (e.g. PostHog, Cursor)")
