import { query } from "./db";

export interface NoteRow {
    id: number;
    content: string;
    user_id?: number | null;
    created_at: string;
}

export async function createNote({ content, user_id }: { content: string; user_id?: number | null }): Promise<NoteRow> {
	const result = await query<NoteRow>(
        "INSERT INTO notes (content, user_id) VALUES ($1, $2) RETURNING id, content, user_id, created_at",
        [content, user_id ?? null]
	);
	return result.rows[0];
}

export async function listNotesByDate({ date }: { date: string }): Promise<NoteRow[]> {
    const result = await query<NoteRow>(
        "SELECT id, content, user_id, created_at FROM notes WHERE DATE(created_at) = $1 ORDER BY created_at DESC",
        [date]
	);
	return result.rows;
}


