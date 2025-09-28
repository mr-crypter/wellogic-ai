import { Request, Response } from "express";
import { generateSummaryWithGemini, generateSuggestionsWithGemini } from "../services/aiService.js";

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

export async function postAiSuggestions(req: Request, res: Response) {
    try {
        const { content, mood, productivity, recentContext, persona } = (req.body || {}) as { content?: string; mood?: number; productivity?: number; recentContext?: string; persona?: string };
        if (!content) return res.status(400).json({ error: "content is required" });
        const suggestions = await generateSuggestionsWithGemini({ content, mood, productivity, recentContext, persona });
        const hasReflection = suggestions.length > 1;
        const reflection = hasReflection ? String(suggestions[0]) : "";
        const items = hasReflection ? suggestions.slice(1) : suggestions;
        const messages = [
            ...(reflection ? [{ role: "assistant", type: "reflection", text: reflection }] : []),
            ...items.map((t) => ({ role: "assistant", type: "suggestion", text: t }))
        ];
        return res.json({ suggestions: items, messages });
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ error: err?.message || "Internal server error" });
    }
}


