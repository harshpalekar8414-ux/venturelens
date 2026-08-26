# VentureLens — System Architecture Specification

**Version:** 2.1.0  
**Status:** Approved Architecture Specification  
**Author:** Lead Software Architect & Senior AI Engineer  

---

## 1. Executive Summary & Architectural Vision

**VentureLens** is an enterprise-grade startup research and investment intelligence platform. It systematically transforms unstructured, multi-source web information into structured, source-backed company dossiers, financial estimates, risk matrices, and institutional investment memos.

### Core Architectural Mandate: Traceable Evidence & Epistemic Segregation
VentureLens rejects the ungrounded generative chatbot paradigm. Instead, the platform operates on a strict **evidence-traceability standard**:

> **Core Traceability Requirement:**
> *"Every externally sourced factual claim must be traceable to an evidence record. Claims without sufficient supporting evidence must be explicitly marked unsupported/uncertain or excluded from factual output."*

To enforce this, all data points adhere to a **four-tier epistemic classification**:
1. **Retrieved Facts (`FACT`):** Verifiable data points extracted directly from crawled web sources, SEC filings, press releases, or official company domains, each linked to exact text snippets, source URLs, and timestamps.
2. **Calculated Metrics (`CALCULATED`):** Deterministic values computed by software algorithms (e.g., CAGR, valuation step-up multiples, headcount growth rates) using verified facts as inputs.
3. **Assumptions (`ASSUMPTION`):** Explicitly declared modeling parameters or baseline estimates applied when empirical data is missing (e.g., industry-standard SaaS gross margin benchmarks), flagged with clear warning tags.
4. **AI Interpretation (`AI_INTERPRETATION`):** Synthesized strategic intelligence (e.g., competitive moat analysis, bull/bear cases, risk vectors) produced by Gemini models strictly grounded in tiers 1–3.

```
       ┌─────────────────────────────────────────────────────────────┐
       │                        VentureLens                          │
       │           Investment Intelligence Architecture              │
       └─────────────────────────────────────────────────────────────┘
                                      │
         ┌────────────────────────────┴────────────────────────────┐
         ▼                                                         ▼
┌──────────────────┐                                     ┌──────────────────┐
│  Tier 1: FACTS   │◄── Grounded Web Search & Crawling   │  Tier 2: CALCS   │◄── Deterministic
│  Source-linked   │                                     │  CAGR, Runway    │    Math Engine
└────────┬─────────┘                                     └────────┬─────────┘
         │                                                        │
         └────────────────────────────┬───────────────────────────┘
                                      ▼
                        ┌───────────────────────────┐
                        │   Tier 3: ASSUMPTIONS     │◄── Explicit Default
                        │   Industry Benchmarks     │    Parameters
                        └─────────────┬─────────────┘
                                      ▼
                        ┌───────────────────────────┐
                        │ Tier 4: AI INTERPRETATION │◄── Gemini Reasoning
                        │ Thesis, Moat, Bull/Bear   │    (Strict Evidence Grounding)
                        └───────────────────────────┘
```

---

## 2. System Architecture Topology (Modular Monolith)

To ensure rapid iteration, low operational complexity, transactional integrity, and maintainability for the MVP without premature microservice overhead, VentureLens adopts a **Modular Monolith** architecture.

