import { moods, type Mood } from "../../../packages/db/index.js";
import { analyzeEmotion, type EmotionAnalysisResult } from "./moodAnalysis.service.js";

export type MoodWithAnalysis = Mood & {
  analysis?: EmotionAnalysisResult;
};

export class MoodsServiceError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "MoodsServiceError";
    this.status = status;
  }
}

/**
 * 分析情绪并保存到数据库
 */
export async function analyzeAndCreateMood(
  userId: string,
  input: string
): Promise<Mood> {
  if (!input || input.trim().length === 0) {
    throw new MoodsServiceError("Input text is required", 400);
  }

  try {
    // 使用 AI 分析情绪
    const analysis = await analyzeEmotion(input);

    // 保存到数据库
    const mood = await moods.create({
      userId,
      mood: analysis.spectrum, // 使用 spectrum 作为 mood 值
      emotion: analysis.emotion, // 具体情绪描述
      notes: input.trim(), // 用户原始输入
      spectrum: analysis.spectrum,
      color: analysis.spectrum, // 存储 spectrum 类型，前端根据此映射颜色
      icon: getIconForSpectrum(analysis.spectrum),
      intensity: analysis.intensity,
    });

    return mood;
  } catch (error) {
    if (error instanceof MoodsServiceError) {
      throw error;
    }
    console.error("Failed to analyze and create mood:", error);
    throw new MoodsServiceError(
      error instanceof Error ? error.message : "Failed to analyze mood",
      500
    );
  }
}

/**
 * 获取用户的情绪历史
 */
export async function getUserMoodHistory(
  userId: string,
  limit: number = 10
): Promise<Mood[]> {
  try {
    const moodsList = await moods.listByUser(userId);
    return moodsList.slice(0, limit);
  } catch (error) {
    console.error("Failed to fetch mood history:", error);
    throw new MoodsServiceError("Failed to fetch mood history", 500);
  }
}

/**
 * 获取用户的最近情绪状态（用于背景色）
 */
export async function getRecentMoodSpectrum(
  userId: string,
  days: number = 7
): Promise<string[]> {
  try {
    const moodsList = await moods.listByUser(userId);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return moodsList
      .filter((m) => new Date(m.recordedAt) >= cutoffDate)
      .map((m) => m.spectrum || m.mood)
      .filter(Boolean);
  } catch (error) {
    console.error("Failed to fetch recent mood spectrum:", error);
    return [];
  }
}

/**
 * 根据光谱类型获取图标
 */
function getIconForSpectrum(
  spectrum: string
): string {
  const iconMap: Record<string, string> = {
    stress: "delete_outline",
    boredom: "hourglass_empty",
    anxiety: "cloud",
    anger: "local_fire_department",
    joy: "restaurant",
    achievement: "star",
    warmth: "lightbulb",
    calm: "eco",
  };
  return iconMap[spectrum] || "sentiment_satisfied";
}
