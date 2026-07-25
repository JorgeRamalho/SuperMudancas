import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";

const router = Router();

const solicitacaoSchema = z.object({
  nome: z.string().trim().min(3).max(160),
  email: z.string().trim().email().max(160),
  telefone: z.string().regex(/^\d{10,11}$/),
  cpf: z.string().regex(/^\d{11}$/),

  origem_cep: z.string().regex(/^\d{8}$/),
  origem_logradouro: z.string().trim().min(2).max(180),
  origem_numero: z.string().trim().min(1).max(20),
  origem_complemento: z.string().trim().max(120).optional().default(""),
  origem_bairro: z.string().trim().min(2).max(120),
  origem_cidade: z.string().trim().min(2).max(120),
  origem_uf: z.string().length(2),
  origem_tipo_imovel: z.string().trim().min(2).max(40),
  origem_andares: z.coerce.number().int().min(0).max(200),
  origem_elevador: z.boolean(),

  destino_cep: z.string().regex(/^\d{8}$/),
  destino_logradouro: z.string().trim().min(2).max(180),
  destino_numero: z.string().trim().min(1).max(20),
  destino_complemento: z.string().trim().max(120).optional().default(""),
  destino_bairro: z.string().trim().min(2).max(120),
  destino_cidade: z.string().trim().min(2).max(120),
  destino_uf: z.string().length(2),
  destino_tipo_imovel: z.string().trim().min(2).max(40),
  destino_andares: z.coerce.number().int().min(0).max(200),
  destino_elevador: z.boolean(),

  data_preferida: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  janela_horario: z.string().trim().min(2).max(40),
  tipo_servico: z.enum(["residencial", "comercial", "escritorio"]),
  porte: z.enum(["kitnet", "1_quarto", "2_quartos", "3_mais"]),
  embalagem: z.boolean().optional().default(false),
  montagem_desmontagem: z.boolean().optional().default(false),
  itens_especiais: z.string().trim().max(2000).optional().default(""),
  observacoes: z.string().trim().max(4000).optional().default(""),
});

function buildProtocolo() {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `SM${y}${m}${d}${rand}`;
}

router.post("/", async (req, res) => {
  const parsed = solicitacaoSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Dados inválidos. Revise o formulário.",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const data = parsed.data;
  const protocolo = buildProtocolo();

  try {
    const result = await query(
      `INSERT INTO solicitacoes (
        protocolo, nome, email, telefone, cpf,
        origem_cep, origem_logradouro, origem_numero, origem_complemento,
        origem_bairro, origem_cidade, origem_uf, origem_tipo_imovel,
        origem_andares, origem_elevador,
        destino_cep, destino_logradouro, destino_numero, destino_complemento,
        destino_bairro, destino_cidade, destino_uf, destino_tipo_imovel,
        destino_andares, destino_elevador,
        data_preferida, janela_horario, tipo_servico, porte,
        embalagem, montagem_desmontagem, itens_especiais, observacoes
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9,
        $10, $11, $12, $13,
        $14, $15,
        $16, $17, $18, $19,
        $20, $21, $22, $23,
        $24, $25,
        $26, $27, $28, $29,
        $30, $31, $32, $33
      )
      RETURNING id, protocolo, created_at`,
      [
        protocolo,
        data.nome,
        data.email,
        data.telefone,
        data.cpf,
        data.origem_cep,
        data.origem_logradouro,
        data.origem_numero,
        data.origem_complemento,
        data.origem_bairro,
        data.origem_cidade,
        data.origem_uf.toUpperCase(),
        data.origem_tipo_imovel,
        data.origem_andares,
        data.origem_elevador,
        data.destino_cep,
        data.destino_logradouro,
        data.destino_numero,
        data.destino_complemento,
        data.destino_bairro,
        data.destino_cidade,
        data.destino_uf.toUpperCase(),
        data.destino_tipo_imovel,
        data.destino_andares,
        data.destino_elevador,
        data.data_preferida,
        data.janela_horario,
        data.tipo_servico,
        data.porte,
        data.embalagem,
        data.montagem_desmontagem,
        data.itens_especiais,
        data.observacoes,
      ]
    );

    const row = result.rows[0];
    return res.status(201).json({
      id: row.id,
      protocolo: row.protocolo,
      created_at: row.created_at,
    });
  } catch (error) {
    console.error("Erro ao criar solicitação:", error);
    return res.status(500).json({ message: "Erro interno ao salvar a solicitação." });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query(
      `SELECT id, protocolo, nome, email, telefone,
              origem_cidade, origem_uf, destino_cidade, destino_uf,
              data_preferida, janela_horario, tipo_servico, porte,
              embalagem, montagem_desmontagem, created_at
       FROM solicitacoes
       WHERE id::text = $1 OR protocolo = $1
       LIMIT 1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Solicitação não encontrada." });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao buscar solicitação:", error);
    return res.status(500).json({ message: "Erro interno ao buscar a solicitação." });
  }
});

export default router;