```
                                  ┌─────────────────────────────┐
                                  │      Client Layer           │
                                  │   Next.js 15 (App Router)   │
                                  │   TypeScript / Tailwind CSS │
                                  │   Terminal-Grade Dashboard  │
                                  └──────────────┬──────────────┘
                                                 │ HTTP / REST / SSE
                                                 ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│                              FastAPI Application Monolith                                    │
│                                                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌────────────────────────────────────┐  │
│  │   API & Routing      │  │  Auth & Rate Limiter │  │   Orchestration & Background Jobs  │  │
│  │   /api/v1/*          │  │  API Keys / Limits   │  │   Async Tasks / Workers            │  │
│  └──────────┬───────────┘  └──────────┬───────────┘  └─────────────────┬──────────────────┘  │
│             │                         │                                │                     │
│  ┌──────────▼─────────────────────────▼────────────────────────────────▼──────────────────┐  │
│  │                                Domain Modules & Services                               │  │
│  │                                                                                        │  │
│  │  ┌────────────────────┐  ┌────────────────────┐  ┌──────────────────────────────────┐  │  │
│  │  │ Search & Discovery │  │ Fetch & Parser     │  │ Fact Verification Engine         │  │  │
│  │  │ Multi-provider API │  │ Trafilatura / Clean│  │ Epistemic Classifier             │  │  │
│  │  └─────────┬──────────┘  └─────────┬──────────┘  └────────────────┬─────────────────┘  │  │
│  │            │                       │                              │                    │  │
│  │  ┌─────────▼───────────────────────▼──────────────────────────────▼─────────────────┐  │  │
│  │  │ AI Reasoning & Synthesis Service (Google Gemini API: 3.7 Flash Default)          │  │  │
│  │  │ Fact Extraction • Thesis • Moat • Bull/Bear • Investment Memo Compiler           │  │  │
│  │  └─────────────────────────────────┬────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────┼───────────────────────────────────────────────────┘  │
└───────────────────────────────────────┼──────────────────────────────────────────────────────┘
                                        │
             ┌──────────────────────────┴──────────────────────────┐
             ▼                                                     ▼
┌───────────────────────────────┐               ┌──────────────────────────────────────┐
│      External Services        │               │         Persistence Layer            │
│  • Google Gemini API          │               │  PostgreSQL 16 + pgvector            │
│  • Search API (Tavily/Plugg.) │               │  • Structured Relational Entities    │
│  • Target Web Content         │               │  • Evidence Chunks & Vector Store    │
└───────────────────────────────┘               └──────────────────────────────────────┘
```

### Domain Module Isolation
Each module inside the FastAPI backend is decoupled via clean interfaces and Pydantic schemas:
- **`company`**: Company metadata, founders, funding rounds, capitalization table, competitors.
- **`search`**: Pluggable search discovery provider interface (`SearchProvider`) supporting Tavily, SerpAPI, Brave Search, or Mock fallbacks.
- **`crawler`**: Safe fetching (`httpx`), SSRF validation, HTML boilerplate stripping (`trafilatura`), and content normalization.
- **`extraction`**: Schema-constrained Pydantic entity extraction with mandatory evidence-binding via **Gemini 3.7 Flash**.
- **`verification`**: Epistemic classification, claim-to-chunk quote cross-validation, and contradiction detection.
- **`analysis`**: Strategic investment thesis generation, moat scoring, risk vector mapping, bull/bear modeling via **Gemini 3.7 Flash** with extended thinking (and optional future evaluation of **Gemini 3.1 Pro Preview**).
- **`memo`**: Institutional-grade investment memo compilation, PDF/Markdown export formatting.

---

## 3. Technology Stack Evaluation & Tradeoff Matrix

