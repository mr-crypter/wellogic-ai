-- Schema for AI Journal

CREATE TABLE IF NOT EXISTS users (
	id SERIAL PRIMARY KEY,
	email TEXT NOT NULL UNIQUE,
	password_hash TEXT NOT NULL,
	nickname TEXT,
	avatar_url TEXT,
	avatar_name TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notes (
	id SERIAL PRIMARY KEY,
	user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
	content TEXT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS moods (
	id SERIAL PRIMARY KEY,
	user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
	mood_score INT NOT NULL CHECK (mood_score BETWEEN 1 AND 10),
	productivity_score INT NOT NULL CHECK (productivity_score BETWEEN 1 AND 10),
	date DATE NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS summaries (
	id SERIAL PRIMARY KEY,
	note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
	ai_summary TEXT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
	id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	token TEXT NOT NULL UNIQUE,
	expires_at TIMESTAMPTZ NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Embeddings for semantic retrieval (RAG)
CREATE TABLE IF NOT EXISTS note_embeddings (
	id SERIAL PRIMARY KEY,
	note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
	user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
	embedding TEXT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_moods_date ON moods(date);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
-- Additional composite indexes for faster joins/filters
CREATE INDEX IF NOT EXISTS idx_notes_user_created_at ON notes(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_moods_user_date ON moods(user_id, date);
CREATE INDEX IF NOT EXISTS idx_summaries_note_created_at ON summaries(note_id, created_at);
CREATE INDEX IF NOT EXISTS idx_note_embeddings_note_id ON note_embeddings(note_id);

-- AI-inferred metrics per note (mood/productivity) and sentiment hints
-- Enable pgvector and add vector column for embeddings
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE note_embeddings ADD COLUMN IF NOT EXISTS embedding_vec vector(768);
-- Backfill existing rows where possible from text column (expects JSON-like '[..]')
DO $$
BEGIN
  BEGIN
    EXECUTE 'UPDATE note_embeddings SET embedding_vec = embedding::vector WHERE embedding_vec IS NULL AND embedding IS NOT NULL';
  EXCEPTION WHEN others THEN
    -- ignore backfill failure
    NULL;
  END;
END$$;
-- Index for ANN (requires ANALYZE after large changes)
CREATE INDEX IF NOT EXISTS note_embeddings_embedding_vec_ivfflat
  ON note_embeddings USING ivfflat (embedding_vec vector_cosine_ops) WITH (lists = 100);

CREATE TABLE IF NOT EXISTS note_ai_metrics (
	id SERIAL PRIMARY KEY,
	note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
	user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
	ai_mood_score INT CHECK (ai_mood_score BETWEEN 1 AND 10),
	ai_productivity_score INT CHECK (ai_productivity_score BETWEEN 1 AND 10),
	sentiment_polarity TEXT,
	sentiment_emotion TEXT,
	sentiment_confidence NUMERIC(5,2),
	tags TEXT[],
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_note_ai_metrics_note_id ON note_ai_metrics(note_id);
CREATE INDEX IF NOT EXISTS idx_note_ai_metrics_user_created ON note_ai_metrics(user_id, created_at);
