# VentureLens — AI & Research Pipeline Specification

**Version:** 2.1.0  
**Status:** Approved Specification  
**Author:** Lead Software Architect & Senior AI Engineer  

---

## 1. Pipeline Overview & Core Principles

The VentureLens AI & Research Pipeline is an institutional-grade, multi-stage ingestion, extraction, verification, and synthesis pipeline.

### Core Traceability Standard
VentureLens enforces a strict engineering guarantee for fact provenance:

> **Core Traceability Requirement:**  
> *"Every externally sourced factual claim must be traceable to an evidence record. Claims without sufficient supporting evidence must be explicitly marked unsupported/uncertain or excluded from factual output."*

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  VentureLens AI Research Pipeline                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
  [ 1. Search Discovery ] ──► Expands company queries via pluggable SearchProvider (Tavily/Mock)
              │
  [ 2. Safe Fetching ] ─────► Async HTTP fetch with pre-flight DNS SSRF validation
              │
  [ 3. Parsing & Chunking ]► Trafilatura HTML-to-Markdown + 400-token semantic chunking
              │
  [ 4. Storage & Embed ] ──► Store chunks in PostgreSQL; embed via Gemini Embedding 2 (configurable dim)
              │
  [ 5. Fact Extraction ] ──► Gemini 3.7 Flash with Pydantic JSON schema + mandatory chunk binding
              │
  [ 6. Verification & Math]► Quote substring verification + deterministic calculation engine (CAGR, runway)
              │
  [ 7. Epistemic Tagging ] ► Assigns FACT, CALCULATED, ASSUMPTION, or AI_INTERPRETATION
              │
  [ 8. Deep Synthesis ] ───► Gemini 3.7 Flash (Extended Thinking) compiles Thesis, Moat, Bull/Bear, Memo
              │
  [ 9. Delivery & Export ] ► Streams real-time progress via SSE; renders interactive Citation Drawer
```

---

## 2. Model Selection & Strategy

### Separation of Application Models vs. IDE Environment
> [!IMPORTANT]
> The AI models used by the VentureLens application are invoked directly via the `google-genai` Python SDK using the application's runtime `GEMINI_API_KEY`. This is entirely independent from the AI model powering the developer's Antigravity IDE assistant. Application code explicitly defines model targets in `app/core/config.py`.

### Model Tiering & Evaluation Matrix

| Pipeline Stage | Model Target | Primary Role | Tradeoff & Justification |
| :--- | :--- | :--- | :--- |
| **Fact Extraction & Validation (MVP Default)** | **Gemini 3.7 Flash** | Fast structured entity extraction, schema adherence, NLI claim verification. | Ultra-low latency (~1-2s), low token cost, native Pydantic schema validation (`response_schema`), capable hybrid reasoning. |
| **Deep Synthesis & Memo (MVP Default)** | **Gemini 3.7 Flash** *(with Thinking Budget)* | Multi-document cross-synthesis, investment thesis construction, moat rating, bull/bear modeling. | Highly capable reasoning with configurable thinking budgets; eliminates multi-model configuration friction and avoids hard dependencies on preview APIs for the MVP. |
| **Deep Synthesis (Optional Future Evaluation)** | **Gemini 3.1 Pro Preview** | Experimental benchmarking for extreme-depth multi-source due diligence synthesis. | Retained as an optional evaluation candidate for Phase 3 benchmarking; not a hard MVP dependency. |
| **Semantic Embeddings** | **Gemini Embedding 2** *(configurable dimension)* | Dense vector embeddings for evidence chunks and queries. | State-of-the-art multi-lingual semantic representation, flexible dimensionality (e.g. 768 / 1536 / 3072), optimized for pgvector HNSW indexing. |

---

## 3. Detailed Web Retrieval & Ingestion Architecture

The retrieval pipeline strictly decouples its 6 core responsibilities:

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ 1. Discovery     │ ──► │ 2. Fetching      │ ──► │ 3. Parsing       │
│ (SearchProvider) │     │ (httpx + SSRF)   │     │ (Trafilatura)    │
└──────────────────┘     └──────────────────┘     └──────────────────┘
                                                           │
                                                           ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ 6. Retrieval     │ ◄── │ 5. Extraction    │ ◄── │ 4. Storage       │
│ (Hybrid pgvector)│     │ (Gemini 3.7 Flash│     │ (Postgres Chunks)│
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

### 3.1 Search Discovery (Pluggable Provider Interface)
The search discovery stage formats 6 targeted search vectors (Overview, Founders, Funding, Market, Tech, News) and queries a pluggable backend:

```python
class SearchProvider(ABC):
    @abstractmethod
    async def search(self, query: str, max_results: int = 5) -> list[SearchResult]: ...

