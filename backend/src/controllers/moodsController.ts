import { Request, Response } from "express";
import { createMood, getDailyAverages } from "../models/moods.js";
import { getDailyAiAverages } from "../models/aiMetrics.js";

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
        const rawStr = String(req.query.range ?? "7");
        const match = rawStr.match(/\d+/);
        const parsed = match ? parseInt(match[0], 10) : 7;
        const days = Number.isFinite(parsed) && parsed > 0 ? Math.min(365, parsed) : 7;
        const [human, ai] = await Promise.all([
            getDailyAverages({ days }),
            getDailyAiAverages({ days })
        ]);
        const aiByDate = new Map(ai.map(r => [String(r.date).slice(0,10), r]));
        const merged = human.map(h => {
            const key = String(h.date).slice(0,10);
            const a = aiByDate.get(key);
            return {
                date: h.date,
                avg_mood: h.avg_mood == null ? null : Number(h.avg_mood as any),
                avg_productivity: h.avg_productivity == null ? null : Number(h.avg_productivity as any),
                avg_ai_mood: a?.avg_ai_mood ?? null,
                avg_ai_productivity: a?.avg_ai_productivity ?? null
            };
        });
        return res.json({ range: days, data: merged });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: "Internal server error" });
	}
}


