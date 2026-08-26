# VentureLens — Comprehensive Implementation Roadmap & Project Plan

**Version:** 2.1.0  
**Status:** Approved Phased Implementation Plan  
**Author:** Lead Software Architect & Senior AI Engineer  

---

## 1. Phased Architecture Strategy

VentureLens is implemented through a structured three-phase roadmap, ensuring an immediate, testable, end-to-end working MVP before layering advanced semantic retrieval and evaluation automation.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                             VentureLens 3-Phase Roadmap                                │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [PHASE 1: MVP CORE]                                                                    │
│ 1. Project Infrastructure (Docker, FastAPI, Next.js, Postgres)                         │
│ 2. PostgreSQL Schema & Alembic Migrations                                              │
│ 3. Company Model & CRUD Endpoints                                                      │
│ 4. Basic Company Research Orchestration                                                │
│ 5. Web Retrieval (Search discovery + safe crawling + Trafilatura cleaner)              │
│ 6. Evidence Storage (Raw sources & text chunks)                                        │
│ 7. Structured Fact Extraction (Gemini 3.7 Flash + Pydantic schemas)                     │
│ 8. Gemini Analysis (Gemini 3.7 Flash with thinking budget for thesis, moat, risks)     │
│ 9. Basic Investment Report (Terminal UI dashboard)                                    │
│ 10. Source Citation Display (Verbatim quote & URL links)                               │
│ 11. Automated Unit & Integration Tests                                                 │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [PHASE 2: ENHANCED INTELLIGENCE & UX]                                                  │
│ • Embeddings & pgvector Semantic Retrieval (Gemini Embedding 2, HNSW index)            │
│ • Multi-Source Conflict Resolution & Date-Decay Weighting                              │
│ • Interactive Citation Inspector Drawer (Slide-over snippet audit)                     │
│ • Server-Sent Events (SSE) Real-Time Research Progress Stream                          │
│ • Institutional Investment Memo Compilation & PDF/Markdown Export                      │
│ • Multi-Company Comparison Terminal (Side-by-side metric matrix)                       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [PHASE 3: ENTERPRISE EVALUATION & ADVANCED AGENTS]                                     │
│ • Automated AI Quality Benchmark Harness (Golden 7-company suite)                      │
│ • Deep Synthesis Model Evaluation (Benchmarking Gemini 3.1 Pro Preview)                │
│ • Sophisticated Hybrid Retrieval & Reranking                                           │
│ • Deep Financial Modeling (Cap table simulations, dilution projections)                │
│ • Watchlists & Automated Company Monitoring                                            │
│ • OpenTelemetry Observability & Token Cost Dashboards                                  │
│ • Advanced Autonomous Diligence Agents                                                 │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Project Monorepo Structure

