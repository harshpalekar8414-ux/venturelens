# VentureLens — Architecture Decision Records (ADRs)

**Version:** 2.1.0  
**Status:** Approved Architecture Decisions  
**Author:** Lead Software Architect & Senior AI Engineer  

---

## Index of Architectural Decisions

- [ADR-001: Modular Monolith Architecture over Microservices](#adr-001-modular-monolith-architecture-over-microservices)
- [ADR-002: Next.js 15 + FastAPI Technology Stack](#adr-002-nextjs-15--fastapi-technology-stack)
- [ADR-003: PostgreSQL 16 with pgvector for Unified Persistence](#adr-003-postgresql-16-with-pgvector-for-unified-persistence)
- [ADR-004: Unified Gemini 3.7 Flash Model Strategy with Gemini Embedding 2](#adr-004-unified-gemini-37-flash-model-strategy-with-gemini-embedding-2)
- [ADR-005: Pluggable Search Provider Abstraction Layer](#adr-005-pluggable-search-provider-abstraction-layer)
- [ADR-006: Four-Tier Epistemic Classification & Traceability Standard](#adr-006-four-tier-epistemic-classification--traceability-standard)
- [ADR-007: Three-Phase Incremental Delivery (MVP Core, Phase 2, Phase 3)](#adr-007-three-phase-incremental-delivery-mvp-core-phase-2-phase-3)
- [ADR-008: Configurable Vector Embedding Dimensions & Migration Strategy](#adr-008-configurable-vector-embedding-dimensions--migration-strategy)

---

### ADR-001: Modular Monolith Architecture over Microservices

- **Status:** Accepted
- **Context:** VentureLens requires high-throughput web scraping, vector search, structured fact extraction, AI synthesis, and report generation. Building separate microservices (e.g., crawler service, LLM service, API service, storage service) introduces significant deployment complexity, network serialization latency, and transactional inconsistency.
- **Decision:** Build VentureLens as a **Modular Monolith** inside a single FastAPI backend with strictly isolated domain modules (`company`, `search`, `crawler`, `extraction`, `verification`, `synthesis`, `memo`).
- **Alternatives Considered:**
  - *Microservices with gRPC / RabbitMQ:* Rejected due to excessive operational overhead for an MVP team, distributed tracing complexity, and premature optimization.
  - *Serverless Functions (AWS Lambda / Vercel Functions):* Rejected due to cold starts on heavy Python libraries (Pydantic, SQLAlchemy, Trafilatura) and 15-minute execution timeouts during deep web research.
- **Known Tradeoffs:** Background jobs run within the backend process for the MVP, requiring careful memory management during large web crawls.
- **Revisit Triggers:** Background crawling volume exceeds single-server CPU/memory saturation, requiring dedicated worker nodes (Celery/Temporal).

---

### ADR-002: Next.js 15 + FastAPI Technology Stack

- **Status:** Accepted
- **Context:** We require an institutional-grade financial research terminal frontend with real-time streaming progress, paired with a high-performance asynchronous backend capable of direct integration with Python AI/ML libraries.
- **Decision:** Adopt **Next.js 15 (App Router, TypeScript, Tailwind CSS, Recharts)** for the frontend and **Python 3.11+ / FastAPI** for the backend.
- **Alternatives Considered:**
  - *Full-Stack Next.js (Node.js backend):* Rejected because Python is the canonical standard for AI SDKs, data cleaning, and scientific calculation libraries.
  - *Vite + React SPA:* Rejected because Next.js provides native Server-Sent Events (SSE) streaming, server-side pre-rendering for instantaneous dossier loads, and better route grouping.
  - *Django / DRF:* Rejected due to higher synchronous framework overhead and slower native async streaming support compared to FastAPI.
- **Known Tradeoffs:** Requires maintaining a TypeScript frontend and a Python backend codebase, coordinated via OpenAPI contracts.
- **Revisit Triggers:** None expected.

---

### ADR-003: PostgreSQL 16 with pgvector for Unified Persistence

- **Status:** Accepted
- **Context:** The system manages structured relational business data (companies, funding rounds, founders) alongside dense vector embeddings for semantic chunk retrieval.
- **Decision:** Use **PostgreSQL 16 with the `pgvector` extension** to store both relational entities and vector embeddings in a single database instance with HNSW indexing.
- **Alternatives Considered:**
  - *Separate PostgreSQL + Pinecone / Qdrant / Weaviate:* Rejected because running dual databases creates distributed transaction issues (e.g., orphaned chunks when a company is deleted) and doubles hosting costs and maintenance.
- **Known Tradeoffs:** PostgreSQL vector search scaling is bounded by database memory; HNSW indexes require sufficient RAM for optimal cosine distance performance.
- **Revisit Triggers:** Vector chunk index exceeds 10 million embeddings and requires distributed sharding.

---

### ADR-004: Unified Gemini 3.7 Flash Model Strategy with Gemini Embedding 2

- **Status:** Accepted
- **Context:** Fact extraction requires ultra-low latency and rigid schema compliance, while strategic synthesis requires deep reasoning and investment thesis formulation. We need a robust model strategy for the MVP that avoids hard dependencies on preview APIs while preserving top-tier reasoning.
- **Decision:** Use **Gemini 3.7 Flash** as the default model for **both** structured extraction and strategic synthesis (using an appropriate thinking budget for the synthesis workload). Use **Gemini Embedding 2** for dense semantic vector embeddings. Retain **Gemini 3.1 Pro Preview** as an optional candidate to evaluate for deep synthesis during future benchmark phases, but do not make it a hard MVP dependency.
- **Alternatives Considered:**
  - *Mandating Gemini 3.1 Pro Preview for MVP Synthesis:* Rejected because relying on preview model identifiers as a hard dependency introduces availability and pricing volatility for the MVP when Gemini 3.7 Flash with extended thinking is fully capable.
  - *Legacy text-embedding-004:* Rejected as deprecated; replaced with Gemini Embedding 2.
- **Known Tradeoffs:** Thinking budgets on Gemini 3.7 Flash slightly increase synthesis latency (e.g., 5-8s) compared to zero-thinking mode, but deliver institutional-grade reasoning.
- **Revisit Triggers:** General availability of Gemini 3.1 Pro stable releases or unified next-generation frontier models.

---

### ADR-005: Pluggable Search Provider Abstraction Layer

- **Status:** Accepted
- **Context:** The research pipeline relies on search discovery to identify authoritative URLs for a company. Hardcoding a single commercial search provider introduces vendor lock-in and blocks offline local testing.
- **Decision:** Implement a clean `SearchProvider` abstract base class with **TavilySearchProvider** as the primary implementation and **MockSearchProvider** for zero-cost offline local testing and CI test suites.
- **Alternatives Considered:**
  - *Hardcoding Tavily API client:* Rejected due to vendor coupling and lack of offline development support.
  - *Scraping Google directly with Playwright:* Rejected due to CAPTCHA blocking, high latency, and fragility.
- **Known Tradeoffs:** Search provider features must be normalized to a standard `SearchResult` schema.
- **Revisit Triggers:** Future integration of direct SEC EDGAR, Crunchbase, or Google Search Grounding APIs.

---

### ADR-006: Four-Tier Epistemic Classification & Traceability Standard

- **Status:** Accepted
- **Context:** Generative AI systems frequently hallucinate metrics or blur assumptions with verified data. Investment intelligence demands uncompromising provenance.
- **Decision:** Enforce a four-tier classification (`FACT`, `CALCULATED`, `ASSUMPTION`, `AI_INTERPRETATION`) and enforce that every externally sourced fact is bound to an immutable `evidence_chunk_id` with a verified quote. Facts lacking sufficient evidence are flagged as unsupported or excluded.
- **Alternatives Considered:**
  - *Unstructured Free-Text Generation with Inline Citations:* Rejected because citations in raw markdown cannot be deterministically audited, filtered, or joined in SQL.
- **Known Tradeoffs:** Requires a post-extraction verification pass, increasing extraction pipeline latency by 1–2 seconds.
- **Revisit Triggers:** None; this is a core product differentiator.

---

### ADR-007: Three-Phase Incremental Delivery (MVP Core, Phase 2, Phase 3)

- **Status:** Accepted
- **Context:** Attempting to build all advanced features (semantic reranking, watchlists, multi-company radar, enterprise SSO, automated benchmarking) upfront delays achieving a working end-to-end demo.
- **Decision:** Divide implementation into three clear phases:
  - **MVP Core:** Infrastructure, schema, company model, search/crawling, structured fact extraction, basic Gemini analysis, source citation display, and tests.
  - **Phase 2:** Embeddings & pgvector semantic retrieval, conflict resolution, Citation Inspector Drawer, SSE progress streaming, and memo export.
  - **Phase 3:** Advanced benchmark evaluation harness, deep financial models, watchlists, and agent orchestration.
- **Alternatives Considered:**
  - *Big-Bang Release:* Rejected due to high risk of scope creep and delayed feedback.
- **Known Tradeoffs:** MVP Core initially uses lexical keyword and URL-based chunk selection prior to full vector embedding activation in Phase 2.
- **Revisit Triggers:** Phase completion milestones.

---

### ADR-008: Configurable Vector Embedding Dimensions & Migration Strategy

- **Status:** Accepted
- **Context:** Embedding models evolve rapidly. Hardcoding `vector(768)` throughout database DDL and application schemas makes upgrading to newer 1536-dim or 3072-dim models difficult.
- **Decision:** Parameterize embedding dimensions in application configuration (`settings.EMBEDDING_DIMENSION`) and establish a zero-downtime column versioning migration pattern (`embedding_v2`) in Alembic.
- **Alternatives Considered:**
  - *Dynamic untyped vector storage:* Rejected because pgvector requires fixed dimensions to construct HNSW indexes.
- **Known Tradeoffs:** Migrating vector dimensions requires running a background re-embedding pass over stored evidence chunks.
- **Revisit Triggers:** Adoption of new embedding model generations.
