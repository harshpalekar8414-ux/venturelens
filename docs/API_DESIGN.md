# VentureLens — REST API Design Specification

**Version:** 2.1.0  
**Status:** Approved API Design  
**Author:** Lead Software Architect & Senior AI Engineer  

---

## 1. API Architecture & Global Conventions

The VentureLens API follows **RESTful conventions** with strict JSON request/response payloads, OpenAPI 3.1 compliance via FastAPI, and real-time streaming over Server-Sent Events (SSE) for research progress.

### Global Design Standards:
- **Base URL:** `/api/v1`
- **Authentication:** Bearer token (`Authorization: Bearer <token>`) or API Key header (`X-API-Key: <key>`).
- **Standard Date Format:** ISO 8601 UTC (`YYYY-MM-DDTHH:MM:SSZ`).
- **Standard Identifier Format:** UUID v4 strings.
- **Idempotency:** `Idempotency-Key` supported on research trigger endpoints.
- **Error Format:** RFC 7807 Problem Details compliant JSON.

```json
{
  "type": "https://venturelens.ai/errors/invalid-request",
  "title": "Validation Error",
  "status": 422,
  "detail": "Field 'company_name' must not be empty.",
  "instance": "/api/v1/companies/research"
}
```

---

## 2. API Endpoint Matrix

| Method | Path | Summary | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Health Check | Validates DB connection, pgvector status, and Gemini API connectivity |
| `GET` | `/api/v1/companies` | List & Search Companies | Search company database by name, domain, industry, or stage |
| `POST`| `/api/v1/companies` | Create Company | Initializes a new company profile |
| `GET` | `/api/v1/companies/{id}` | Get Company Profile | Full company dossier including founders, funding, and metrics |
| `POST`| `/api/v1/companies/{id}/research` | Trigger Research Run | Starts asynchronous research, crawling, and extraction job |
| `GET` | `/api/v1/companies/{id}/research/status` | Get Research Status | Returns real-time step progress (or SSE streaming stream) |
| `GET` | `/api/v1/companies/{id}/evidence` | Get Sourced Evidence | List extracted facts linked with source snippets & trust scores |
| `GET` | `/api/v1/companies/{id}/analysis` | Get Strategic Analysis | Thesis, competitive moat, bull/bear cases, risk matrix, DD questions |
| `POST`| `/api/v1/companies/{id}/analysis` | Regenerate Analysis | Triggers fresh synthesis with Gemini 3.7 Flash |
| `GET` | `/api/v1/companies/{id}/memo` | Get Investment Memo | Structured and markdown-formatted investment memo |
| `POST`| `/api/v1/companies/{id}/memo` | Generate Investment Memo | Compiles full institutional memo |
| `GET` | `/api/v1/companies/{id}/memo/export`| Export Investment Memo | Download memo in Markdown (`.md`) or PDF format |
| `POST`| `/api/v1/companies/compare` | Compare Companies | Side-by-side multi-company comparison matrix |
| `GET` | `/api/v1/sources/{id}` | Inspect Source & Chunks | Audit raw scraped snippet, headers, and metadata |

---

## 3. Detailed Request & Response Schemas (Pydantic Models)

### 3.1 Company Intake & Retrieval

#### `POST /api/v1/companies`
```json
// Request Body
{
  "name": "PostHog",
  "website_url": "https://posthog.com",
  "primary_industry": "Developer Tools",
  "auto_trigger_research": true
}

// Response Body (201 Created)
{
  "id": "7b8f9e12-4c23-4e89-87a1-3e5f2a1b9c04",
  "name": "PostHog",
  "slug": "posthog",
  "website_url": "https://posthog.com",
  "domain": "posthog.com",
  "primary_industry": "Developer Tools",
  "created_at": "2026-08-26T08:15:30Z",
  "research_run_id": "9d3a1c56-1122-3344-5566-778899aabbcc"
}
```

---

### 3.2 Research Execution & SSE Progress Stream

#### `POST /api/v1/companies/{id}/research`
```json
// Request Body
{
  "deep_search": true,
  "refresh_sources": false,
  "custom_focus_areas": ["Open Source Traction", "Enterprise Pricing Moat"]
}

// Response Body (202 Accepted)
{
  "research_run_id": "9d3a1c56-1122-3344-5566-778899aabbcc",
  "company_id": "7b8f9e12-4c23-4e89-87a1-3e5f2a1b9c04",
  "status": "PENDING",
  "stream_url": "/api/v1/companies/7b8f9e12-4c23-4e89-87a1-3e5f2a1b9c04/research/stream"
}
```

