// Gemini integration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

export interface GeminiSummaryInput {
	content: string;
	mood?: number;
	productivity?: number;
}

export async function generateSummaryWithGemini({ content, mood, productivity }: GeminiSummaryInput): Promise<string> {
	if (!GEMINI_API_KEY) {
		throw new Error("GEMINI_API_KEY is not set");
	}
	const prompt = [
		"You are an assistant that writes concise daily journal summaries.",
		"Summarize the note in 2-3 sentences, focusing on mood, productivity, and key events.",
		mood != null && productivity != null ? `User-reported mood: ${mood}/10, productivity: ${productivity}/10.` : undefined,
		"Note:",
		content
	].filter(Boolean).join("\n");

	const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

	const body = {
		contents: [
			{
				role: "user",
				parts: [{ text: prompt }]
			}
		]
	};

	const response = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body)
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Gemini error: ${response.status} ${text}`);
	}

	const json = await response.json() as any;
	const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
	return String(text).trim();
}


