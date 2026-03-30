import { moods } from "../../../packages/db/index.js";
type RequestWithParams<T extends Record<string, string>> = Request & { params: T };

import {
  analyzeAndCreateMood,
  getUserMoodHistory,
  getRecentMoodSpectrum,
  getTeamStats,
  getTeamDistribution,
  getTeamTrend,
  getTeamInsights,
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

  async getTeamStats(req: Request) {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const timeRange = url.searchParams.get("timeRange") as '7' | '30' | '90' || '7';

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    try {
      const stats = await getTeamStats(userId, timeRange);
      return Response.json(stats);
    } catch (error) {
      if (error instanceof MoodsServiceError) {
        return Response.json({ error: error.message }, { status: error.status });
      }
      console.error("Get team mood stats error:", error);
      return Response.json(
        { error: "Failed to fetch team mood stats" },
        { status: 500 }
      );
    }
  },

  async getTeamDistribution(req: Request) {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const timeRange = url.searchParams.get("timeRange") as '7' | '30' | '90' || '7';

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    try {
      const distribution = await getTeamDistribution(userId, timeRange);
      return Response.json(distribution);
    } catch (error) {
      if (error instanceof MoodsServiceError) {
        return Response.json({ error: error.message }, { status: error.status });
      }
      console.error("Get team mood distribution error:", error);
      return Response.json(
        { error: "Failed to fetch team mood distribution" },
        { status: 500 }
      );
    }
  },

  async getTeamTrend(req: Request) {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const timeRange = url.searchParams.get("timeRange") as '7' | '30' | '90' || '7';

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    try {
      const trend = await getTeamTrend(userId, timeRange);
      return Response.json(trend);
    } catch (error) {
      if (error instanceof MoodsServiceError) {
        return Response.json({ error: error.message }, { status: error.status });
      }
      console.error("Get team mood trend error:", error);
      return Response.json(
        { error: "Failed to fetch team mood trend" },
        { status: 500 }
      );
    }
  },

  async getTeamInsights(req: Request) {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const timeRange = url.searchParams.get("timeRange") as '7' | '30' | '90' || '7';

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    try {
      const insights = await getTeamInsights(userId, timeRange);
      return Response.json(insights);
    } catch (error) {
      if (error instanceof MoodsServiceError) {
        return Response.json({ error: error.message }, { status: error.status });
      }
      console.error("Get team insights error:", error);
      return Response.json(
        { error: "Failed to fetch team insights" },
        { status: 500 }
      );
    }
  },

  // 获取兑换资格
  async getRedemptionEligibility(req: Request) {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    try {
      const eligibility = await moods.getRedemptionEligibility(userId);
      return Response.json(eligibility);
    } catch (error) {
      console.error("Get redemption eligibility error:", error);
      return Response.json(
        { error: "Failed to fetch redemption eligibility" },
        { status: 500 }
      );
    }
  },

  // 执行情绪倾倒
  async dump(req: Request) {
    const data = (await req.json()) as {
      userId: string;
    };

    if (!data.userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    try {
      const result = await moods.redeem(data.userId, 'dump');
      return Response.json(result);
    } catch (error) {
      console.error("Dump moods error:", error);
      if (error instanceof Error) {
        return Response.json({ error: error.message }, { status: 400 });
      }
      return Response.json(
        { error: "Failed to dump moods" },
        { status: 500 }
      );
    }
  },

  // 获取兑换历史
  async getRedemptionHistory(req: Request) {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const offset = parseInt(url.searchParams.get("offset") || "0", 10);

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    try {
      const history = await moods.getRedemptionHistory(userId, { limit, offset });
      return Response.json(history);
    } catch (error) {
      console.error("Get redemption history error:", error);
      return Response.json(
        { error: "Failed to fetch redemption history" },
        { status: 500 }
      );
    }
  },
};
