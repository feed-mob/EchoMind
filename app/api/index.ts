import { initDatabase } from "../../packages/db";
import { handleRequest } from "./src/http/app";

await initDatabase();

Bun.serve({
  port: 3001,
  fetch: handleRequest,
  development: {
    hmr: true,
    console: true,
  },
});

console.log("API server running on http://localhost:3001");
