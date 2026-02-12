import { initDatabase } from "../../packages/db";
import { routes } from "./src/routes";

await initDatabase();

Bun.serve({
  port: 3001,
  routes,
  development: {
    hmr: true,
    console: true,
  },
});

console.log("API server running on http://localhost:3001");