```
VentureLens/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Automated lint, typecheck, pytest, frontend build
│       └── eval.yml                  # Automated AI benchmark eval regression suite
├── backend/
│   ├── alembic/                      # Database migrations
│   │   ├── versions/
│   │   └── env.py
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── endpoints/
│   │   │       │   ├── companies.py  # Company CRUD & search
│   │   │       │   ├── research.py   # Research job initiation & SSE progress
│   │   │       │   ├── evidence.py   # Extracted facts & source inspector
│   │   │       │   ├── analysis.py   # Strategic thesis, moat, bull/bear
│   │   │       │   ├── memo.py       # Investment memo generation & export
│   │   │       │   └── health.py     # System & DB health checks
│   │   │       └── router.py         # Consolidated v1 API router
│   │   ├── core/
│   │   │   ├── config.py             # Pydantic-settings configuration (Gemini models, dimensions)
│   │   │   ├── database.py           # Async SQLAlchemy engine & session factory
│   │   │   ├── security.py           # SSRF validator, API key verification, rate limiter
│   │   │   └── logging.py            # Structured JSON logger & OpenTelemetry setup
│   │   ├── models/                   # SQLAlchemy ORM models
│   │   │   ├── company.py
│   │   │   ├── founder.py
│   │   │   ├── funding.py
│   │   │   ├── research.py           # ResearchRun, ResearchSource
│   │   │   ├── evidence.py           # EvidenceChunk (pgvector)
│   │   │   ├── fact.py               # StructuredFact (Epistemic tags)
│   │   │   └── analysis.py           # AnalysisReport, InvestmentMemo
│   │   ├── schemas/                  # Pydantic v2 validation schemas
│   │   │   ├── company.py
│   │   │   ├── research.py
│   │   │   ├── fact.py
│   │   │   ├── analysis.py
│   │   │   └── memo.py
│   │   ├── services/
│   │   │   ├── search/               # Pluggable search providers (Tavily, Mock)
│   │   │   ├── crawler/              # Trafilatura + httpx async safe crawler
│   │   │   ├── embedding/            # Gemini Embedding 2 configurable wrapper
│   │   │   ├── extraction/           # Gemini 3.7 Flash fact extraction
│   │   │   ├── verification/         # Epistemic classifier & quote verifier
│   │   │   ├── calculation/          # Deterministic math engine (CAGR, runway)
│   │   │   ├── synthesis/            # Gemini 3.7 Flash (with thinking budget) strategic reasoning
│   │   │   └── export/               # Markdown and PDF memo compiler
│   │   ├── pipeline/
│   │   │   └── orchestrator.py       # End-to-end async research orchestrator
│   │   └── main.py                   # FastAPI application factory
│   ├── tests/
│   │   ├── unit/                     # Unit tests for scraper, calculation, schemas
│   │   ├── integration/              # API & DB integration tests
│   │   └── evals/                    # AI quality benchmark suite
│   ├── alembic.ini
│   ├── pyproject.toml                # Dependency specification
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx            # Theme provider, font setup, navigation
│   │   │   ├── page.tsx              # Home terminal dashboard & watchlist
│   │   │   ├── companies/
│   │   │   │   ├── page.tsx          # Company search & directory
│   │   │   │   └── [slug]/
│   │   │   │       ├── page.tsx      # Comprehensive company intelligence view
│   │   │   │       └── memo/page.tsx # Fullscreen investment memo view
│   │   │   └── compare/
│   │   │       └── page.tsx          # Multi-company comparison matrix
│   │   ├── components/
│   │   │   ├── terminal/             # Command bar, Epistemic badges, Citation drawer
│   │   │   ├── charts/               # Recharts funding timeline, radar, multiples
│   │   │   ├── memo/                 # Memo reader, PDF exporter
│   │   │   └── ui/                   # shadcn/ui accessible primitives
│   │   ├── lib/
│   │   │   ├── api.ts                # Type-safe API client
│   │   │   └── utils.ts              # Financial formatting, date formatters
│   │   └── types/                    # Shared TypeScript interfaces
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── Dockerfile
├── docs/
│   ├── ARCHITECTURE.md               # System topology & tradeoff matrix
│   ├── ARCHITECTURE_DECISIONS.md     # ADRs (ADR-001 to ADR-008)
│   ├── AI_PIPELINE.md                # Research, extraction & synthesis pipeline
│   ├── DATABASE.md                   # Relational schema, DDL & pgvector config
│   ├── API_DESIGN.md                 # OpenAPI 3.1 REST specification
│   ├── EVALUATION.md                 # Benchmark dataset & measurement methodology
│   ├── SECURITY.md                   # Threat model, SSRF & injection defenses
│   └── FRONTEND_DESIGN.md            # Terminal UI design tokens & component tree
├── scripts/
│   ├── seed_data.py                  # Seed script with demo companies & facts
│   └── run_evals.py                  # Standalone benchmark evaluation CLI
├── docker-compose.yml                # Full-stack local orchestration
├── .gitignore
└── README.md
```

---

## 3. Detailed MVP Core Implementation Sequence

The MVP Core delivers an immediate, functional, verifiable research pipeline:

