# VentureLens — AI Evaluation & Benchmark Specification

**Version:** 2.0.0  
**Status:** Approved Evaluation Specification  
**Author:** Lead Software Architect & Senior AI Engineer  

---

## 1. Evaluation Philosophy & AI Quality Framework

VentureLens treats AI quality and fact-traceability as first-class engineering disciplines. We do not rely on subjective vibes or unverifiable claims of perfection. Instead, every release is evaluated against quantitative metrics using an automated benchmark harness.

### Key Evaluation Dimensions & Measurement Methodologies

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              VentureLens Evaluation Framework                          │
├──────────────────────────────┬─────────────────────────────────────────────────────────┤
│ Evaluation Metric            │ Post-Implementation Measurement Methodology            │
├──────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 1. Factual Accuracy          │ Programmatic comparison against golden ground-truth     │
│                              │ records (Founders, HQ, Founded Year, Round Totals).     │
├──────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 2. Evidence Attribution      │ Substring & NLI verification checking whether cited     │
│                              │ evidence chunks genuinely contain and support the fact. │
├──────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 3. Unsupported Claim Rate    │ AST & regex parser measuring % of factual assertions in │
│                              │ the memo that lack valid evidence chunk references.     │
├──────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 4. Structured Output Valid.  │ Pydantic v2 validation pass rate on raw Gemini outputs. │
├──────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 5. Retrieval Relevance       │ Precision@K & MRR against annotated relevant chunks for │
│                              │ golden benchmark search queries.                        │
├──────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 6. Pipeline Latency          │ OpenTelemetry span timers tracking search, crawling,    │
│                              │ extraction, and synthesis wall-clock durations.         │
├──────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 7. Token Usage & API Cost    │ Exact accounting of Gemini prompt/completion tokens and │
│                              │ search provider query costs per completed dossier.      │
└──────────────────────────────┴─────────────────────────────────────────────────────────┘
```

---

## 2. Curated Golden Benchmark Suite

To validate the pipeline across diverse startup stages and data availability profiles, a curated golden benchmark dataset of verified startups is maintained in `backend/tests/evals/golden_records.json`:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        Golden Benchmark Company Suite                                  │
├───────────────────────┬───────────────────────┬────────────────────────────────────────┤
│ Company Name          │ Stage / Category      │ Evaluation Focus                       │
├───────────────────────┼───────────────────────┼────────────────────────────────────────┤
│ 1. PostHog            │ Series B / DevTools   │ Open-source vs Cloud revenue metrics   │
│ 2. Resend             │ Early / Comms Infra   │ Founder background & traction signals  │
│ 3. Modal Labs         │ Series A / Cloud AI   │ Technical architecture & pricing facts │
│ 4. Cursor (Anysphere) │ Early / AI DevTools   │ Fast-evolving funding history          │
│ 5. Perplexity AI      │ Growth / AI Search    │ Competitor positioning & moats         │
│ 6. Anduril Industries │ Late / Defense Tech   │ Multi-round funding & lead investors   │
│ 7. Supabase           │ Series B / Open Source│ Open-source community & PostgreSQL TAM │
└───────────────────────┴───────────────────────┴────────────────────────────────────────┘
```

### Golden Record Schema Structure
```json
{
  "company_slug": "posthog",
  "verified_facts": {
    "founded_year": 2020,
    "hq_city": "San Francisco",
    "founders": ["James Hawkins", "Tim Glaser"],
    "latest_round": "Series B",
    "total_funding_usd": 27150000.00,
    "business_model": "Open-Core SaaS"
  },
  "benchmark_queries": [
    "PostHog Series B funding round lead investor",
    "PostHog founders previous background"
  ]
}
```

---

## 3. Post-Implementation Measurement Procedures

### 3.1 Factual Accuracy Measurement
- **Script:** `backend/tests/evals/test_factual_accuracy.py`
- **Method:** Normalizes extracted entity values (e.g. converting `"$27.15M"` to `27150000.00`) and compares them against `verified_facts` with numerical tolerance ($\pm 5\%$) and Levenshtein string matching ($\ge 0.90$).
- **Formula:**
  $$\text{Factual Accuracy} = \frac{\text{Correct Extracted Facts}}{\text{Total Ground Truth Facts Tested}}$$

### 3.2 Evidence Attribution & Unsupported Claim Measurement
- **Script:** `backend/tests/evals/test_attribution.py`
- **Method:**
  1. For every `StructuredFact`, extracts `supporting_quote` and referenced `EvidenceChunk`.
  2. Runs fuzzy substring verification: does the quote exist in the chunk?
  3. Evaluates unsupported claims:
  $$\text{Unsupported Claim Rate} = \frac{\text{Facts with Missing or Invalid Chunk IDs}}{\text{Total Output Facts}}$$

### 3.3 Structured Output Validity
- **Script:** `backend/tests/evals/test_schema_validity.py`
- **Method:** Executes 50 test extractions across Gemini 3.7 Flash and verifies whether Pydantic v2 raises any `ValidationError`.

### 3.4 Latency and Cost Logging
- The orchestrator records exact millisecond timestamps and token consumption metadata (`prompt_tokens`, `completion_tokens`, `search_queries_count`) into `research_runs.gemini_token_usage` for each run.

---

## 4. Evaluation Suite Integration & CI Automation

- **Local Runner:** Developers execute `python scripts/run_evals.py --quick` to test a 3-company subset before submitting PRs.
- **CI Regression Gate (`.github/workflows/eval.yml`):**
  - Runs automatically on pull requests modifying `app/services/` or `app/pipeline/`.
  - Blocks PR merges if schema validity is $< 100\%$ or if factual accuracy regresses below baseline.
