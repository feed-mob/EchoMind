import { initDatabase } from "../../../packages/db";
import { handleRequest } from "../src/http/app";

let dbReadyPromise: Promise<void> | null = null;
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function ensureDbReady() {
  if (!dbReadyPromise) {
    dbReadyPromise = initDatabase();
  }
  return dbReadyPromise;
}

function getHeaderValue(
  header: string | string[] | undefined,
): string | null {
  if (!header) return null;
  return Array.isArray(header) ? header.join(", ") : header;
}

function toHeaders(req: { headers: Record<string, string | string[] | undefined> }) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    const normalized = getHeaderValue(value);
    if (normalized !== null) {
      headers.set(key, normalized);
    }
  }
  return headers;
}

async function readBody(req: {
  method?: string;
  body?: unknown;
  [Symbol.asyncIterator]?: () => AsyncIterableIterator<Uint8Array>;
}) {
  if (req.method === "GET" || req.method === "HEAD") {
    return undefined;
  }

  if (typeof req.body === "string") {
    return req.body;
  }

  const bufferCtor = (globalThis as { Buffer?: { isBuffer: (value: unknown) => boolean; from: (value: unknown) => Uint8Array } }).Buffer;
  if (bufferCtor?.isBuffer(req.body)) {
    return bufferCtor.from(req.body);
  }

  if (req.body && typeof req.body === "object") {
    return JSON.stringify(req.body);
  }

  if (!req[Symbol.asyncIterator]) {
    return undefined;
  }

  const chunks: Uint8Array[] = [];
  for await (const chunk of req as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) return undefined;

  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }
  return combined;
}

export default async function handler(
  req: {
    method?: string;
    url?: string;
    headers: Record<string, string | string[] | undefined>;
    body?: unknown;
    [Symbol.asyncIterator]?: () => AsyncIterableIterator<Uint8Array>;
  },
  res: {
    status: (code: number) => { send: (body: Uint8Array | string) => void };
    setHeader: (name: string, value: string) => void;
  },
) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if ((req.method || "GET").toUpperCase() === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  try {
    await ensureDbReady();

    const host = getHeaderValue(req.headers.host) || "localhost";
    const protocol = getHeaderValue(req.headers["x-forwarded-proto"]) || "https";
    const url = `${protocol}://${host}${req.url || "/"}`;
    const body = await readBody(req);
    const request = new Request(url, {
      method: req.method || "GET",
      headers: toHeaders(req),
      body,
    });

    const response = await handleRequest(request);

    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    const payload = new Uint8Array(await response.arrayBuffer());
    res.status(response.status).send(payload);
  } catch (error) {
    console.error("Unhandled Vercel API error:", error);
    res.status(500).send(
      JSON.stringify({ error: "Internal server error" }),
    );
  }
}
