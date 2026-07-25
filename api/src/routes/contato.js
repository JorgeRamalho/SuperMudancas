import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";

const router = Router();

const contatoSchema = z.object({
  nome: z.string().trim().min(2).max(160),
  telefone: z.string().trim().min(8).max(20),
  email: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.string().trim().email().max(160).optional()
  ),
  mensagem: z.string().trim().min(5).max(4000),
});

router.post("/", async (req, res) => {
  const parsed = contatoSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Dados inválidos. Revise o formulário de contato.",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const data = parsed.data;

  try {
    const result = await query(
      `INSERT INTO mensagens_contato (nome, telefone, email, mensagem, origem)
       VALUES ($1, $2, $3, $4, 'site')
       RETURNING id, created_at`,
      [data.nome, data.telefone, data.email || null, data.mensagem]
    );

    return res.status(201).json({
      id: result.rows[0].id,
      created_at: result.rows[0].created_at,
      message: "Mensagem recebida com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao salvar contato:", error);
    return res.status(500).json({ message: "Erro interno ao enviar a mensagem." });
  }
});

export default router;
