import { query } from "./db";

export interface NoteRow {
	id: number;
	content: string;
	created_at: string;
}

export async function createNote({ content }: { content: string }): Promise<NoteRow> {
	const result = await query<NoteRow>(
		"INSERT INTO notes (content) VALUES ($1) RETURNING id, content, created_at",
		[content]
	);
	return result.rows[0];
}

export async function listNotesByDate({ date }: { date: string }): Promise<NoteRow[]> {
	const result = await query<NoteRow>(
		"SELECT id, content, created_at FROM notes WHERE DATE(created_at) = $1 ORDER BY created_at DESC",
		[date]
	);
	return result.rows;
}


