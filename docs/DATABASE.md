# VentureLens — Database Architecture & Schema Specification

**Version:** 2.0.0  
**Status:** Approved Database Specification  
**Author:** Lead Software Architect & Senior AI Engineer  

---

## 1. Database Architecture & Design Principles

VentureLens uses **PostgreSQL 16** with the **`pgvector`** extension as a unified relational and semantic data store.

### Core Database Principles:
1. **Relational Traceability & Auditability:** Every business fact (funding round, founder, competitor) is tied to its originating evidence chunk and research run via strict foreign keys.
2. **Epistemic Classification Column:** All extracted and synthesized fields carry an `epistemic_type` (`FACT`, `CALCULATED`, `ASSUMPTION`, `AI_INTERPRETATION`) and a confidence score (`0.00` to `1.00`).
3. **Configurable & Migratable Vector Embeddings:** The vector embedding column dimension is configurable (default: `768`, customizable to `1536` or `3072` based on the chosen embedding model).
4. **Hybrid Search Indexing:** Combines PostgreSQL full-text search (`tsvector` + GIN index) and dense semantic search (`vector(DIM)` + HNSW index) for high-precision retrieval over research evidence.
5. **Immutability of Sourced Evidence:** `research_sources` and `evidence_chunks` are append-only to preserve a verifiable audit trail for historical investment decisions.

```
                               ┌─────────────────────────┐
                               │        companies        │
                               └────────────┬────────────┘
                                            │ 1:N
        ┌───────────────────┬───────────────┼───────────────┬───────────────────┐
        ▼                   ▼               ▼               ▼                   ▼
┌───────────────┐   ┌───────────────┐ ┌───────────┐ ┌───────────────┐   ┌───────────────┐
│ founders_     │   │ funding_      │ │competi-   │ │ research_     │   │ analysis_     │
│ leadership    │   │ rounds        │ │tors       │ │ runs          │   │ reports       │
└───────┬───────┘   └───────┬───────┘ └─────┬─────┘ └───────┬───────┘   └───────┬───────┘
        │                   │               │               │                   │
        │                   ▼               │               ▼                   │
        │           ┌───────────────┐       │       ┌───────────────┐           │
        │           │ company_      │       │       │ research_     │           │
        │           │ investors     │       │       │ sources       │           │
        │           └───────┬───────┘       │       └───────┬───────┘           │
        │                   ▼               │               │                   │
        │           ┌───────────────┐       │               ▼                   │
        │           │ investors     │       │       ┌───────────────┐           │
        │           └───────────────┘       │       │ evidence_     │           │
        │                                   │       │ chunks (pgvec)│           │
        │                                   │       └───────┬───────┘           │
        │                                   │               │                   │
        └───────────────────┬───────────────┴───────────────┼───────────────────┘
                            ▼                               ▼
                ┌───────────────────────────────────────────────────────┐
                │                   structured_facts                    │
                │   (FACT | CALCULATED | ASSUMPTION | AI_INTERPRETATION)│
                └───────────────────────────┬───────────────────────────┘
                                            ▼
                                ┌───────────────────────┐
                                │   investment_memos    │
                                └───────────────────────┘
```

---

## 2. PostgreSQL DDL Schema

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Enum Types
CREATE TYPE epistemic_type_enum AS ENUM ('FACT', 'CALCULATED', 'ASSUMPTION', 'AI_INTERPRETATION');
CREATE TYPE job_status_enum AS ENUM ('PENDING', 'SEARCHING', 'FETCHING', 'PARSING', 'EXTRACTING', 'VERIFYING', 'SYNTHESIZING', 'COMPLETED', 'FAILED');
CREATE TYPE round_type_enum AS ENUM ('PRE_SEED', 'SEED', 'SERIES_A', 'SERIES_B', 'SERIES_C', 'SERIES_D', 'GROWTH', 'DEBT', 'GRANT', 'UNKNOWN');
CREATE TYPE moat_rating_enum AS ENUM ('NONE', 'WEAK', 'MODERATE', 'STRONG', 'DOMINANT');