#### `GET /api/v1/companies/{id}/research/stream` (SSE Event Stream)
```
event: progress
data: {"step": "SEARCHING", "progress_percentage": 20, "message": "Executing 6 targeted web queries..."}

event: progress
data: {"step": "FETCHING", "progress_percentage": 45, "message": "Crawling 14 authoritative sources (TechCrunch, GitHub, Official Site)..."}

event: progress
data: {"step": "EXTRACTING", "progress_percentage": 70, "message": "Extracted 28 structured facts with source bindings..."}

event: progress
data: {"step": "SYNTHESIZING", "progress_percentage": 90, "message": "Gemini 3.7 Flash synthesizing investment thesis & bull/bear vectors..."}

event: complete
data: {"step": "COMPLETED", "progress_percentage": 100, "analysis_id": "5f1a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c"}
```

---

### 3.3 Evidence & Epistemic Audit Endpoint

#### `GET /api/v1/companies/{id}/evidence`
```json
// Response Body (200 OK)
{
  "company_id": "7b8f9e12-4c23-4e89-87a1-3e5f2a1b9c04",
  "total_facts": 24,
  "epistemic_breakdown": {
    "facts": 18,
    "calculated": 3,
    "assumptions": 1,
    "ai_interpretations": 2
  },
  "facts": [
    {
      "id": "c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
      "category": "FINANCIAL",
      "fact_key": "total_funding_usd",
      "fact_value": 27150000.00,
      "epistemic_type": "FACT",
      "confidence": 0.98,
      "supporting_quote": "PostHog raised a $15M Series B led by Y Combinator Continuity in 2021, bringing total funding to $27.15M.",
      "is_unsupported": false,
      "sources": [
        {
          "id": "s1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
          "url": "https://techcrunch.com/2021/06/10/posthog-series-b/",
          "domain": "techcrunch.com",
          "title": "PostHog raises $15M for its open-source product analytics",
          "trust_weight": 0.85,
          "scraped_at": "2026-08-26T08:16:10Z"
        }
      ]
    },
    {
      "id": "c2a3b4c5-d6e7-8f9a-0b1c-2d3e4f5a6b7c",
      "category": "FINANCIAL",
      "fact_key": "headcount_growth_cagr",
      "fact_value": 0.42,
      "epistemic_type": "CALCULATED",
      "calculation_formula": "CAGR(start=45, end=92, years=2.0) = (92/45)^(1/2) - 1 = 42.9%",
      "confidence": 0.95,
      "supporting_evidence_chunk_ids": ["e1a2b3c4-0000-0000-0000-000000000000"]
    }
  ]
}
```

---

### 3.4 Investment Memo & Strategic Analysis

#### `GET /api/v1/companies/{id}/memo`
```json
// Response Body (200 OK)
{
  "id": "m1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
  "company_id": "7b8f9e12-4c23-4e89-87a1-3e5f2a1b9c04",
  "title": "PostHog — Institutional Investment Memorandum",
  "version": 1,
  "executive_summary": "PostHog is an all-in-one open-source developer platform combining product analytics, session replay, feature flags, and A/B testing. Strong bottom-up developer adoption with high product velocity.",
  "investment_thesis": [
    {
      "pillar": "Single-Pane-of-Glass Developer Stack",
      "rationale": "Consolidates 5+ point solutions (Mixpanel, FullStory, LaunchDarkly) into a unified data architecture."
    },
    {
      "pillar": "Open-Source Flywheel & Self-Hosting Moat",
      "rationale": "Over 20k GitHub stars and self-hosting options satisfy strict data-privacy and enterprise compliance needs."
    }
  ],
  "competitive_moat": {
    "overall_score": "STRONG",
    "network_effects": "MODERATE",
    "switching_costs": "STRONG",
    "developer_mindshare": "DOMINANT"
  },
  "bull_case": [
    "Expands from product analytics into full-stack observability, capturing Datadog/NewRelic spend."
  ],
  "bear_case": [
    "Enterprise procurement friction against open-core self-hosted pricing; aggressive SaaS point-solution discounting."
  ],
  "risk_matrix": [
    {
      "risk": "Infrastructure Cost Scalability for Session Replay",
      "impact": "HIGH",
      "probability": "MEDIUM",
      "mitigation": "ClickHouse-backed architecture enables 10x compression over legacy relational engines."
    }
  ],
  "due_diligence_questions": [
    "What is the net revenue retention (NRR) among self-hosted to cloud-migrated enterprise customers?",
    "What percentage of revenue comes from session replay versus pure product analytics?"
  ],
  "markdown_content": "# PostHog Investment Memo\n\n## 1. Executive Summary\n...",
  "created_at": "2026-08-26T08:18:45Z"
}
```
