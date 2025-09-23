import { query } from "./db.js";

export interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  nickname: string | null;
  avatar_url: string | null;
  avatar_name: string | null;
  created_at: string;
}

export async function createUser({ email, password_hash, nickname, avatar_url, avatar_name }: {
  email: string; password_hash: string; nickname?: string; avatar_url?: string; avatar_name?: string;
}): Promise<UserRow> {
  const result = await query<UserRow>(
    `INSERT INTO users (email, password_hash, nickname, avatar_url, avatar_name)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, password_hash, nickname, avatar_url, avatar_name, created_at`,
    [email, password_hash, nickname || null, avatar_url || null, avatar_name || null]
  );
  return result.rows[0];
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const result = await query<UserRow>(
    `SELECT id, email, password_hash, nickname, avatar_url, avatar_name, created_at
     FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0] || null;
}

export async function findUserById(id: number): Promise<UserRow | null> {
  const result = await query<UserRow>(
    `SELECT id, email, password_hash, nickname, avatar_url, avatar_name, created_at
     FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}


