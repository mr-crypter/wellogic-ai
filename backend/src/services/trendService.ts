import { query } from "../models/db.js";

export interface WeeklyOverviewRow {
	date: string;
	avg_mood: number | null;
	avg_productivity: number | null;
}

export async function getWeeklyOverview({ endDate }: { endDate: string }): Promise<WeeklyOverviewRow[]> {
	const result = await query<WeeklyOverviewRow>(
		`WITH window AS (
			SELECT generate_series(($1::date - interval '6 days')::date, $1::date, interval '1 day')::date AS date
		),
		day_moods AS (
			SELECT date,
				AVG(mood_score)::numeric(10,2) AS avg_mood,
				AVG(productivity_score)::numeric(10,2) AS avg_productivity
			FROM moods
			WHERE date BETWEEN ($1::date - interval '6 days')::date AND $1::date
			GROUP BY date
		)
		SELECT w.date,
			COALESCE(dm.avg_mood, NULL) AS avg_mood,
			COALESCE(dm.avg_productivity, NULL) AS avg_productivity
		FROM window w
		LEFT JOIN day_moods dm ON dm.date = w.date
		ORDER BY w.date ASC`,
		[endDate]
	);
	// pg returns numerics as strings; cast to number/null
	return result.rows.map((r: any) => ({
		date: r.date,
		avg_mood: r.avg_mood == null ? null : Number(r.avg_mood),
		avg_productivity: r.avg_productivity == null ? null : Number(r.avg_productivity)
	}));
}


