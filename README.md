# widea

AI-Powered Ideation Platform

## Setup

Install dependencies:

```bash
bun install
```

## Google Login Setup

Create OAuth 2.0 Web Client credentials in Google Cloud Console, then set:

- `web/.env.local`
  - `VITE_GOOGLE_CLIENT_ID=your_google_web_client_id`
- `api/.env`
  - `GOOGLE_CLIENT_ID=your_google_web_client_id`

Recommended Authorized JavaScript origins:

- `http://localhost:5173`

## Database Setup

Initialize and seed the database:

```bash
bun packages/db/seed.ts
```

## Running the Application

### Start the API Server

```bash
cd api
bun run dev
```

The API will be available at http://localhost:3001

### Start the Web App

In a separate terminal:

```bash
cd web
bun run dev
```

The web app will be available at http://localhost:5173

## Project Structure

- `api` - Backend API server (Bun + Bun.serve)
- `web` - Frontend web application (React + Vite)
- `packages/db` - Database models and utilities (Prisma)

This project was created using `bun init` in bun v1.3.8. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
