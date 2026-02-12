import { initDatabase } from "../../packages/db";
import { routes } from "./src/routes";

await initDatabase();

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Wrap routes with CORS
const wrappedRoutes: Record<string, any> = {};
for (const [path, handlers] of Object.entries(routes)) {
  wrappedRoutes[path] = {};

  for (const [method, handler] of Object.entries(handlers)) {
    wrappedRoutes[path][method] = async (req: Request) => {
      const response = await handler(req);
      const headers = new Headers(response.headers);

      Object.entries(corsHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    };
  }

  // Add OPTIONS handler for preflight
  wrappedRoutes[path].OPTIONS = () => {
    return new Response(null, { headers: corsHeaders });
  };
}

Bun.serve({
  port: 3001,
  routes: wrappedRoutes,
  development: {
    hmr: true,
    console: true,
  },
});

console.log("API server running on http://localhost:3001");
