-- Schema for AI Journal

CREATE TABLE IF NOT EXISTS notes (
	id SERIAL PRIMARY KEY,
	user_id INTEGER DEFAULT 1,
	content TEXT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS moods (
	id SERIAL PRIMARY KEY,
	user_id INTEGER DEFAULT 1,
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

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_moods_date ON moods(date);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);
