import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { query, waitForDb } from "./db.js";
import { ensureSchema } from "./ensureSchema.js";
import solicitacoesRouter from "./routes/solicitacoes.js";
import contatoRouter from "./routes/contato.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../..");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "supermudancas-admin";

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", async (_req, res) => {
  try {
    await query("SELECT 1");
    return res.json({
      ok: true,
      service: "supermudancas-api",
      database: "up",
      time: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(503).json({
      ok: false,
      service: "supermudancas-api",
      database: "down",
      message: error.message,
    });
  }
});

function requireAdmin(req, res, next) {
  const token = req.get("x-admin-token") || req.query.token;
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ message: "Não autorizado." });
  }
  return next();
}

app.get("/api/admin/solicitacoes", requireAdmin, async (_req, res) => {
  try {
    const result = await query(
      `SELECT id, protocolo, nome, email, telefone,
              origem_cidade, origem_uf, destino_cidade, destino_uf,
              data_preferida, tipo_servico, porte, created_at
       FROM solicitacoes
       ORDER BY created_at DESC
       LIMIT 100`
    );
    return res.json({ items: result.rows });
  } catch (error) {
    console.error("Erro ao listar solicitações:", error);
    return res.status(500).json({ message: "Erro ao listar solicitações." });
  }
});

app.get("/api/admin/mensagens", requireAdmin, async (_req, res) => {
  try {
    const result = await query(
      `SELECT id, nome, telefone, email, mensagem, origem, created_at
       FROM mensagens_contato
       ORDER BY created_at DESC
       LIMIT 100`
    );
    return res.json({ items: result.rows });
  } catch (error) {
    console.error("Erro ao listar mensagens:", error);
    return res.status(500).json({ message: "Erro ao listar mensagens." });
  }
});

app.use("/api/solicitacoes", solicitacoesRouter);
app.use("/api/contato", contatoRouter);

const webDir = path.join(rootDir, "web");
const clientDist = path.join(rootDir, "client", "dist");

app.use(express.static(webDir));
app.use(
  "/cadastro",
  express.static(clientDist, { index: "index.html" })
);

app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  if (req.path.startsWith("/api")) return next();

  if (req.path === "/cadastro" || req.path.startsWith("/cadastro/")) {
    return res.sendFile(path.join(clientDist, "index.html"));
  }

  return res.sendFile(path.join(webDir, "index.html"));
});

async function start() {
  try {
    await waitForDb();
    await ensureSchema();
    app.listen(PORT, () => {
      console.log(`SuperMudanças API em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Não foi possível conectar ao PostgreSQL:", error.message);
    process.exit(1);
  }
}

start();
