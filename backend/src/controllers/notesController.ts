import { Response } from "express";
import { createNote, listNotesByDate, updateNoteContent, deleteNoteById } from "../models/notes.js";
import { createMood } from "../models/moods.js";
import { upsertNoteEmbedding, getRecentNoteEmbeddingsForUser, parseEmbedding, searchNearestByVector } from "../models/embeddings.js";
import { insertNoteAiMetric } from "../models/aiMetrics.js";
import { analyzeSentimentHeuristic } from "../services/sentiment.js";
import { embedText, generateSummaryWithGemini, parseAiScoresFromText, chunkTextSmart, cosineSimilarity, extractMetadataWithGemini } from "../services/aiService.js";
import { getUserProfile } from "../models/userProfiles.js";
import { listRecentNotesByUser } from "../models/notes.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { query } from "../models/db.js";
// Automatic AI summary storage removed; use /api/ai/suggestions for companion-style actions

export async function postNote(req: AuthenticatedRequest, res: Response) {
	try {
		const { content, mood_score, productivity_score, date } = (req.body || {}) as {
			content?: string; mood_score?: number; productivity_score?: number; date?: string;
		};
		if (!content) return res.status(400).json({ error: "content is required" });
		if (!date) {
			return res.status(400).json({ error: "date is required" });
		}

		const note = await createNote({ content, user_id: req.user?.id || null });

		// Fire-and-forget AI pipeline; do not block user response
		(async () => {
			try {
				const userId = req.user?.id || null;
				if (!userId) return;

				// Precompute lightweight sentiment (local, fast)
				const sentimentHints = analyzeSentimentHeuristic(content);

				// Chunk for context snapshots; use first chunk for embedding
				const chunks = chunkTextSmart(content);
				const mainChunk = chunks[0] || content;

				// Parallelize embedding + fetching recent data
				const [noteEmbedding, recentEmbeds, recentNotes] = await Promise.all([
					embedText({ text: mainChunk }),
					getRecentNoteEmbeddingsForUser({ user_id: userId, days: 5, limitPerDay: 20 }),
					listRecentNotesByUser({ user_id: userId, days: 5 })
				]);


				// Prefer DB-side ANN search when pgvector is available; fallback to in-memory if needed
				let recentContext = "";
				try {
					const dbNearest = await searchNearestByVector({ user_id: userId, queryEmbedding: noteEmbedding, limit: 5 });
					const noteById = new Map(recentNotes.map(n => [n.id, n] as const));
					recentContext = dbNearest.map(s => {
						const other = noteById.get(s.note_id);
						const text = other?.content ?? "";
						const ctxChunk = chunkTextSmart(text)[0] || text;
						return `Note ${s.note_id} (dist=${s.distance.toFixed(2)}): ${ctxChunk}`;
					}).join("\n\n");
				} catch {
					const noteById = new Map(recentNotes.map(n => [n.id, n] as const));
					const scored = recentEmbeds
						.filter(r => r.note_id !== note.id)
						.map(r => ({ row: r, score: cosineSimilarity(noteEmbedding, parseEmbedding(r)) }))
						.sort((a, b) => b.score - a.score)
						.slice(0, 5);
					recentContext = scored.map(s => {
						const other = noteById.get(s.row.note_id);
						const text = other?.content ?? "";
						const ctxChunk = chunkTextSmart(text)[0] || text;
						return `Note ${s.row.note_id} (sim=${s.score.toFixed(2)}): ${ctxChunk}`;
					}).join("\n\n");
				}

                // Load user persona preferences
                const profile = await getUserProfile(userId).catch(() => null);
                const persona = profile?.preferences ? JSON.stringify(profile.preferences, null, 2) : undefined;

                // Generate short analysis text to derive scores (still needed for AI metrics)
                const geminiText = await generateSummaryWithGemini({ content, recentContext, sentimentHints, persona });
                const { mood: ai_mood, productivity: ai_prod } = parseAiScoresFromText(geminiText);

                // Extract structured metadata (tags, sentiment, scores)
                const meta = await extractMetadataWithGemini({ content, recentContext, persona }).catch(() => ({ mood: null, productivity: null, tags: null, sentiment: null }));

				// Persist in parallel: embedding upsert, AI metrics, and cached summary
                await Promise.all([
					upsertNoteEmbedding({ note_id: note.id, user_id: userId, embedding: noteEmbedding }),
                    insertNoteAiMetric({
						note_id: note.id,
						user_id: userId,
                        ai_mood_score: (ai_mood ?? meta.mood) ?? null,
                        ai_productivity_score: (ai_prod ?? meta.productivity) ?? null,
                        sentiment_polarity: meta.sentiment?.polarity ?? sentimentHints.polarity,
                        sentiment_emotion: meta.sentiment?.emotion ?? sentimentHints.emotion,
                        sentiment_confidence: meta.sentiment?.confidence ?? sentimentHints.confidence,
                        tags: meta.tags ?? null
                    })
				]);

                // Auto-create moods row if user omitted scores but AI inferred them
                if ((mood_score == null || productivity_score == null) && (ai_mood != null || ai_prod != null || meta.mood != null || meta.productivity != null)) {
                    const m = (ai_mood ?? meta.mood) ?? null;
                    const p = (ai_prod ?? meta.productivity) ?? null;
                    if (m != null && p != null) {
                        try { await createMood({ date, mood_score: m, productivity_score: p, user_id: userId }); } catch {}
                    }
                }
			} catch (e) {
				console.error("Background AI pipeline error:", e);
			}
		})();
		if (mood_score != null && productivity_score != null) {
			await createMood({ date, mood_score, productivity_score, user_id: req.user?.id || null });
		}

		return res.status(201).json({ note });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: "Internal server error" });
	}
}

