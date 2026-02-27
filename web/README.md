# Web Development Environment Setup

## 1. Runtime Requirements

- Node.js: `>=22.12` (required by Vite 7)
- Package manager: `bun` preferred (the repository includes `bun.lock`)

## 2. Install Dependencies

Run in the `web/` directory:

```bash
bun install
```

## 3. Start Local Development

```bash
bun run dev
```

Vite starts the dev server by default (usually `http://localhost:5173`).

## 4. Common Scripts

```bash
# Start development
bun run dev

# Lint
bun run lint

# Production build (TypeScript compile + Vite build)
bun run build

# Preview build output locally
bun run preview

# Production start (listens on 0.0.0.0:${PORT:-3000})
bun run start
```

## 5. Directory Overview (Brief)

- `src/`: Frontend source code
- `public/`: Static assets
- `vite.config.ts`: Vite configuration
- `eslint.config.js`: ESLint configuration

## 6. Coolify (Nixpacks) Deployment

- Build Pack: `Nixpacks`
- Base Directory: `web`
- Container Port: `3000`
- Start Command: `bun run start` (configured in `nixpacks.toml`)
