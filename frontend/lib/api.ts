const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface CreateNoteResponse {
	note: { id: number; content: string; created_at: string };
}

export async function createNote(params: { content: string; mood_score?: number; productivity_score?: number; date: string; }) {
    const token = typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;
    const res = await fetch(`${API_BASE}/api/v1/notes`, {
		method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
		body: JSON.stringify(params)
	});
	if (!res.ok) throw new Error(`Create note failed: ${res.status}`);
	return (await res.json()) as CreateNoteResponse;
}

export async function getAiSummary(params: { content: string; mood?: number; productivity?: number; }) {
    const token = typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;
    const res = await fetch(`${API_BASE}/api/ai/summary`, {
		method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
		body: JSON.stringify(params)
	});
	if (!res.ok) throw new Error(`AI summary failed: ${res.status}`);
	return (await res.json()) as { summary: string };
}

// Auth API
export async function apiLogin(params: { email: string; password: string }) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  return (await res.json()) as { token: string; user: any };
}

export async function apiSignup(params: { email: string; password: string; nickname?: string; avatar_url?: string; avatar_name?: string }) {
  const res = await fetch(`${API_BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`Signup failed: ${res.status}`);
  return (await res.json()) as { token: string; user: any };
}

// Notes API
export interface BackendNote {
  id: number;
  content: string;
  user_id?: number | null;
  created_at: string;
  latest_summary?: string | null;
  latest_mood_score?: number | null;
  latest_productivity_score?: number | null;
}

export async function getNotesByDate(date: string): Promise<{ notes: BackendNote[] }> {
  const token = typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;
  const res = await fetch(`${API_BASE}/api/v1/notes?date=${encodeURIComponent(date)}`, {
    method: "GET",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error(`Get notes failed: ${res.status}`);
  return (await res.json()) as { notes: BackendNote[] };
}


