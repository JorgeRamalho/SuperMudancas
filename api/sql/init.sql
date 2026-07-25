CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS solicitacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocolo VARCHAR(20) NOT NULL UNIQUE,
  nome VARCHAR(160) NOT NULL,
  email VARCHAR(160) NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  cpf VARCHAR(11) NOT NULL,

  origem_cep VARCHAR(8) NOT NULL,
  origem_logradouro VARCHAR(180) NOT NULL,
  origem_numero VARCHAR(20) NOT NULL,
  origem_complemento VARCHAR(120),
  origem_bairro VARCHAR(120) NOT NULL,
  origem_cidade VARCHAR(120) NOT NULL,
  origem_uf CHAR(2) NOT NULL,
  origem_tipo_imovel VARCHAR(40) NOT NULL,
  origem_andares INTEGER NOT NULL DEFAULT 0,
  origem_elevador BOOLEAN NOT NULL DEFAULT FALSE,

  destino_cep VARCHAR(8) NOT NULL,
  destino_logradouro VARCHAR(180) NOT NULL,
  destino_numero VARCHAR(20) NOT NULL,
  destino_complemento VARCHAR(120),
  destino_bairro VARCHAR(120) NOT NULL,
  destino_cidade VARCHAR(120) NOT NULL,
  destino_uf CHAR(2) NOT NULL,
  destino_tipo_imovel VARCHAR(40) NOT NULL,
  destino_andares INTEGER NOT NULL DEFAULT 0,
  destino_elevador BOOLEAN NOT NULL DEFAULT FALSE,

  data_preferida DATE NOT NULL,
  janela_horario VARCHAR(40) NOT NULL,
  tipo_servico VARCHAR(40) NOT NULL,
  porte VARCHAR(40) NOT NULL,
  embalagem BOOLEAN NOT NULL DEFAULT FALSE,
  montagem_desmontagem BOOLEAN NOT NULL DEFAULT FALSE,
  itens_especiais TEXT,
  observacoes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_solicitacoes_email ON solicitacoes (email);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_created_at ON solicitacoes (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_protocolo ON solicitacoes (protocolo);

CREATE TABLE IF NOT EXISTS mensagens_contato (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(160) NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  email VARCHAR(160),
  mensagem TEXT NOT NULL,
  origem VARCHAR(40) NOT NULL DEFAULT 'site',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mensagens_created_at ON mensagens_contato (created_at DESC);