-- ============================================================================
-- 1. COMPANIES
-- ============================================================================
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    slug VARCHAR(255) NOT NULL UNIQUE,
    website_url VARCHAR(500),
    domain VARCHAR(255),
    founded_year INTEGER,
    hq_city VARCHAR(100),
    hq_country VARCHAR(100),
    one_liner TEXT,
    description TEXT,
    primary_industry VARCHAR(100),
    sub_industries TEXT[],
    business_model VARCHAR(100), -- B2B, B2C, B2B2C, Marketplace, DevTools, etc.
    stage VARCHAR(50),           -- Seed, Early, Growth, Late, Pre-IPO
    total_funding_usd NUMERIC(18, 2) DEFAULT 0,
    latest_valuation_usd NUMERIC(18, 2),
    headcount_estimate INTEGER,
    github_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    twitter_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_domain ON companies(domain);
CREATE INDEX idx_companies_industry ON companies(primary_industry);

-- ============================================================================
-- 2. FOUNDERS & LEADERSHIP
-- ============================================================================
CREATE TABLE founders_leadership (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    is_founder BOOLEAN NOT NULL DEFAULT TRUE,
    bio TEXT,
    previous_companies TEXT[],
    education TEXT[],
    linkedin_url VARCHAR(500),
    twitter_url VARCHAR(500),
    github_url VARCHAR(500),
    confidence NUMERIC(3, 2) DEFAULT 1.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_founders_company_id ON founders_leadership(company_id);

-- ============================================================================
-- 3. FUNDING ROUNDS & INVESTORS
-- ============================================================================
CREATE TABLE funding_rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    round_type round_type_enum NOT NULL DEFAULT 'UNKNOWN',
    amount_usd NUMERIC(18, 2),
    post_money_valuation_usd NUMERIC(18, 2),
    announced_date DATE,
    lead_investor_names TEXT[],
    participating_investor_names TEXT[],
    source_url VARCHAR(500),
    confidence NUMERIC(3, 2) DEFAULT 1.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_funding_rounds_company ON funding_rounds(company_id);

CREATE TABLE investors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    investor_type VARCHAR(100),
    website_url VARCHAR(500),
    tier VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE company_investors (
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
    lead_investor BOOLEAN DEFAULT FALSE,
    first_round_type round_type_enum,
    PRIMARY KEY (company_id, investor_id)
);

-- ============================================================================
-- 4. COMPETITORS
-- ============================================================================
CREATE TABLE competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    competitor_name VARCHAR(255) NOT NULL,
    competitor_company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    comparison_type VARCHAR(50),
    key_differentiators TEXT,
    relative_strengths TEXT,
    relative_weaknesses TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_competitors_company ON competitors(company_id);

-- ============================================================================
-- 5. RESEARCH RUNS & SOURCES
-- ============================================================================
CREATE TABLE research_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    status job_status_enum NOT NULL DEFAULT 'PENDING',
    progress_percentage INTEGER NOT NULL DEFAULT 0,
    current_step VARCHAR(100),
    search_queries_used TEXT[],
    sources_crawled_count INTEGER DEFAULT 0,
    evidence_chunks_count INTEGER DEFAULT 0,
    facts_extracted_count INTEGER DEFAULT 0,
    error_message TEXT,
    duration_ms INTEGER,
    gemini_token_usage JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_research_runs_company ON research_runs(company_id);

CREATE TABLE research_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    research_run_id UUID NOT NULL REFERENCES research_runs(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    url VARCHAR(1000) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    title VARCHAR(500),
    source_type VARCHAR(100),
    trust_weight NUMERIC(3, 2) NOT NULL DEFAULT 0.70,
    scraped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    http_status_code INTEGER,
    raw_content_length INTEGER,
    cleaned_markdown_snippet TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sources_run ON research_sources(research_run_id);
CREATE INDEX idx_sources_domain ON research_sources(domain);

-- ============================================================================
-- 6. EVIDENCE CHUNKS & VECTOR EMBEDDINGS (pgvector)
-- ============================================================================
-- Note: vector dimension is configurable (default: 768 for gemini-embedding-2)
CREATE TABLE evidence_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    research_source_id UUID NOT NULL REFERENCES research_sources(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    token_count INTEGER NOT NULL,
    embedding vector(768), -- Configurable via Alembic / environment
    embedding_model VARCHAR(100) DEFAULT 'gemini-embedding-2',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_evidence_company ON evidence_chunks(company_id);
CREATE INDEX idx_evidence_source ON evidence_chunks(research_source_id);

-- HNSW Vector Index for fast cosine similarity search
CREATE INDEX idx_evidence_embedding_hnsw ON evidence_chunks 
USING hnsw (embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);

-- Full text search index for hybrid retrieval
ALTER TABLE evidence_chunks ADD COLUMN text_search_vector tsvector 
GENERATED ALWAYS AS (to_tsvector('english', chunk_text)) STORED;
CREATE INDEX idx_evidence_text_search ON evidence_chunks USING gin(text_search_vector);

-- ============================================================================
-- 7. STRUCTURED FACTS & EPISTEMIC CLASSIFICATION
-- ============================================================================
CREATE TABLE structured_facts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    research_run_id UUID REFERENCES research_runs(id) ON DELETE SET NULL,
    category VARCHAR(100) NOT NULL, -- OVERVIEW, FINANCIAL, PRODUCT, LEADERSHIP, MOAT, RISK
    fact_key VARCHAR(100) NOT NULL, -- e.g. "arr_estimate", "tam_usd", "gross_margin"
    fact_value JSONB NOT NULL,
    epistemic_type epistemic_type_enum NOT NULL DEFAULT 'FACT',
    calculation_formula TEXT,       -- Populated if epistemic_type = 'CALCULATED'
    assumption_rationale TEXT,      -- Populated if epistemic_type = 'ASSUMPTION'
    confidence NUMERIC(3, 2) NOT NULL DEFAULT 1.00,
    supporting_evidence_chunk_ids UUID[],
    supporting_quote TEXT,
    is_unsupported BOOLEAN NOT NULL DEFAULT FALSE, -- Flagged if evidence is insufficient
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_facts_company_cat ON structured_facts(company_id, category);
CREATE INDEX idx_facts_epistemic ON structured_facts(epistemic_type);

-- ============================================================================
-- 8. ANALYSIS REPORTS & STRATEGIC REASONING
-- ============================================================================
CREATE TABLE analysis_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    research_run_id UUID REFERENCES research_runs(id) ON DELETE SET NULL,
    investment_thesis JSONB NOT NULL,
    moat_analysis JSONB NOT NULL,
    moat_score moat_rating_enum NOT NULL DEFAULT 'MODERATE',
    bull_case JSONB NOT NULL,
    bear_case JSONB NOT NULL,
    risk_matrix JSONB NOT NULL,
    catalysts JSONB NOT NULL,
    due_diligence_questions JSONB NOT NULL,
    overall_recommendation VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analysis_company ON analysis_reports(company_id);

-- ============================================================================
-- 9. INVESTMENT MEMOS & EXPORT DOCUMENTS
-- ============================================================================
CREATE TABLE investment_memos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    analysis_report_id UUID REFERENCES analysis_reports(id) ON DELETE SET NULL,
    version INTEGER NOT NULL DEFAULT 1,
    title VARCHAR(255) NOT NULL,
    executive_summary TEXT NOT NULL,
    markdown_content TEXT NOT NULL,
    structured_sections JSONB NOT NULL,
    pdf_export_url VARCHAR(500),
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_memos_company ON investment_memos(company_id);
```

---

## 3. Vector Embedding Dimension & Schema Migration Strategy

If the embedding model changes (e.g. switching from 768 dimensions to 1536 or 3072 dimensions):

### Migration Procedure:
1. **Application Configuration:** The embedding dimension is configured via `settings.EMBEDDING_DIMENSION` in `backend/app/core/config.py` rather than hardcoded in Python logic.
2. **Zero-Downtime Migration Pattern:**
   ```sql
   -- 1. Add new versioned vector column
   ALTER TABLE evidence_chunks ADD COLUMN embedding_v2 vector(1536);
   
   -- 2. Build HNSW index on new column
   CREATE INDEX idx_evidence_embedding_v2_hnsw ON evidence_chunks 
   USING hnsw (embedding_v2 vector_cosine_ops) WITH (m = 16, ef_construction = 64);
   
   -- 3. Run background re-embedding worker to populate embedding_v2
   -- 4. Switch application query to read embedding_v2
   -- 5. Drop deprecated embedding column via Alembic migration:
   -- ALTER TABLE evidence_chunks DROP COLUMN embedding;
   ```
3. **Alembic Automation:** Migration scripts in `backend/alembic/versions/` parameterized by environment variables ensure test and production environments migrate reliably.
