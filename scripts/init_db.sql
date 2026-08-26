-- ============================================================================
-- VentureLens PostgreSQL Initialization Script
-- Executed automatically on fresh container startup via /docker-entrypoint-initdb.d/
-- ============================================================================

-- Enable UUID generation support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector extension for dense vector embeddings
CREATE EXTENSION IF NOT EXISTS "vector";
