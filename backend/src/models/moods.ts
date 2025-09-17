import { query } from "./db.js";

export interface MoodRow {
	id: number;
	date: string;
	mood_score: number;
	productivity_score: number;
    user_id?: number | null;
	created_at?: string;
}

export async function createMood({ date, mood_score, productivity_score, user_id }: { date: string; mood_score: number; productivity_score: number; user_id?: number | null; }): Promise<MoodRow> {
	const result = await query<MoodRow>(
        "INSERT INTO moods (date, mood_score, productivity_score, user_id) VALUES ($1, $2, $3, $4) RETURNING id, date, mood_score, productivity_score, user_id, created_at",
        [date, mood_score, productivity_score, user_id ?? null]
	);
	return result.rows[0];
}

export async function getMoodByDate({ date }: { date: string }): Promise<MoodRow | null> {
	const result = await query<MoodRow>(
		"SELECT id, date, mood_score, productivity_score FROM moods WHERE date = $1 ORDER BY id DESC LIMIT 1",
		[date]
	);
	return result.rows[0] || null;
}

export interface DailyAverageRow {
	date: string;
	avg_mood: string; // numeric(10,2) returned as string by pg
	avg_productivity: string; // numeric(10,2)
}

export async function getDailyAverages({ days = 7 }: { days?: number }): Promise<DailyAverageRow[]> {
	const result = await query<DailyAverageRow>(
		`SELECT date,
			AVG(mood_score)::numeric(10,2) AS avg_mood,
			AVG(productivity_score)::numeric(10,2) AS avg_productivity
		 FROM moods
		 WHERE date >= (CURRENT_DATE - $1::int)
		 GROUP BY date
		 ORDER BY date ASC`,
		[days]
	);
	return result.rows;
}


