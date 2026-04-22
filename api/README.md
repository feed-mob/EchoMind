# api

To install dependencies:

```bash
bun install
```

Create `api/.env`:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/echomind?schema=public"
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

To run:

```bash
bun run dev
```

This project was created using `bun init` in bun v1.3.8. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
