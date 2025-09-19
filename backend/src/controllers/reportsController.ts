import { Request, Response } from "express";
import { listNotesByDate } from "../models/notes.js";
import { getMoodByDate } from "../models/moods.js";
import { getSummaryByNoteId } from "../models/summaries.js";
import { getWeeklyOverview } from "../services/trendService.js";
import { query } from "../models/db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

export async function getDailyReport(req: AuthenticatedRequest, res: Response) {
	try {
		const { date } = req.query as { date?: string };
		if (!date) return res.status(400).json({ error: "date query param is required (YYYY-MM-DD)" });
        const userId = req.user?.id || null;
        const notes = await listNotesByDate({ date, user_id: userId ?? undefined });
        const mood = await getMoodByDate({ date });
        const items: Array<{ note: any; ai_summary: string | null; ai_scores?: { mood?: number|null; productivity?: number|null }; sentiment?: { polarity?: string|null; emotion?: string|null; confidence?: number|null }; tags?: string[]|null; }> = [];
		for (const note of notes) {
			const summary = await getSummaryByNoteId({ note_id: note.id });
            // latest AI metrics per note
            const aiRes = await query<any>(
                `SELECT ai_mood_score, ai_productivity_score, sentiment_polarity, sentiment_emotion, sentiment_confidence, tags
                 FROM note_ai_metrics WHERE note_id = $1 ORDER BY id DESC LIMIT 1`,
                [note.id]
            );
            const ai = aiRes.rows[0] || {};
            items.push({
                note,
                ai_summary: summary?.ai_summary || null,
                ai_scores: { mood: ai.ai_mood_score ?? null, productivity: ai.ai_productivity_score ?? null },
                sentiment: { polarity: ai.sentiment_polarity ?? null, emotion: ai.sentiment_emotion ?? null, confidence: ai.sentiment_confidence == null ? null : Number(ai.sentiment_confidence) },
                tags: ai.tags ?? null
            });
		}
        return res.json({ date, mood, items });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: "Internal server error" });
	}
}

export async function getWeeklyReport(req: AuthenticatedRequest, res: Response) {
	try {
		const end = (req.query.end as string) || new Date().toISOString().slice(0, 10);
        const userId = req.user?.id || null;
        const trends = await getWeeklyOverview({ endDate: end, user_id: userId ?? undefined });
        return res.json({ end, window_days: 7, trends });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: "Internal server error" });
	}
}


