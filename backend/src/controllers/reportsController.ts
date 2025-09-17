import { Request, Response } from "express";
import { listNotesByDate } from "../models/notes";
import { getMoodByDate } from "../models/moods";
import { getSummaryByNoteId } from "../models/summaries";
import { getWeeklyOverview } from "../services/trendService";

export async function getDailyReport(req: Request, res: Response) {
	try {
		const { date } = req.query as { date?: string };
		if (!date) return res.status(400).json({ error: "date query param is required (YYYY-MM-DD)" });
		const notes = await listNotesByDate({ date });
		const mood = await getMoodByDate({ date });
		const items: Array<{ note: any; ai_summary: string | null }> = [];
		for (const note of notes) {
			const summary = await getSummaryByNoteId({ note_id: note.id });
			items.push({ note, ai_summary: summary?.ai_summary || null });
		}
		return res.json({ date, mood, items });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: "Internal server error" });
	}
}

export async function getWeeklyReport(req: Request, res: Response) {
	try {
		const end = (req.query.end as string) || new Date().toISOString().slice(0, 10);
		const trends = await getWeeklyOverview({ endDate: end });
		return res.json({ end, window_days: 7, trends });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: "Internal server error" });
	}
}


