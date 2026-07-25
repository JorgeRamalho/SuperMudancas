# SuperMudanças

Site completo para empresa de mudanças: landing interativa, formulário React, API Node/Express, PostgreSQL e Docker.

## Estrutura

```
web/          Landing (HTML/CSS/JS) — carrosséis, mapa, contato, consulta, admin
client/       App React (Vite) — formulário /cadastro
api/          Express + PostgreSQL
docker-compose.yml
```

## Subir tudo (recomendado)

1. Abra o Docker Desktop
2. Na raiz do projeto:

```bash
docker compose up --build
```

Acesse:

| Página | URL |
|--------|-----|
| Site | http://localhost:3000 |
| Orçamento | http://localhost:3000/cadastro/ |
| Consultar protocolo | http://localhost:3000/consulta.html |
| Painel admin | http://localhost:3000/admin.html |
| Health | http://localhost:3000/api/health |

Token admin padrão: `supermudancas-admin` (altere em `ADMIN_TOKEN`).

## Desenvolvimento local

### Banco

```bash
docker compose up db -d
```

### API

```bash
cd api
cp ../.env.example .env
npm install
npm run dev
```

### React

```bash
cd client
npm install
npm run dev
```

- Vite: http://localhost:5173/
- API/landing: http://localhost:3000

### Live Server (só a landing)

Abra `web/index.html` com Live Server. Para orçamento e API, use Docker ou `npm run dev` na API + client.

Depois de alterar o React:

```bash
cd client && npm run build
```

## O que o site faz

- Landing com vídeo, galeria, antes/depois, opções, mapa, depoimentos e FAQ
- Contato salvo em `mensagens_contato` via `POST /api/contato`
- Orçamento completo com ViaCEP e protocolo (`POST /api/solicitacoes`)
- Consulta pública de protocolo
- Painel admin (solicitações + mensagens) com token

## Parar

```bash
docker compose down
```

Apagar também o banco:

```bash
docker compose down -v
```
