import { query } from "../models/db.js";
import { getDailyAiAverages } from "../models/aiMetrics.js";

export interface WeeklyOverviewRow {
	date: string;
	avg_mood: number | null;
	avg_productivity: number | null;
    avg_ai_mood?: number | null;
    avg_ai_productivity?: number | null;
}

export async function getWeeklyOverview({ endDate, user_id }: { endDate: string; user_id?: number | null }): Promise<WeeklyOverviewRow[]> {
    const result = await query<any>(
		`WITH day_window AS (
			SELECT generate_series(($1::date - interval '6 days')::date, $1::date, interval '1 day')::date AS d
		),
		day_moods AS (
			SELECT date,
				AVG(mood_score)::numeric(10,2) AS avg_mood,
				AVG(productivity_score)::numeric(10,2) AS avg_productivity
            FROM moods
			WHERE date BETWEEN ($1::date - interval '6 days')::date AND $1::date
			GROUP BY date
		)
		SELECT w.d AS date,
			COALESCE(dm.avg_mood, NULL) AS avg_mood,
			COALESCE(dm.avg_productivity, NULL) AS avg_productivity
		FROM day_window w
		LEFT JOIN day_moods dm ON dm.date = w.d
		ORDER BY w.d ASC`,
		[endDate]
	);
    const base = result.rows.map((r: any) => ({
        date: r.date,
        avg_mood: r.avg_mood == null ? null : Number(r.avg_mood),
        avg_productivity: r.avg_productivity == null ? null : Number(r.avg_productivity),
        avg_ai_mood: null as number | null,
        avg_ai_productivity: null as number | null
    }));

    // Fetch AI averages for the last 7 days; align by date
    const ai = await getDailyAiAverages({ days: 7, user_id });
    const aiByDate = new Map(ai.map(r => [String(r.date).slice(0,10), r]));
    for (const row of base) {
        const key = String(row.date).slice(0,10);
        const aiRow = aiByDate.get(key);
        if (aiRow) {
            row.avg_ai_mood = aiRow.avg_ai_mood;
            row.avg_ai_productivity = aiRow.avg_ai_productivity;
        }
    }
    return base;
}


