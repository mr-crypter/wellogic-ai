import { query } from "./db.js";

export interface NoteAiMetricRow {
    id: number;
    note_id: number;
    user_id: number | null;
    ai_mood_score: number | null;
    ai_productivity_score: number | null;
    sentiment_polarity: string | null;
    sentiment_emotion: string | null;
    sentiment_confidence: number | null;
    tags: string[] | null;
    created_at: string;
}

export async function insertNoteAiMetric({
    note_id,
    user_id,
    ai_mood_score,
    ai_productivity_score,
    sentiment_polarity,
    sentiment_emotion,
    sentiment_confidence,
    tags
}: {
    note_id: number;
    user_id?: number | null;
    ai_mood_score?: number | null;
    ai_productivity_score?: number | null;
    sentiment_polarity?: string | null;
    sentiment_emotion?: string | null;
    sentiment_confidence?: number | null;
    tags?: string[] | null;
}): Promise<NoteAiMetricRow> {
    const result = await query<NoteAiMetricRow>(
        `INSERT INTO note_ai_metrics (note_id, user_id, ai_mood_score, ai_productivity_score, sentiment_polarity, sentiment_emotion, sentiment_confidence, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, note_id, user_id, ai_mood_score, ai_productivity_score, sentiment_polarity, sentiment_emotion, sentiment_confidence, tags, created_at`,
        [note_id, user_id ?? null, ai_mood_score ?? null, ai_productivity_score ?? null, sentiment_polarity ?? null, sentiment_emotion ?? null, sentiment_confidence ?? null, tags ?? null]
    );
    return result.rows[0];
}

export interface DailyAiAveragesRow {
    date: string;
    avg_ai_mood: number | null;
    avg_ai_productivity: number | null;
}

export async function getDailyAiAverages({ days = 7, user_id }: { days?: number; user_id?: number | null }): Promise<DailyAiAveragesRow[]> {
    const result = await query<any>(
        `WITH window AS (
            SELECT generate_series((CURRENT_DATE - ($1::int - 1) * interval '1 day')::date, CURRENT_DATE::date, interval '1 day')::date AS date
        ), day_ai AS (
            SELECT DATE(n.created_at) AS date,
                   AVG(m.ai_mood_score)::numeric(10,2) AS avg_ai_mood,
                   AVG(m.ai_productivity_score)::numeric(10,2) AS avg_ai_productivity
            FROM note_ai_metrics m
            JOIN notes n ON n.id = m.note_id
            WHERE ($2::int IS NULL OR m.user_id = $2::int)
            GROUP BY DATE(n.created_at)
        )
        SELECT w.date,
               COALESCE(da.avg_ai_mood, NULL) AS avg_ai_mood,
               COALESCE(da.avg_ai_productivity, NULL) AS avg_ai_productivity
        FROM window w
        LEFT JOIN day_ai da ON da.date = w.date
        ORDER BY w.date ASC`,
        [days, user_id ?? null]
    );
    return result.rows.map((r: any) => ({
        date: r.date,
        avg_ai_mood: r.avg_ai_mood == null ? null : Number(r.avg_ai_mood),
        avg_ai_productivity: r.avg_ai_productivity == null ? null : Number(r.avg_ai_productivity)
    }));
}


