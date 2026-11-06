# AGENTS.md

Monorepo pnpm + Turborepo com `apps/web` (Next.js 14, App Router) e `apps/api` (Express + Mongoose). `packages/` está vazio — não crie imports de workspace sem antes criar o pacote.

## 🛑 Regras Estritas de Validação e Testes (Anti-Redundância)

1. **Proibido Build Completo Desnecessário:** 
   - Nunca rode `pnpm build` após alterar apenas arquivos de estilo (CSS/Tailwind), textos estáticos ou componentes isolados que não afetam a árvore de rotas ou o ecossistema de tipos global.
   - O build completo só deve ser executado **uma única vez**, obrigatoriamente no final de toda a tarefa, antes de entregar o código.

2. **Testes Unitários Cirúrgicos:**
   - Nunca rode a suíte de testes inteira (`pnpm test` global) se você modificou apenas um arquivo.
   - Sempre execute o comando apontando estritamente para o arquivo modificado (ex: `pnpm vitest run src/components/Button.test.tsx`).

3. **Cache e Verificação Incremental:**
   - Confie nos linters em tempo de execução da sua IDE ou use verificações incrementais (`tsc --noEmit --incremental`) em vez de compilações limpas repetidas.

## Comandos

- `pnpm install` na raiz. Node >= 20; pnpm fixado em 10.33.0.
- `pnpm dev` sobe web (`:3000`) e API (`:8080`) juntos.
- App isolado: `pnpm --filter @bate-ficha/web dev` ou `pnpm --filter @bate-ficha/api dev`.
- `pnpm build` compila os dois. `pnpm lint` roda só no web — a API não tem script de lint.
- `pnpm test` não serve para validar nada: não há testes e o script da API sempre termina com exit 1.
- Validação prática: `pnpm lint` e depois `pnpm build`.
- A API não faz typecheck no build (tsup/esbuild). Para checar: `pnpm --filter @bate-ficha/api exec tsc --noEmit`; hoje existe um erro pré-existente em `apps/api/src/controllers/followController.ts:18` (`string` vs `ObjectId`).
- O build do web faz typecheck e lint; há um warning pré-existente de `exhaustive-deps` em `apps/web/src/app/(private)/add-friends/page.tsx`.

## Ambiente

- A API precisa de MongoDB. `docker compose up -d` sobe Mongo 7 em `27017` (quando Docker está disponível).
- O `.env` da raiz é só do docker-compose. A API lê `apps/api/.env.${NODE_ENV || "local"}`; sem `NODE_ENV`, usa `.env.local`. `pnpm dev` e `pnpm start` da raiz não definem `NODE_ENV` para a API — em produção, defina `NODE_ENV=production` explicitamente.
- Os caminhos de `.env` são relativos ao cwd: rode a API pelos scripts do pacote (`pnpm --filter ...`), não com `node` a partir da raiz.
- Variáveis obrigatórias da API: `PORT`, `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. O Cloudinary é importado no boot; sem as três variáveis a API não inicia, mesmo sem usar upload.
- No web, `NEXT_PUBLIC_BASE_URL` precisa incluir `/api` (ex.: `http://localhost:8080/api`). O exemplo sem `/api` em `docs/GETTING_STARTED.md` está errado: o axios chama `/auth/...`, `/player/...` e a API monta tudo sob `/api`.
- Sem Mongo, a API falha com `MongooseServerSelectionError: ECONNREFUSED`.

## Arquitetura

- API: `src/server.ts` conecta no Mongo e sobe `src/app.ts`; rotas em `src/routes/*` são montadas em `/api`; controllers em `src/controllers`; models em `src/models`.
- Autenticação: JWT via `Authorization: Bearer`; `src/middleware/auth.ts` valida o token e injeta `req.player`. Quase todas as rotas usam `authenticate`.
- Web: páginas em `src/app/(private)` são client components protegidos pelo HOC `src/hoc/withAuth.tsx`, que checa os cookies `token` e `player`. O `src/middleware.ts` só redireciona `/` para `/home` quando já há login; não é proteção server-side.
- O axios (`src/services/api.ts`) lê o token do cookie e injeta o header; login/registro gravam `token` e `player` (JSON) via nookies.
- Alias do web: `@/*` -> `apps/web/src/*`.
- Build da API: tsup gera CJS + ESM em `dist/`; `start` executa `dist/server.js`.
- `apps/api/src/validations/playerValidations.ts` não é chamado por nenhum controller; validação de nome/nickname/senha no cadastro existe só no frontend. `matchValidations.ts` é usado em `matchController`.

## Regras de domínio

- Cada jogador começa com 150 `pointsSolo` e 150 `pointsTeam`; finalizar partida dá +50 ao vencedor e -25 ao perdedor. Em parceiradas, `partners` também é incrementado/decrementado.
- `gamemode`: `cara_a_cara` (1x1) ou `parceirada`; `gametype`: `bolinho` ou `par_ou_impar`; `bolinho` só aceita 2 jogadores.
- Um jogador não pode participar de duas partidas com `status: "running"` ao mesmo tempo.
- `Player.nickname` é único. O frontend normaliza para lowercase; o backend não aplica o regex/lowercase de `playerValidations.ts`.

## Gotchas de configuração

- Há `tailwind.config.js` e `tailwind.config.ts`; o ativo é o `.js` (primeiro na resolução do Tailwind e referenciado em `components.json`). Alterar o `.ts` não tem efeito.
- O rate limit global da API é 100 requisições por IP a cada 10 minutos (`src/app.ts`); chamadas repetidas em dev podem retornar 429.

## Docs

- `docs/GETTING_STARTED.md` cobre setup e banco; `docs/FREE_HOSTING.md` cobre deploy (Vercel + Render + Atlas + Cloudinary). O README repete os comandos básicos.
- Não há CI configurado; a validação é local (`pnpm lint` e `pnpm build`).
