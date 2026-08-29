export type EpistemicTier = "FACT" | "CALCULATED" | "ASSUMPTION" | "AI_INTERPRETATION";

export interface SourceEvidence {
  id: number;
  title: string;
  url: string;
  snippet: string;
  domain: string;
}

export interface FounderItem {
  name: string;
  role: string;
  background: string;
  source_ids: number[];
}

export interface FundingRoundItem {
  round_name: string;
  amount: string;
  date: string;
  lead_investors: string[];
  source_ids: number[];
}

export interface FundingInfo {
  total_raised: string;
  stage: string;
  valuation: string;
  rounds: FundingRoundItem[];
  epistemic_tier: EpistemicTier;
}

export interface CompetitorItem {
  name: string;
  differentiation: string;
  source_ids: number[];
}

export interface RiskItem {
  category: string;
  description: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  mitigation: string;
}

export interface DueDiligenceQuestion {
  question: string;
  rationale: string;
}

export interface CompanyAnalysisReport {
  company_name: string;
  tagline: string;
  overview: string;
  overview_tier: EpistemicTier;
  overview_source_ids: number[];
  founders: FounderItem[];
  funding: FundingInfo;
  business_model: string;
  business_model_tier: EpistemicTier;
  business_model_source_ids: number[];
  competitors: CompetitorItem[];
  investment_thesis: string;
  investment_thesis_tier: EpistemicTier;
  bull_case: string;
  bull_case_tier: EpistemicTier;
  bear_case: string;
  bear_case_tier: EpistemicTier;
  key_risks: RiskItem[];
  due_diligence_questions: DueDiligenceQuestion[];
  sources: SourceEvidence[];
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function analyzeCompany(
  companyName: string
): Promise<CompanyAnalysisReport> {
  const response = await fetch(`${API_BASE_URL}/research/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ company_name: companyName }),
  });

  if (!response.ok) {
    let errorDetail = "Failed to analyze company.";
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorJson.title || errorDetail;
    } catch {
      // Fallback
    }
    throw new Error(errorDetail);
  }

  return response.json();
}
