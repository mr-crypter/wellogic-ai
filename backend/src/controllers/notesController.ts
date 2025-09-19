import { Response } from "express";
import { createNote, listNotesByDate } from "../models/notes.js";
import { createMood } from "../models/moods.js";
import { upsertNoteEmbedding, getRecentNoteEmbeddingsForUser, parseEmbedding, searchNearestByVector } from "../models/embeddings.js";
import { insertNoteAiMetric } from "../models/aiMetrics.js";
import { analyzeSentimentHeuristic } from "../services/sentiment.js";
import { embedText, generateSummaryWithGemini, parseAiScoresFromText, chunkTextSmart, cosineSimilarity } from "../services/aiService.js";
import { listRecentNotesByUser } from "../models/notes.js";
import { createSummary } from "../models/summaries.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
// Removed automatic AI summary generation; summaries can be requested via /api/ai/summary

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

				// Generate summary with Gemini (short, structured prompt) using context + sentiment
				const geminiText = await generateSummaryWithGemini({ content, recentContext, sentimentHints });
				const { mood: ai_mood, productivity: ai_prod } = parseAiScoresFromText(geminiText);

				// Persist in parallel: embedding upsert, AI metrics, and cached summary
				await Promise.all([
					upsertNoteEmbedding({ note_id: note.id, user_id: userId, embedding: noteEmbedding }),
					insertNoteAiMetric({
						note_id: note.id,
						user_id: userId,
						ai_mood_score: ai_mood ?? null,
						ai_productivity_score: ai_prod ?? null,
						sentiment_polarity: sentimentHints.polarity,
						sentiment_emotion: sentimentHints.emotion,
						sentiment_confidence: sentimentHints.confidence,
						tags: null
					}),
					createSummary({ note_id: note.id, ai_summary: geminiText })
				]);
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


