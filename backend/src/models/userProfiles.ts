import { query } from "./db.js";

export interface UserProfileRow {
    user_id: number;
    preferences: any;
    created_at: string;
    updated_at: string;
}

export async function getUserProfile(user_id: number): Promise<UserProfileRow | null> {
    const res = await query<UserProfileRow>(
        `SELECT user_id, preferences, created_at, updated_at FROM user_profiles WHERE user_id = $1`,
        [user_id]
    );
    return res.rows[0] || null;
}

export async function upsertUserProfile(user_id: number, preferences: any): Promise<UserProfileRow> {
    const res = await query<UserProfileRow>(
        `INSERT INTO user_profiles (user_id, preferences)
         VALUES ($1, $2::jsonb)
         ON CONFLICT (user_id)
         DO UPDATE SET preferences = EXCLUDED.preferences, updated_at = NOW()
         RETURNING user_id, preferences, created_at, updated_at`,
        [user_id, JSON.stringify(preferences ?? {})]
    );
    return res.rows[0];
}


