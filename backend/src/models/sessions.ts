import { query } from "./db";
import crypto from "crypto";

export interface SessionRow {
  id: number;
  user_id: number;
  token: string;
  expires_at: string;
  created_at: string;
}

export async function createSession({ user_id }: { user_id: number }): Promise<string> {
  // Generate cryptographically secure opaque token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  await query(
    "INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)",
    [user_id, token, expiresAt]
  );
  
  return token;
}

export async function findSessionByToken(token: string): Promise<SessionRow | null> {
  const result = await query<SessionRow>(
    `SELECT s.id, s.user_id, s.token, s.expires_at, s.created_at
     FROM sessions s
     WHERE s.token = $1 AND s.expires_at > NOW()`,
    [token]
  );
  return result.rows[0] || null;
}

export async function deleteSession(token: string): Promise<void> {
  await query("DELETE FROM sessions WHERE token = $1", [token]);
}