| Layer | Chosen Technology | Alternatives Considered | Tradeoff Analysis & Justification |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 15 (App Router, React 19, TypeScript)** | Vite + React SPA, Remix, SvelteKit | **Chosen:** Server-side rendering for fast initial dashboard load, streaming SSR for long-running AI operations (via Server-Sent Events / streaming components), top-tier TypeScript DX, and rich ecosystem for financial data visualization. |
| **Frontend UI & Styling** | **Tailwind CSS + shadcn/ui + Lucide Icons** | MUI, Ant Design, Vanilla CSS | **Chosen:** High-density, customizable "terminal-grade" design tokens; zero runtime CSS overhead; easily themeable (dark/light terminal mode); accessible headless primitives. |
| **Data Visualization** | **Recharts** | Chart.js, D3.js, Highcharts | **Chosen:** Declarative React integration, performant for cap tables, funding timelines, growth metrics, and competitor radar charts with small bundle size. |
| **Backend Framework** | **Python 3.11+ / FastAPI** | Node.js/Express, Go/Gin, Django | **Chosen:** FastAPI provides native async execution, automatic OpenAPI schema generation, strict Pydantic v2 validation, and native integration with the Python AI/ML ecosystem (`google-genai`, NumPy, pandas). |
| **Relational & Vector DB** | **PostgreSQL 16 + pgvector** | Separate Postgres + Pinecone/Qdrant | **Chosen:** Single database engine reduces operational overhead; provides ACID transactional consistency across relational business entities and semantic vector chunks; enables hybrid SQL + Vector search in a single query. |
| **ORM / Migration** | **SQLAlchemy 2.0 (AsyncIO) + Alembic** | Tortoise-ORM, Prisma Python, SQLModel | **Chosen:** SQLAlchemy 2.0 is the enterprise standard for asynchronous Python ORM with unmatched query optimization, type safety, and migration reliability with Alembic. |
| **AI Models & SDK** | **Google Gemini API (`google-genai` SDK)**<br>• **Gemini 3.7 Flash** (Default for both extraction & strategic synthesis with configurable thinking level)<br>• **Gemini Embedding 2** (Configurable semantic embeddings)<br>• *(Optional Future Evaluation)* **Gemini 3.1 Pro Preview** (Deep synthesis benchmark evaluation) | OpenAI GPT-4o, Anthropic Claude 3.7 Sonnet, Local Llama 3 | **Chosen:** Gemini 3.7 Flash serves as the unified, highly capable engine for both fast structured extraction and deep synthesis using adjustable thinking budgets. This avoids hard dependencies on preview models for the MVP while maintaining top-tier reasoning. Gemini 3.1 Pro Preview is retained as an optional future evaluation candidate. Gemini Embedding 2 provides multi-modal dense representations. |
| **Search Provider Interface** | **Pluggable `SearchProvider` (Tavily default, Mock fallback)** | Hardcoded SerpAPI, Google CSE | **Chosen:** Clean abstraction layer decouples search execution from provider implementation, allowing zero-code provider swaps and offline local testing. |
| **Container & CI/CD** | **Docker Compose + GitHub Actions** | Kubernetes, Nomad | **Chosen:** Minimal dev-to-prod friction; complete local reproducibility of full stack (FastAPI + Next.js + Postgres/pgvector); lightweight CI testing and linting pipelines. |

---

## 4. End-to-End Data Flow

```
[User Input: "PostHog"]
       │
       ▼
1. Company Intake & Search Discovery
   • Query expansion formulated into 6 targeted research vectors
   • Pluggable SearchProvider executes queries across authoritative domains
       │
       ▼
2. Safe Fetching & Content Normalization
   • Async HTTP fetching with pre-flight DNS SSRF validation
   • Strips boilerplate via Trafilatura into clean markdown
       │
       ▼
3. Evidence Storage & Semantic Indexing
   • Stores raw source snapshots and chunks in PostgreSQL
   • Generates configurable embeddings (Gemini Embedding 2) into pgvector
       │
       ▼
4. Structured Fact Extraction (Gemini 3.7 Flash)
   • Extracts structured entities with mandatory `evidence_chunk_id` binding
   • Claims without supporting evidence are flagged as uncertain or excluded
       │
       ▼
5. Fact Verification & Epistemic Classification
   • Verifies claims against source chunks (verbatim quote / NLI entailment check)
   • Segregates into FACT, CALCULATED, ASSUMPTION, AI_INTERPRETATION
       │
       ▼
6. Deep Strategic Synthesis (Gemini 3.7 Flash with Extended Thinking)
   • Constructs Thesis, Moat (Network effects, IP, switching costs), Bull/Bear cases
   • Generates Diligence Questions & Risk Matrix grounded in verified facts
       │
       ▼
7. Real-Time Streaming & Client Delivery
   • Pushes progress via Server-Sent Events (SSE) to Next.js dashboard
   • Interactive Citation Inspector allows clicking any claim to inspect source snippet
```

---

## 5. Infrastructure & Deployment Topology

### Local Development Environment
- Fully containerized via `docker-compose.yml`:
  - `postgres`: PostgreSQL 16 + `pgvector` extension exposed on port 5432.
  - `backend`: FastAPI server running with hot-reload on port 8000.
  - `frontend`: Next.js development server running on port 3000.
