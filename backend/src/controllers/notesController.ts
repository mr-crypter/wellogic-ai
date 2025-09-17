import { Response } from "express";
import { createNote, listNotesByDate } from "../models/notes.js";
import { createMood } from "../models/moods.js";
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


