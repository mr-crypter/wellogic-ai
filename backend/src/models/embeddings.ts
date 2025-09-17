import { query } from "./db.js";

export interface NoteEmbeddingRow {
    id: number;
    note_id: number;
    user_id: number | null;
    embedding: string; // JSON stringified vector
    created_at: string;
}

export async function upsertNoteEmbedding({ note_id, user_id, embedding }: { note_id: number; user_id?: number | null; embedding: number[] }): Promise<void> {
    // simple upsert: delete then insert (fits Postgres without extensions)
    await query("DELETE FROM note_embeddings WHERE note_id = $1", [note_id]);
    await query(
        "INSERT INTO note_embeddings (note_id, user_id, embedding) VALUES ($1, $2, $3)",
        [note_id, user_id ?? null, JSON.stringify(embedding)]
    );
}

export async function getNearestEmbeddings({ user_id, limit = 5 }: { user_id: number; limit?: number }): Promise<NoteEmbeddingRow[]> {
    const result = await query<NoteEmbeddingRow>(
        "SELECT id, note_id, user_id, embedding, created_at FROM note_embeddings WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2",
        [user_id, limit]
    );
    return result.rows;
}


