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
    // Insert both the JSON copy (for debugging) and the pgvector column
    await query(
        "INSERT INTO note_embeddings (note_id, user_id, embedding, embedding_vec) VALUES ($1, $2, $3, $4::vector)",
        [note_id, user_id ?? null, JSON.stringify(embedding), `[${embedding.join(",")}]`]
    );
}

export async function getNearestEmbeddings({ user_id, limit = 5 }: { user_id: number; limit?: number }): Promise<NoteEmbeddingRow[]> {
    const result = await query<NoteEmbeddingRow>(
        "SELECT id, note_id, user_id, embedding, created_at FROM note_embeddings WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2",
        [user_id, limit]
    );
    return result.rows;
}

export function parseEmbedding(row: NoteEmbeddingRow): number[] {
    try {
        const arr = JSON.parse(row.embedding);
        if (Array.isArray(arr)) return arr.map((v: any) => Number(v));
        return [];
    } catch {
        return [];
    }
}

export async function getRecentNoteEmbeddingsForUser({ user_id, days = 5, limitPerDay = 20 }: { user_id: number; days?: number; limitPerDay?: number }): Promise<NoteEmbeddingRow[]> {
    const result = await query<NoteEmbeddingRow>(
        `SELECT e.id, e.note_id, e.user_id, e.embedding, e.created_at
         FROM note_embeddings e
         JOIN notes n ON n.id = e.note_id
         WHERE e.user_id = $1 AND n.created_at >= NOW() - ($2::int || ' days')::interval
         ORDER BY e.created_at DESC
         LIMIT $3`,
        [user_id, days, days * limitPerDay]
    );
    return result.rows;
}

export async function searchNearestByVector({ user_id, queryEmbedding, limit = 5 }: { user_id: number; queryEmbedding: number[]; limit?: number }): Promise<Array<{ note_id: number; distance: number }>> {
    const vecLiteral = `[${queryEmbedding.join(",")}]`;
    const result = await query<any>(
        `SELECT note_id, (embedding_vec <=> $2::vector) AS distance
         FROM note_embeddings
         WHERE user_id = $1 AND embedding_vec IS NOT NULL
         ORDER BY embedding_vec <=> $2::vector
         LIMIT $3`,
        [user_id, vecLiteral, limit]
    );
    return result.rows.map(r => ({ note_id: Number(r.note_id), distance: Number(r.distance) }));
}



