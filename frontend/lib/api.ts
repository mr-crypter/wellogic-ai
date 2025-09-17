const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface CreateNoteResponse {
	note: { id: number; content: string; created_at: string };
}

export async function createNote(params: { content: string; mood_score: number; productivity_score: number; date: string; }) {
	const res = await fetch(`${API_BASE}/api/v1/notes`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(params)
	});
	if (!res.ok) throw new Error(`Create note failed: ${res.status}`);
	return (await res.json()) as CreateNoteResponse;
}

export async function getAiSummary(params: { content: string; mood?: number; productivity?: number; }) {
	const res = await fetch(`${API_BASE}/api/ai/summary`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(params)
	});
	if (!res.ok) throw new Error(`AI summary failed: ${res.status}`);
	return (await res.json()) as { summary: string };
}


