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


