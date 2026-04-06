import { initDatabase } from "../packages/db/index.js";
import { handleRequest } from "./src/http/app.js";

await initDatabase();
const port = Number(process.env.PORT || 3000);

Bun.serve({
  port,
  fetch: handleRequest,
  development: {
    hmr: true,
    console: true,
  },
});

console.log(`API server running on http://localhost:${port}`);
