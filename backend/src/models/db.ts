import dotenv from "dotenv";
import { Pool, QueryResult, QueryResultRow } from "pg";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/ai_journal";

export const pool = new Pool({ connectionString: databaseUrl });

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params?: any[]): Promise<QueryResult<T>> {
	const start = Date.now();
	const result = await pool.query<T>(text, params);
	const durationMs = Date.now() - start;
	if (process.env.LOG_SQL === "1") {
		console.log("executed query", { text, durationMs, rows: result.rowCount });
	}
	return result;
}