### Step 1: Project Infrastructure
- Initialize `docker-compose.yml` with PostgreSQL 16 + `pgvector`, FastAPI hot-reloading backend, and Next.js 15 frontend.
- Configure linters (`ruff`, `eslint`, `prettier`), TypeScript config, and Python virtual environment.

### Step 2: PostgreSQL Schema & Alembic Migrations
- Write SQLAlchemy 2.0 async models for `Company`, `Founder`, `FundingRound`, `Investor`, `ResearchRun`, `ResearchSource`, `EvidenceChunk`, `StructuredFact`, and `AnalysisReport`.
- Generate and verify initial Alembic migration.

### Step 3: Company Model & CRUD Endpoints
- Implement `POST /api/v1/companies`, `GET /api/v1/companies`, and `GET /api/v1/companies/{id}`.
- Enforce strict Pydantic v2 schemas and unique slug generation.

### Step 4: Basic Company Research Orchestration
- Build `ResearchOrchestrator` to coordinate intake, search query generation, fetching, extraction, and analysis.

### Step 5: Web Retrieval (Search Discovery + Safe Crawler)
- Implement pluggable `SearchProvider` with `TavilySearchProvider` and offline `MockSearchProvider`.
- Build `httpx` async crawler with pre-flight DNS SSRF validation and `trafilatura` HTML-to-markdown parsing.

### Step 6: Evidence Storage
- Store raw fetched sources in `research_sources` and 400-token text chunks in `evidence_chunks`.

### Step 7: Structured Fact Extraction (Gemini 3.7 Flash)
- Prompt Gemini 3.7 Flash using `response_schema` to extract structured entities (founders, funding, headcount, competitors).
- Bind every fact to a supporting `evidence_chunk_id` and verbatim quote. Mark unsupported claims as uncertain.

### Step 8: Gemini Strategic Analysis (Gemini 3.7 Flash with Extended Thinking)
- Generate core investment thesis pillars, moat rating, bull case, bear case, and key risks using verified facts via Gemini 3.7 Flash with an appropriate thinking budget.

### Step 9: Basic Investment Report UI
- Build Next.js 15 company dossier view displaying the overview, metrics, thesis, and risk cards.

### Step 10: Source Citation Display
- Render source URLs and verbatim quotes alongside each extracted fact, accompanied by epistemic tags (`FACT`, `CALCULATED`, `ASSUMPTION`, `AI_INTERPRETATION`).

### Step 11: Automated Unit & Integration Tests
- Pytest suite covering SSRF defense, HTML parsing, math engine, schema validation, and company API endpoints.

---

## 4. Phase 2 & Phase 3 Roadmap

### Phase 2: Enhanced Intelligence & UX
- **Embeddings & pgvector:** Enable `Gemini Embedding 2` vector embeddings and HNSW indexing for hybrid search.
- **Conflict Resolution:** Date-decay and domain-trust scoring across conflicting news/filings.
- **Citation Inspector Drawer:** Interactive slide-over panel on Next.js to inspect source snippets and audit provenance.
- **Real-Time Progress HUD:** Server-Sent Events (SSE) streaming live research steps to the frontend.
- **Institutional Memo Export:** Formal investment memo generation with Markdown and PDF download.
- **Company Comparison:** Multi-company comparison matrix (`POST /api/v1/companies/compare`).

### Phase 3: Enterprise Evaluation & Advanced Agents
- **AI Quality Benchmark Suite:** Automated testing against the 7-company golden dataset measuring factual accuracy, attribution precision, and unsupported claim rates.
- **Deep Synthesis Evaluation:** Benchmark `Gemini 3.1 Pro Preview` against Gemini 3.7 Flash for deep diligence report generation.
- **Sophisticated Reranking:** Cross-encoder reranking over retrieved chunks for deep multi-document context.
- **Financial Modeling:** Cap table dilution modeling, scenario-based valuation forecasting.
- **Watchlists & Alerts:** Scheduled recurring research updates when companies announce new rounds or leadership changes.
- **OpenTelemetry & Cost Monitoring:** Prometheus/Grafana or CloudWatch dashboards for token and search cost tracking.
