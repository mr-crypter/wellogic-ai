import { Request, Response } from "express";
import { createMood, getDailyAverages } from "../models/moods.js";

export async function postMood(req: Request, res: Response) {
	try {
		const { date, mood_score, productivity_score } = (req.body || {}) as {
			date?: string; mood_score?: number; productivity_score?: number;
		};
		if (!date || mood_score == null || productivity_score == null) {
			return res.status(400).json({ error: "date, mood_score, productivity_score are required" });
		}
		const mood = await createMood({ date, mood_score, productivity_score });
		return res.status(201).json({ mood });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: "Internal server error" });
	}
}

export async function getTrends(req: Request, res: Response) {
	try {
		const days = Number((req.query.range as string) || 7);
		const rows = await getDailyAverages({ days });
		return res.json({ range: days, data: rows });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: "Internal server error" });
	}
}


