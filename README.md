# Bate-Ficha

Monorepo (pnpm + Turborepo) com frontend (Next.js) e backend (Express/Node).

## Estrutura

```
bate-ficha/
├── apps/
│   ├── web/   # Frontend Next.js
│   └── api/   # Backend Express
├── packages/  # Pacotes compartilhados (futuro)
├── docs/      # Guias (setup, hospedagem free)
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Comandos

```bash
pnpm install
pnpm dev        # roda web + api
pnpm build      # build de todos os apps
pnpm lint
```

### Filtrar um app

```bash
pnpm --filter @bate-ficha/web dev
pnpm --filter @bate-ficha/api dev
```

## Documentação

- [Rodar do zero](docs/GETTING_STARTED.md)
- [Hospedagem gratuita (portfólio)](docs/FREE_HOSTING.md)

## Variáveis de ambiente

- `apps/api/.env.*` (PORT, MONGO_URI, JWT_SECRET, Cloudinary)
- `apps/web` usa `NEXT_PUBLIC_BASE_URL` apontando para a API.
