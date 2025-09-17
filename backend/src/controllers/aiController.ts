import { Request, Response } from "express";
import { generateSummaryWithGemini } from "../services/aiService";

export async function postAiSummary(req: Request, res: Response) {
	try {
		const { content, mood, productivity } = (req.body || {}) as { content?: string; mood?: number; productivity?: number };
		if (!content) return res.status(400).json({ error: "content is required" });
		const summary = await generateSummaryWithGemini({ content, mood, productivity });
		return res.json({ summary });
	} catch (err: any) {
		console.error(err);
		return res.status(500).json({ error: err?.message || "Internal server error" });
	}
}


