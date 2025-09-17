// Gemini integration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const GEMINI_EMBED_MODEL = process.env.GEMINI_EMBED_MODEL || "text-embedding-004";

export interface GeminiSummaryInput {
	content: string;
	mood?: number;
	productivity?: number;
}

export async function generateSummaryWithGemini({ content, mood, productivity }: GeminiSummaryInput): Promise<string> {
	if (!GEMINI_API_KEY) {
		throw new Error("GEMINI_API_KEY is not set");
	}
    const retrievedContext = ""; // TODO: add semantic retrieval context
    const prompt = [
        "You are an AI journaling assistant that summarizes and interprets daily journal entries.",
        "Write a reflective summary (2–4 sentences) that captures:",
        "- The user's overall mood and productivity, inferred from the tone and content of the writing (not only explicit scores).",
        "- Key events or activities described in the entry.",
        "- Any emerging trends or patterns compared to previous entries.",
        "",
        "Context: Here are the most relevant past notes (retrieved via semantic search):",
        retrievedContext || "No past entries available.",
        "",
        "Today's entry:",
        content,
        mood != null && productivity != null
            ? `User self-reported mood: ${mood}/10, productivity: ${productivity}/10. (Use as context only; still infer your own ratings.)`
            : "No explicit mood/productivity rating provided today.",
        "",
        "Instructions:",
        "- Use the past context to detect continuity, changes in emotional tone, or repeated themes.",
        "- If the journal suggests stress, joy, or hidden emotions, gently surface them in the summary.",
        "- Avoid generic rephrasing. Highlight unique details or behavioral patterns.",
        "- Infer mood and productivity on a 1–10 scale from the writing itself.",
        "- End your response with a single line: \"Mood: X/10, Productivity: Y/10\" using your inferred ratings.",
        "- Write in a warm, human tone, as if the journal is reflecting back to the user."
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


