# Bate-Ficha - API

Backend da aplicação Bate-Ficha (gerenciamento de jogos de sinuca).

## Tecnologias Utilizadas

- Node.js
- Express
- MongoDB
- TypeScript
- Zod (validação)
- JWT (autenticação)

## Como Executar (monorepo)

Na raiz do monorepo:

```bash
pnpm install
pnpm --filter @bate-ficha/api dev
```

Ou, de dentro de `apps/api`:

```bash
pnpm dev
```

### Variáveis de ambiente

Crie arquivos `.env.local`, `.env.development`, `.env.production` em `apps/api` conforme o `NODE_ENV`.

```env
PORT=8080
MONGO_URI=mongodb://localhost:27017/bate-ficha
JWT_SECRET=sua_chave_secreta
```

## Rotas da API

- **Jogadores**: `/api/player`
- **Autenticação**: `/api/auth`
- **Partidas**: `/api/matches`
- **Seguir Jogadores**: `/api/follow`
