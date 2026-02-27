# API Development Environment Setup

## 1. Runtime Requirements

- Bun: `>=1.0` (latest stable version recommended)
- Node.js: LTS recommended (for general tooling compatibility)

## 2. Install Dependencies

Run in the `api/` directory:

```bash
bun install
```

## 3. Start Local Development

```bash
bun run dev
```

The current script is equivalent to:

```bash
bun run --hot src/index.ts
```

The service listens by default on:

- `http://localhost:3000`
- In production, the port can be overridden via the `PORT` environment variable (default: `3000`)

## 4. Directory Overview (Brief)

- `src/index.ts`: API entry file
- `src/routes/`: Route definitions
- `src/controllers/`: Request handling layer
- `src/services/`: Business logic layer
- `src/middlewares/`: Common middlewares

## 5. Coolify (Nixpacks) Deployment

- Build Pack: `Nixpacks`
- Base Directory: `api`
- Container Port: `3000`
- Start Command: `bun run start` (configured in `nixpacks.toml`)