export async function getNotes(req: AuthenticatedRequest, res: Response) {
	try {
		const { date } = req.query as { date?: string };
		if (!date) return res.status(400).json({ error: "date query param is required (YYYY-MM-DD)" });
        const notes = await listNotesByDate({ date, user_id: req.user?.id });
		return res.json({ notes });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: "Internal server error" });
	}
}

// Stats: notes/day and word counts for range days back
export async function getNoteStats(req: AuthenticatedRequest, res: Response) {
    try {
        const range = Math.max(1, Math.min(365, Number((req.query.range as string) || 7)));
        const userId = req.user?.id;
        const rows = await query<any>(
            `WITH days AS (
                SELECT generate_series((CURRENT_DATE - ($1::int - 1) * interval '1 day')::date, CURRENT_DATE::date, interval '1 day')::date AS d
            )
            SELECT d.d AS date,
                   COALESCE(cnt.note_count, 0) AS note_count,
                   COALESCE(cnt.word_count, 0) AS word_count
            FROM days d
            LEFT JOIN (
              SELECT DATE(created_at) AS day,
                     COUNT(*) AS note_count,
                     SUM(length(content)) AS word_count
              FROM notes
              WHERE ($2::int IS NULL OR user_id = $2::int)
                AND created_at >= CURRENT_DATE - $1::int
              GROUP BY DATE(created_at)
            ) cnt ON cnt.day = d.d
            ORDER BY d.d ASC`,
            [range, userId ?? null]
        );
        return res.json({ range, data: rows.rows });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Streaks: current, longest, recent days
export async function getNoteStreaks(req: AuthenticatedRequest, res: Response) {
    try {
        const userId = req.user?.id;
        const recentDays = 30;
        const rows = await query<any>(
            `WITH days AS (
                SELECT generate_series((CURRENT_DATE - $1::int + 1)::date, CURRENT_DATE::date, interval '1 day')::date AS d
            ), entries AS (
                SELECT DATE(created_at) AS day, COUNT(*) AS c
                FROM notes
                WHERE ($2::int IS NULL OR user_id = $2::int)
                GROUP BY DATE(created_at)
            )
            SELECT d.d AS date, (e.c IS NOT NULL) AS has_entry
            FROM days d
            LEFT JOIN entries e ON e.day = d.d
            ORDER BY d.d ASC`,
            [recentDays, userId ?? null]
        );

        // compute current and longest streaks
        const flags = rows.rows.map((r: any) => Boolean(r.has_entry));
        let current = 0, longest = 0, run = 0;
        for (let i = 0; i < flags.length; i++) {
            if (flags[i]) { run++; longest = Math.max(longest, run); } else { run = 0; }
        }
        // current streak counts from newest backwards
        for (let i = flags.length - 1; i >= 0 && flags[i]; i--) current++;

        return res.json({ current_streak: current, longest_streak: longest, recent: rows.rows });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}


export async function updateNote(req: AuthenticatedRequest, res: Response) {
    try {
        const id = Number((req.params as any).id);
        const { content } = (req.body || {}) as { content?: string };
        if (!id || !Number.isFinite(id)) return res.status(400).json({ error: "invalid id" });
        if (!content) return res.status(400).json({ error: "content is required" });
        const updated = await updateNoteContent({ id, user_id: req.user?.id, content });
        if (!updated) return res.status(404).json({ error: "note not found" });
        return res.json({ note: updated });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function deleteNote(req: AuthenticatedRequest, res: Response) {
    try {
        const id = Number((req.params as any).id);
        if (!id || !Number.isFinite(id)) return res.status(400).json({ error: "invalid id" });
        const ok = await deleteNoteById({ id, user_id: req.user?.id });
        if (!ok) return res.status(404).json({ error: "note not found" });
        return res.status(204).send();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

