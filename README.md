# AI Journal

An AI-assisted personal journaling app with a Next.js frontend and a TypeScript/Express + Postgres backend. It helps you capture notes, track mood/productivity, generate AI summaries, and surface trends and weekly reports.

## Key Features
- Journaling
  - Create daily notes with mood/productivity scores
  - AI-generated summaries per entry (Gemini)
  - Semantic embeddings (pgvector) for context and retrieval
- Trends & Analytics
  - Daily averages for mood/productivity
  - Mood trend charts and distribution
  - Writing frequency and streaks (frontend components ready; backend endpoints easy to add)
- Reports & Insights
  - Daily and weekly reports (summaries + AI metrics aggregation)
  - Placeholders for personal insights and growth recommendations (fed by reports)
- Authentication
  - Email/password signup & login
  - Opaque session token stored client-side (`localStorage.jwt_token`)
  - `/api/auth/me` returns current user

## Tech Stack
- Frontend: Next.js 14 (App Router), TypeScript, Tailwind, shadcn/ui, Recharts
- Backend: Node.js, Express, TypeScript
- Database: Postgres (+ pgvector extension)
- AI: Google Gemini (text + embeddings)

## Repository Layout
- `frontend/` Next.js app (App Router)
- `backend/` Express API (TypeScript -> built to `dist/`)
- `backend/db/schema.sql` Database schema (applied on boot)

## Backend Overview
### Architecture
- Express app (`backend/src/index.ts`)
  - Routes (mounted):
    - `/api/v1/notes` (protected)
    - `/api/v1/moods` (protected)
    - `/api/v1/reports` (protected)
    - `/api/ai` (protected)
    - `/api/auth` (public)
- Models: `src/models/*` run SQL via `pg`
- Services: `src/services/*` (Gemini, trends, sentiment)
- Middleware: `src/middleware/auth.ts` validates opaque session tokens

### Database Schema (high-level)
- `users(id, email, password_hash, nickname, avatar_url, avatar_name, created_at)`
- `notes(id, user_id, content, created_at)`
- `moods(id, user_id, date, mood_score, productivity_score, created_at)`
- `summaries(id, note_id, ai_summary, created_at)`
- `sessions(id, user_id, token, expires_at, created_at)`
- `note_embeddings(id, note_id, user_id, embedding(text), embedding_vec(vector(768)), created_at)`
- `note_ai_metrics(id, note_id, user_id, ai_mood_score, ai_productivity_score, sentiment_polarity, sentiment_emotion, sentiment_confidence, tags, created_at)`

The server applies `db/schema.sql` at startup. Ensure pgvector extension is available.

### Notable Endpoints
- Auth
  - `POST /api/auth/signup` → `{ token, user }`
  - `POST /api/auth/login` → `{ token, user }`
  - `GET  /api/auth/me` → current user (requires `Authorization: Bearer <token>`) 
- Notes
  - `POST /api/v1/notes` body `{ content, date(YYYY-MM-DD), mood_score?, productivity_score? }` → `{ note }`
  - `GET  /api/v1/notes?date=YYYY-MM-DD` → `{ notes: [...] }`
- Moods
  - `POST /api/v1/moods` body `{ date, mood_score, productivity_score }` → `{ mood }`
  - `GET  /api/v1/moods/trends?range=7|30|90|365` → `{ range, data: [{ date, avg_mood, avg_productivity }] }`
- Reports
  - `GET /api/v1/reports/daily?date=YYYY-MM-DD` → `{ date, mood, items:[{ note, ai_summary, ai_scores, sentiment, tags }] }`
  - `GET /api/v1/reports/weekly?end=YYYY-MM-DD` → `{ end, window_days: 7, trends:[{ date, avg_mood, avg_productivity, avg_ai_mood?, avg_ai_productivity? }] }`
- AI
  - `POST /api/ai/summary` body `{ content, mood?, productivity? }` → `{ summary }`

### AI Integration (Gemini)
- Summaries: `generateContent` on model `GEMINI_MODEL` (default `gemini-1.5-flash`)
- Embeddings: `embedText` on `GEMINI_EMBED_MODEL` (default `text-embedding-004`)
- The embed call tries `v1`, then `v1beta`; if both fail it returns a zero vector to keep the background pipeline resilient.

