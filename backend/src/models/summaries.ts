import { query } from "./db.js";

export interface SummaryRow {
	id: number;
	note_id: number;
	ai_summary: string;
	created_at: string;
}

export async function createSummary({ note_id, ai_summary }: { note_id: number; ai_summary: string; }): Promise<SummaryRow> {
	const result = await query<SummaryRow>(
		"INSERT INTO summaries (note_id, ai_summary) VALUES ($1, $2) RETURNING id, note_id, ai_summary, created_at",
		[note_id, ai_summary]
	);
	return result.rows[0];
}

export async function getSummaryByNoteId({ note_id }: { note_id: number; }): Promise<SummaryRow | null> {
	const result = await query<SummaryRow>(
		"SELECT id, note_id, ai_summary, created_at FROM summaries WHERE note_id = $1 ORDER BY created_at DESC LIMIT 1",
		[note_id]
	);
	return result.rows[0] || null;
}


