import { moods } from "../../../packages/db/index.js";
import type { RequestWithParams } from "../http/types.js";

export const moodsController = {
  async list(req: Request) {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    const entries = await moods.listByUser(userId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    return Response.json(entries);
  },

  async create(req: Request) {
    const data = (await req.json()) as {
      userId: string;
      mood: string;
      emotion?: string;
      notes?: string;
      recordedAt?: string;
    };

    if (!data.userId || !data.mood) {
      return Response.json({ error: "userId and mood are required" }, { status: 400 });
    }

    const entry = await moods.create({
      userId: data.userId,
      mood: data.mood,
      emotion: data.emotion,
      notes: data.notes,
      recordedAt: data.recordedAt ? new Date(data.recordedAt) : undefined,
    });

    return Response.json(entry, { status: 201 });
  },

  async getStats(req: Request) {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    const stats = await moods.getStatsByUser(userId);
    return Response.json(stats);
  },

  async getById(req: Request) {
    const request = req as RequestWithParams<{ id: string }>;
    const entry = await moods.findById(request.params.id);

    if (!entry) {
      return Response.json({ error: "Mood not found" }, { status: 404 });
    }

    return Response.json(entry);
  },

  async update(req: Request) {
    const request = req as RequestWithParams<{ id: string }>;
    const data = (await req.json()) as Partial<{
      mood: string;
      emotion: string;
      notes: string;
      recordedAt: string;
    }>;

    const entry = await moods.findById(request.params.id);
    if (!entry) {
      return Response.json({ error: "Mood not found" }, { status: 404 });
    }

    const updated = await moods.update(request.params.id, {
      ...data,
      recordedAt: data.recordedAt ? new Date(data.recordedAt) : undefined,
    });

    return Response.json(updated);
  },

  async delete(req: Request) {
    const request = req as RequestWithParams<{ id: string }>;

    const entry = await moods.findById(request.params.id);
    if (!entry) {
      return Response.json({ error: "Mood not found" }, { status: 404 });
    }

    await moods.delete(request.params.id);
    return new Response(null, { status: 204 });
  },
};