class TavilySearchProvider(SearchProvider):
    """Production search provider using Tavily API."""
    ...

class MockSearchProvider(SearchProvider):
    """Local offline testing search provider with zero API cost."""
    ...
```

### 3.2 Safe Fetching
- Asynchronous HTTP fetching via `httpx.AsyncClient`.
- **Pre-Flight DNS Resolution:** Verifies host IP against private, link-local, and cloud metadata subnets before socket connection (`127.0.0.0/8`, `10.0.0.0/8`, `192.168.0.0/16`, `169.254.169.254`).
- Strict 8-second request timeout and 2MB payload cap.

### 3.3 Parsing & Boilerplate Removal
- Clean extraction via `trafilatura` converting noisy HTML into clean, semantic Markdown while stripping navigation headers, ads, scripts, and footers.

### 3.4 Storage & Chunking
- Recursive text chunking with sliding window: 400 tokens (~1,600 characters) with 50-token overlap.
- Chunks are stored in `evidence_chunks` with metadata (`source_url`, `title`, `domain_trust_score`, `scraped_at`).

### 3.5 Structured Extraction (Gemini 3.7 Flash)
- Extraction operates strictly through Pydantic JSON schemas.
- Every extracted fact must supply `evidence_chunk_ids` and a verbatim `supporting_quote`.
- **Uncertainty Rule:** If evidence is contradictory, ambiguous, or absent, the fact is labeled `epistemic_type = "ASSUMPTION"` or flagged as `UNSUPPORTED`.

### 3.6 Hybrid Retrieval (Vector + Full-Text)
- Combines `Gemini Embedding 2` cosine distance via pgvector and PostgreSQL `tsvector` full-text ranking to surface high-signal chunks for synthesis.

---

## 4. Epistemic Classification & Verification Engine

Every fact in the system is classified into one of four epistemic tiers:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          Epistemic Classification Engine                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│ 1. FACT: Verified claim with matching verbatim quote from evidence chunk        │
│ 2. CALCULATED: Computed via deterministic Python functions                      │
│    - CAGR = ((End_Value / Start_Value) ** (1 / Years)) - 1                      │
│    - Implied Valuation Step-Up = Current_Valuation / Previous_Valuation         │
│    - Runway Estimate = Cash_Raised_Est / (Headcount * Avg_Burn_Per_Employee)    │
│ 3. ASSUMPTION: Applied baseline model parameters (e.g. 75% Gross Margin)       │
│ 4. AI_INTERPRETATION: Strategic synthesis (Moat, Bull/Bear, Investment Thesis)  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Verification & Conflict Resolution:
1. **Quote Matcher:** Verifies whether `supporting_quote` exists within the referenced `EvidenceChunk`. If no match, the fact is flagged as `UNVERIFIED` and downgraded to `ASSUMPTION` or dropped.
2. **Conflict Weighting:** When sources conflict (e.g. conflicting Series A dates/amounts), the engine calculates recency and domain trust weights:
   $$\text{Final Weight} = \text{Domain Trust} \times e^{-\lambda \times \text{Days Old}}$$
   Both data points are surfaced in the audit trail, with the highest-weight candidate selected as primary.

---

## 5. Strategic Synthesis & Investment Memo (Gemini 3.7 Flash with Extended Thinking)

Grounded strictly in verified facts and calculated metrics, Gemini 3.7 Flash (configured with a synthesis thinking budget) compiles:
- **Investment Thesis:** 3–4 core pillars justifying venture return potential.
- **Competitive Moat:** Structured breakdown across Network Effects, Switching Costs, Cost Advantages, and Intangible Assets.
- **Bull & Bear Scenarios:** Explicit upside catalysts and downside vulnerability vectors.
- **Due Diligence Questionnaire:** 8–12 targeted diligence questions for investor meetings.
- **Executive Investment Memo:** Markdown-formatted institutional investment committee memorandum.

*(Gemini 3.1 Pro Preview is documented as an optional benchmark evaluation candidate for future phases).*

---

## 6. Indirect Prompt Injection Defense & Privacy

1. **XML Data Isolation:** Scraped text is wrapped in `<untrusted_scraped_content id="...">` blocks.
2. **System Instruction Boundaries:** The model is instructed to treat all enclosed text as data to analyze, never instructions to execute.
3. **Structured Output Guarantee:** Using Gemini `response_schema` ensures output conforms to the JSON schema, preventing hijacked conversational output.
4. **Privacy:** The user interface exposes structured conclusions, sources, quotes, and methodology while keeping raw internal chain-of-thought tokens private.
