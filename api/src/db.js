import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://supermudancas:supermudancas@localhost:5432/supermudancas",
});

export async function query(text, params) {
  return pool.query(text, params);
}

export async function waitForDb(retries = 30, delayMs = 1000) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await pool.query("SELECT 1");
      return;
    } catch (error) {
      if (attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

export default pool;
