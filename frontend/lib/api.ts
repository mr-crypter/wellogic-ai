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

export async function getAiSuggestions(params: { content: string; mood?: number; productivity?: number; }): Promise<{ suggestions: string[] }> {
  const token = typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;
  const res = await fetch(`${API_BASE}/api/ai/suggestions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error(`AI suggestions failed: ${res.status}`);
  return (await res.json()) as { suggestions: string[] };
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

export async function updateNote(id: number, params: { content: string }): Promise<{ note: BackendNote }> {
  const token = typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;
  const res = await fetch(`${API_BASE}/api/v1/notes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`Update note failed: ${res.status}`);
  return (await res.json()) as { note: BackendNote };
}

export async function deleteNote(id: number): Promise<void> {
  const token = typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;
  const res = await fetch(`${API_BASE}/api/v1/notes/${id}`, {
    method: "DELETE",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error(`Delete note failed: ${res.status}`);
}

// Trends & Reports
export interface MoodTrendPoint {
  date: string;
  avg_mood: number | null;
  avg_productivity: number | null;
  avg_ai_mood?: number | null;
  avg_ai_productivity?: number | null;
}
// (Removed invalid/duplicate code. This block was a fragment of a duplicate getWeeklyReport function and is not needed.)

export async function getMoodTrends(range: string): Promise<{ range: number; data: MoodTrendPoint[] }> {
  const token = typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;
  const res = await fetch(`${API_BASE}/api/v1/moods/trends?range=${encodeURIComponent(range)}`, {
    method: "GET",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error(`Get mood trends failed: ${res.status}`);
  return (await res.json()) as { range: number; data: MoodTrendPoint[] };
}

export async function getNotesStats(range: number): Promise<{ range: number; data: Array<{ date: string; note_count: number; word_count: number }> }>{
  const token = typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;
  const res = await fetch(`${API_BASE}/api/v1/notes/stats?range=${encodeURIComponent(String(range))}` ,{
    method: "GET",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error(`Get notes stats failed: ${res.status}`);
  return await res.json();
}

export async function getNoteStreaks(): Promise<{ current_streak: number; longest_streak: number; recent: Array<{ date: string; has_entry: boolean }> }>{
  const token = typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;
  const res = await fetch(`${API_BASE}/api/v1/notes/streaks`, {
    method: "GET",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error(`Get note streaks failed: ${res.status}`);
  return await res.json();
}

export async function getWeeklyReport(end?: string): Promise<any> {
  const token = typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;
  const url = end ? `${API_BASE}/api/v1/reports/weekly?end=${encodeURIComponent(end)}` : `${API_BASE}/api/v1/reports/weekly`;
  const res = await fetch(url, {
    method: "GET",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error(`Get weekly report failed: ${res.status}`);
  return await res.json();
}

export async function getDailyReport(date: string): Promise<any> {
  const token = typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;
  const res = await fetch(`${API_BASE}/api/v1/reports/daily?date=${encodeURIComponent(date)}`, {
    method: "GET",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error(`Get daily report failed: ${res.status}`);
  return await res.json();
}

export async function getMe(): Promise<{ id: number; email: string; nickname: string|null; avatar_url: string|null; avatar_name: string|null }> {
  const token = typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    method: "GET",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error(`Get me failed: ${res.status}`);
  return await res.json();
}


