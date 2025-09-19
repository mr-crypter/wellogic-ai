import dotenv from "dotenv";
import { Pool, QueryResult, QueryResultRow } from "pg";
import fs from "fs";
import path from "path";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/ai_journal";
const enableSsl = process.env.DB_SSL === "1" || /sslmode=require/i.test(databaseUrl) || /supabase\.co/i.test(databaseUrl);

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: enableSsl ? { rejectUnauthorized: false } as any : undefined,
});

async function initializeDatabaseIfNeeded() {
  try {
    // Always apply schema on startup; statements are idempotent via IF NOT EXISTS
    const schemaPath = path.resolve(process.cwd(), "db", "schema.sql");
    const sql = fs.readFileSync(schemaPath, "utf8");
    await pool.query(sql);
  } catch (err) {
    console.error("Failed to apply database schema:", err);
  }
}

initializeDatabaseIfNeeded().catch((err) => {
  console.error("Failed to initialize database schema:", err);
});

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params?: any[]): Promise<QueryResult<T>> {
	const start = Date.now();
	const result = await pool.query<T>(text, params);
	const durationMs = Date.now() - start;
	if (process.env.LOG_SQL === "1") {
		console.log("executed query", { text, durationMs, rows: result.rowCount });
	}
	return result;
}


