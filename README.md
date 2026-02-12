# widea

AI-Powered Ideation Platform

## Setup

Install dependencies:

```bash
bun install
```

## Database Setup

Initialize and seed the database:

```bash
bun packages/db/seed.ts
```

## Running the Application

### Start the API Server

```bash
cd app/api
bun run dev
```

The API will be available at http://localhost:3001

### Start the Web App

In a separate terminal:

```bash
cd app/web
bun run dev
```

The web app will be available at http://localhost:5173

## Project Structure

- `app/api` - Backend API server (Bun + Bun.serve)
- `app/web` - Frontend web application (React + Vite)
- `packages/db` - Database models and utilities (Prisma)

This project was created using `bun init` in bun v1.3.8. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
