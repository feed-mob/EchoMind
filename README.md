# EchoMind

EchoMind is a separated frontend/backend project organized into `api` (server) and `web` (frontend).

## Demo

- Live Demo: http://echo-mind.coolify-tinca.tonob.net/

## Project Structure

- `api/`: Backend service code (Bun + TypeScript), providing APIs and business logic.
- `web/`: Frontend app code (Vite + TypeScript), providing the user interface.
- `packages/`: Reserved shared package directory (for common types, utilities, SDKs, etc.).
- `CLAUDE.md`: Project collaboration and development conventions.

## Quick Start

### 1) Start the Backend

```bash
cd api
bun install
bun run dev
```

Default URL: `http://localhost:3000`

### 2) Start the Frontend

```bash
cd web
bun install
bun run dev
```

Default URL (Vite): usually `http://localhost:5173`

## Subdirectory Documentation

- See `api/README.md` for API details.
- See `web/README.md` for Web details.

## Separate Coolify Deployment (Nixpacks)

Create two services in Coolify from the same repository, with different Base Directories:

- API Service
  - Build Pack: `Nixpacks`
  - Base Directory: `api`
  - Port: `3000`
- Web Service
  - Build Pack: `Nixpacks`
  - Base Directory: `web`
  - Port: `3000` (the port used by `vite preview` inside the container)

This repository already includes independent build/start settings in `api/nixpacks.toml` and `web/nixpacks.toml`, and Coolify will load them automatically based on each directory.
