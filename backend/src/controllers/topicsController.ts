import { Response } from "express";
import { query } from "../models/db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

export async function getTopics(req: AuthenticatedRequest, res: Response) {
    try {
        const range = Math.max(1, Math.min(365, Number((req.query.range as string) || 30)));
        const userId = req.user?.id;

        // topics from tags array
        const topicsRes = await query<any>(
            `WITH recent AS (
                SELECT m.tags
                FROM note_ai_metrics m
                JOIN notes n ON n.id = m.note_id
                WHERE n.created_at >= CURRENT_DATE - $1::int
                  AND ($2::int IS NULL OR m.user_id = $2::int)
            )
            SELECT lower(trim(t)) AS topic, COUNT(*) AS count
            FROM recent r, unnest(r.tags) AS t
            WHERE t IS NOT NULL AND length(trim(t)) > 0
            GROUP BY lower(trim(t))
            ORDER BY count DESC
            LIMIT 25`,
            [range, userId ?? null]
        );

        const total = topicsRes.rows.reduce((s: number, r: any) => s + Number(r.count), 0) || 1;
        const topics = topicsRes.rows.map((r: any) => ({ topic: r.topic, count: Number(r.count), pct: Number(r.count) / total }));

        // sentiment distribution
        const sentRes = await query<any>(
            `SELECT COALESCE(sentiment_polarity, 'unknown') AS label, COUNT(*) AS count
             FROM note_ai_metrics m
             JOIN notes n ON n.id = m.note_id
             WHERE n.created_at >= CURRENT_DATE - $1::int
               AND ($2::int IS NULL OR m.user_id = $2::int)
             GROUP BY COALESCE(sentiment_polarity, 'unknown')
             ORDER BY count DESC`,
            [range, userId ?? null]
        );
        const sentTotal = sentRes.rows.reduce((s: number, r: any) => s + Number(r.count), 0) || 1;
        const sentiment = sentRes.rows.map((r: any) => ({ label: r.label, count: Number(r.count), pct: Number(r.count) / sentTotal }));

        return res.json({ range, topics, sentiment });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}


