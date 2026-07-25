import { query } from "./db.js";

/** Garante tabelas novas em bancos já existentes (sem recriar o volume). */
export async function ensureSchema() {
  await query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

  await query(`
    CREATE TABLE IF NOT EXISTS mensagens_contato (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      nome VARCHAR(160) NOT NULL,
      telefone VARCHAR(20) NOT NULL,
      email VARCHAR(160),
      mensagem TEXT NOT NULL,
      origem VARCHAR(40) NOT NULL DEFAULT 'site',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_mensagens_created_at
    ON mensagens_contato (created_at DESC)
  `);
}
