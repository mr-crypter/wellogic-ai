// Gemini integration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const GEMINI_EMBED_MODEL = process.env.GEMINI_EMBED_MODEL || "text-embedding-004";

export interface GeminiSummaryInput {
    content: string;
    mood?: number;
    productivity?: number;
    recentContext?: string; // multi-day context
    sentimentHints?: { polarity?: string; emotion?: string; confidence?: number };
    persona?: string; // optional user profile/preferences to steer tone & focus
}

export async function generateSummaryWithGemini({ content, mood, productivity, recentContext, sentimentHints, persona }: GeminiSummaryInput): Promise<string> {
	if (!GEMINI_API_KEY) {
		throw new Error("GEMINI_API_KEY is not set");
	}
    const retrievedContext = recentContext || "";
    const prompt = [
        "You are an AI journaling assistant that summarizes and interprets daily journal entries.",
        persona ? `User profile & preferences (use to tailor tone and focus):\n${persona}` : undefined,
        "Write a reflective summary (2–4 sentences) that captures:",
        "- The user's overall mood and productivity, inferred from the tone and content of the writing (not only explicit scores).",
        "- Key events or activities described in the entry.",
        "- Any emerging trends or patterns compared to previous entries.",
        "",
        "Context: Here are the most relevant past notes (retrieved via semantic search):",
        retrievedContext || "No past entries available.",
        sentimentHints ? `\nSentiment Analysis (external model):\n${JSON.stringify(sentimentHints, null, 2)}` : undefined,
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

// Generate an embedding vector for text using Gemini embeddings API
export async function embedText({ text }: { text: string }): Promise<number[]> {
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set");
    }
    // Prefer newer v1 endpoint; fall back to v1beta if needed
    const buildUrl = (version: 'v1'|'v1beta') => `https://generativelanguage.googleapis.com/${version}/models/${GEMINI_EMBED_MODEL}:embedText?key=${encodeURIComponent(GEMINI_API_KEY)}`;
    const body = { text } as any;
    async function tryOnce(url: string): Promise<number[] | null> {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            return null;
        }
        const json = await response.json() as any;
        const values: number[] = json?.embedding?.values || json?.embedding?.value || json?.data?.[0]?.embedding || [];
        if (!Array.isArray(values) || values.length === 0) {
            return null;
        }
        return values.map((v: any) => Number(v));
    }
    let vec = await tryOnce(buildUrl('v1'));
    if (!vec) vec = await tryOnce(buildUrl('v1beta'));
    if (!vec) {
        // Last resort: avoid crashing pipeline; return zero-vector of common size 768
        return new Array(768).fill(0);
    }
    return vec;
}

export function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0;
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) {
        const x = a[i];
        const y = b[i];
        dot += x * y;
        na += x * x;
        nb += y * y;
    }
    if (na === 0 || nb === 0) return 0;
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// Extract "Mood: X/10, Productivity: Y/10" from model output
export function parseAiScoresFromText(text: string): { mood?: number; productivity?: number } {
    const m = /Mood:\s*(\d{1,2})\s*\/\s*10/i.exec(text);
    const p = /Productivity:\s*(\d{1,2})\s*\/\s*10/i.exec(text);
    const mood = m ? Math.max(1, Math.min(10, Number(m[1]))) : undefined;
    const productivity = p ? Math.max(1, Math.min(10, Number(p[1]))) : undefined;
    return { mood, productivity };
}

export async function extractMetadataWithGemini({ content, recentContext, persona }: { content: string; recentContext?: string; persona?: string; }): Promise<{ mood?: number | null; productivity?: number | null; tags?: string[] | null; sentiment?: { polarity?: string | null; emotion?: string | null; confidence?: number | null } | null; }> {
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set");
    }
    const prompt = [
        "You are an AI that extracts structured metadata from a personal journal entry.",
        persona ? `User profile & preferences (use for better tagging; do not include in output):\n${persona}` : undefined,
        "Given the entry and recent context, return ONLY valid JSON with this shape:",
        '{"mood": number|null, "productivity": number|null, "tags": string[]|null, "sentiment": {"polarity": string|null, "emotion": string|null, "confidence": number|null}}',
        "Rules:",
        "- mood and productivity are integers 1..10 inferred from writing (null if insufficient evidence)",
        "- tags: 3-8 concise lowercase keywords (e.g., ['work','family','gratitude']) or null",
        "- sentiment: polarity in {positive, neutral, negative} (or null), emotion is a single word (e.g., 'joy','stress'), confidence 0..1",
        "- Output ONLY the JSON, with no prose.",
        "Recent context (may be empty):",
        recentContext || "",
        "Today's entry:",
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
    const text = String(json?.candidates?.[0]?.content?.parts?.[0]?.text || "").trim();
    try {
        const parsed = JSON.parse(text);
        const mood = parsed?.mood == null ? null : Number(parsed.mood);
        const productivity = parsed?.productivity == null ? null : Number(parsed.productivity);
        const tags = Array.isArray(parsed?.tags) ? parsed.tags.map((t: any) => String(t).toLowerCase().trim()).filter(Boolean) : null;
        const sentiment = parsed?.sentiment ? {
            polarity: parsed.sentiment.polarity == null ? null : String(parsed.sentiment.polarity),
            emotion: parsed.sentiment.emotion == null ? null : String(parsed.sentiment.emotion),
            confidence: parsed.sentiment.confidence == null ? null : Number(parsed.sentiment.confidence)
        } : null;
        return { mood, productivity, tags, sentiment };
    } catch {
        // Fallback: best-effort parse using regexes
        const { mood, productivity } = parseAiScoresFromText(text);
        return { mood: mood ?? null, productivity: productivity ?? null, tags: null, sentiment: null };
    }
}

// Simple chunking: split by blank lines into paragraphs, then split long paragraphs into sentences
export function chunkTextSmart(text: string, options?: { maxCharsPerChunk?: number }): string[] {
    const maxChars = options?.maxCharsPerChunk ?? 400;
    const paragraphs = String(text || "").split(/\n\s*\n+/).map(s => s.trim()).filter(Boolean);
    const chunks: string[] = [];
    for (const para of paragraphs) {
        if (para.length <= maxChars) {
            chunks.push(para);
        } else {
            const sentences = para.split(/(?<=[.!?])\s+/);
            let buf = "";
            for (const s of sentences) {
                if ((buf + (buf ? " " : "") + s).length > maxChars) {
                    if (buf) chunks.push(buf);
                    buf = s;
                } else {
                    buf = buf ? `${buf} ${s}` : s;
                }
            }
            if (buf) chunks.push(buf);
        }
    }
    return chunks;
}


