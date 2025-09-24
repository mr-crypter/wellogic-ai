import { query } from "./db.js";

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

export interface NoteWithExtras extends NoteRow {
    latest_summary?: string | null;
    latest_mood_score?: number | null;
    latest_productivity_score?: number | null;
    ai_mood_score?: number | null;
    ai_productivity_score?: number | null;
}

export async function listNotesByDate({ date, user_id }: { date: string; user_id?: number | null }): Promise<NoteWithExtras[]> {
    const result = await query<NoteWithExtras>(
        `WITH latest_moods AS (
            SELECT DISTINCT ON (m.user_id, m.date) m.user_id, m.date, m.mood_score, m.productivity_score
            FROM moods m
            WHERE m.date = $1
            ORDER BY m.user_id, m.date, m.id DESC
        ), latest_summaries AS (
            SELECT DISTINCT ON (s.note_id) s.note_id, s.ai_summary, s.created_at
            FROM summaries s
            ORDER BY s.note_id, s.created_at DESC
        ), latest_ai AS (
            SELECT DISTINCT ON (m.note_id) m.note_id, m.ai_mood_score, m.ai_productivity_score, m.created_at
            FROM note_ai_metrics m
            ORDER BY m.note_id, m.created_at DESC
        )
        SELECT n.id, n.content, n.user_id, n.created_at,
               ls.ai_summary as latest_summary,
               lm.mood_score as latest_mood_score,
               lm.productivity_score as latest_productivity_score,
               la.ai_mood_score as ai_mood_score,
               la.ai_productivity_score as ai_productivity_score
        FROM notes n
        LEFT JOIN latest_summaries ls ON ls.note_id = n.id
        LEFT JOIN latest_moods lm ON lm.user_id = n.user_id AND DATE(n.created_at) = lm.date
        LEFT JOIN latest_ai la ON la.note_id = n.id
        WHERE DATE(n.created_at) = $1
          AND ($2::int IS NULL OR n.user_id = $2::int)
        ORDER BY n.created_at DESC`,
        [date, user_id ?? null]
    );
    return result.rows;
}


export async function listRecentNotesByUser({ user_id, days = 5 }: { user_id: number; days?: number }): Promise<NoteRow[]> {
    const result = await query<NoteRow>(
        `SELECT id, content, user_id, created_at
         FROM notes
         WHERE user_id = $1 AND created_at >= NOW() - ($2::int || ' days')::interval
         ORDER BY created_at DESC`,
        [user_id, days]
    );
    return result.rows;
}


export async function updateNoteContent({ id, user_id, content }: { id: number; user_id?: number | null; content: string }): Promise<NoteRow | null> {
    const result = await query<NoteRow>(
        `UPDATE notes
         SET content = $1
         WHERE id = $2 AND ($3::int IS NULL OR user_id = $3::int)
         RETURNING id, content, user_id, created_at`,
        [content, id, user_id ?? null]
    );
    return result.rows[0] ?? null;
}

export async function deleteNoteById({ id, user_id }: { id: number; user_id?: number | null }): Promise<boolean> {
    const result = await query<{ count: string }>(
        `DELETE FROM notes
         WHERE id = $1 AND ($2::int IS NULL OR user_id = $2::int)`,
        [id, user_id ?? null]
    );
    // node-postgres does not return rowCount in SELECT, but on DELETE query object has rowCount; however our wrapper returns rows.
    // Safer: run a second check for existence is overkill; instead rely on query returning metadata via (as any).
    const anyRes: any = result as any;
    return Boolean(anyRes?.rowCount && anyRes.rowCount > 0);
}