## Frontend Overview
### App Routes
- `/` Marketing/landing
- `/auth` Signup & Login (stores opaque session token in `localStorage.jwt_token`)
- `/journal` Compose & list entries
- `/trends` Charts for mood and activity
- `/reports` Weekly/daily reports UI
- `/user` Simple profile view & logout

### Key Components
- Journal
  - `journal-entry-form` (creates note, requests AI summary)
  - `journal-entry-list` (lists notes for selected date)
- Trends
  - `mood-trends-chart` (wired to `/moods/trends` via `getMoodTrends()`)
  - `mood-distribution-chart` (replace mock data by aggregating trends)
  - `writing-frequency-chart` and `writing-streak-chart` (mock → add stats/streaks endpoints)
- Reports
  - `weekly-report`, `monthly-report`, `personal-insights`, `growth-recommendations` (mock → wire to `/reports/weekly` and `/reports/daily`)

### Client API Helpers (`frontend/lib/api.ts`)
- Auth: `apiSignup`, `apiLogin`, `getMe`
- Notes: `createNote`, `getNotesByDate`
- AI: `getAiSummary`
- Trends/Reports: `getMoodTrends`, `getWeeklyReport`, `getDailyReport`

Set `NEXT_PUBLIC_API_URL` to point the frontend at the backend (default: `http://localhost:4000`).

## Getting Started (Local)
### Prerequisites
- Node.js 18+
- Postgres 14+ with `pgvector` extension
- A Google AI Studio API key (Gemini)

### 1) Database
Create a database (e.g., `ai_journal`) and enable pgvector:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```
The backend applies `db/schema.sql` at startup, creating/altering tables and indexes as needed.

### 2) Backend Setup
```bash
cd backend
npm install
```
Create `.env` (example):
```env
# Core
PORT=4000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/ai_journal
DB_SSL=0
CORS_ORIGIN=http://localhost:3000

# Auth (change in production)
JWT_SECRET=replace_me
JWT_ISSUER=ai-journal-backend
JWT_AUDIENCE=ai-journal-frontend

# Gemini
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-1.5-flash
GEMINI_EMBED_MODEL=text-embedding-004

# Logging
LOG_SQL=0
```
Run dev server:
```bash
npm run dev
# Backend listening on http://localhost:4000
```

### 3) Frontend Setup
```bash
cd ../frontend
npm install
```
Create `.env.local` (example):
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```
Run dev server:
```bash
npm run dev
# Next.js on http://localhost:3000
```
Open `http://localhost:3000`.

## Usage Flow
1) Sign up at `/auth` → token saved to `localStorage.jwt_token`
2) Create notes in `/journal` (optionally add mood/productivity)
3) View mood trends in `/trends`
4) Check `/reports` for weekly overview and daily details
5) Manage profile or logout at `/user`

## Environment Variables
### Backend
- `PORT` (default: `4000`)
- `DATABASE_URL` Postgres connection string
- `DB_SSL` set `1` to enable SSL (e.g., for managed providers)
- `CORS_ORIGIN` CSV of allowed origins (default `http://localhost:3000`)
- `JWT_SECRET`, `JWT_ISSUER`, `JWT_AUDIENCE` auth settings
- `GEMINI_API_KEY` Google AI Studio key (required)
- `GEMINI_MODEL` (default `gemini-1.5-flash`)
- `GEMINI_EMBED_MODEL` (default `text-embedding-004`)
- `LOG_SQL` set `1` to log SQL timings

### Frontend
- `NEXT_PUBLIC_API_URL` base URL to the backend (default `http://localhost:4000`)

## Security Notes
- Frontend stores an opaque session token in `localStorage` under `jwt_token`. Treat it as sensitive.
- Backend validates tokens against `sessions` table (no PII embedded in the token).
- Set strong values for `JWT_SECRET` and limit `CORS_ORIGIN` in production.

## Roadmap / TODOs
- Replace remaining mock data in charts and reports
- Add endpoints for writing frequency and streaks (notes/day counts, streak metrics)
- Topic extraction pipeline and tag suggestions
- Pagination and search for notes
- Tests and CI/CD

## Troubleshooting
- Gemini 404 on embeddings: the backend now tries `v1`, then `v1beta`, and falls back to a zero vector. Ensure `GEMINI_API_KEY` is valid and models exist in your account.
- 401s on protected routes: ensure `jwt_token` is present in `localStorage` and sent as `Authorization: Bearer <token>`.
- pgvector: ensure `CREATE EXTENSION vector;` is available in your Postgres.

## License
MIT (update if different).
