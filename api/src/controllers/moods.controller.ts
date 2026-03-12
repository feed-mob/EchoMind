import { moods } from "../../../packages/db/index.js";
type RequestWithParams<T extends Record<string, string>> = Request & { params: T };

import {
  analyzeAndCreateMood,
  getUserMoodHistory,
  getRecentMoodSpectrum,
  MoodsServiceError,
} from "../services/moods.service.js";

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

  // 传统的创建 mood 接口（兼容旧版）
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

  // 新的 AI 情绪分析接口
  async analyze(req: Request) {
    const data = (await req.json()) as {
      userId: string;
      text: string;
    };

    if (!data.userId || !data.text) {
      return Response.json(
        { error: "userId and text are required" },
        { status: 400 }
      );
    }

    try {
      const mood = await analyzeAndCreateMood(data.userId, data.text);
      return Response.json(mood, { status: 201 });
    } catch (error) {
      if (error instanceof MoodsServiceError) {
        return Response.json({ error: error.message }, { status: error.status });
      }
      console.error("Analyze mood error:", error);
      return Response.json(
        { error: "Failed to analyze mood" },
        { status: 500 }
      );
    }
  },

  // 获取用户情绪历史（带情绪光谱数据）
  async getHistory(req: Request) {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    try {
      const history = await getUserMoodHistory(userId, limit);
      return Response.json(history);
    } catch (error) {
      if (error instanceof MoodsServiceError) {
        return Response.json({ error: error.message }, { status: error.status });
      }
      console.error("Get mood history error:", error);
      return Response.json(
        { error: "Failed to fetch mood history" },
        { status: 500 }
      );
    }
  },

  // 获取用户最近的情绪光谱（用于动态背景）
  async getSpectrum(req: Request) {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const days = parseInt(url.searchParams.get("days") || "7", 10);

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    try {
      const spectrums = await getRecentMoodSpectrum(userId, days);
      return Response.json({ spectrums });
    } catch (error) {
      if (error instanceof MoodsServiceError) {
        return Response.json({ error: error.message }, { status: error.status });
      }
      console.error("Get mood spectrum error:", error);
      return Response.json(
        { error: "Failed to fetch mood spectrum" },
        { status: 500 }
      );
    }
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
