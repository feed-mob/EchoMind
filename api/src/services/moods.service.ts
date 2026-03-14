import { moods, type Mood, groupMembers } from "../../../packages/db/index.js";
import { analyzeEmotion, type EmotionAnalysisResult } from "./moodAnalysis.service.js";

export type MoodWithAnalysis = Mood & {
  analysis?: EmotionAnalysisResult;
};

// 团队情绪统计相关类型
export interface TeamMoodStats {
  averageMood: number;
  participationRate: number;
  topEmotion: string | null;
  totalEntries: number;
  activeMembers: number;
}

export interface TeamMoodDistribution {
  emotion: string;
  count: number;
  percentage: number;
}

export interface TeamMoodTrend {
  date: string;
  averageMood: number;
  entries: number;
}

export interface TeamInsights {
  positiveTrends: string[];
  areasForImprovement: string[];
  recommendations: string[];
}

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

/**
 * 从用户ID获取用户的主团队ID
 */
async function getUserPrimaryGroupId(userId: string): Promise<string | null> {
  try {
    // 查询用户的第一个团队成员关系
    const membership = await groupMembers.findFirst({
      where: { userId },
      with: {
        group: true,
      },
    });

    return membership?.group?.id || null;
  } catch (error) {
    console.error("Failed to get user primary group:", error);
    return null;
  }
}

/**
 * 获取团队情绪统计
 */
export async function getTeamStats(
  userId: string,
  timeRange: '7' | '30' | '90' = '7'
): Promise<TeamMoodStats> {
  try {
    // 从用户ID获取团队ID
    const groupId = await getUserPrimaryGroupId(userId);
    if (!groupId) {
      return {
        averageMood: 0,
        participationRate: 0,
        topEmotion: null,
        totalEntries: 0,
        activeMembers: 0,
      };
    }

    const moodsList = await moods.listByGroup(groupId);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange));

    const recentMoods = moodsList.filter(m => new Date(m.recordedAt) >= cutoffDate);
    const uniqueUsers = new Set(recentMoods.map(m => m.userId));

    // 计算平均情绪
    const averageMood = recentMoods.length > 0
      ? recentMoods.reduce((sum, m) => sum + getMoodValue(m.mood), 0) / recentMoods.length
      : 0;

    // 计算参与率
    const participationRate = moodsList.length > 0
      ? (recentMoods.length / moodsList.length) * 100
      : 0;

    // 获取主要情绪
    const emotionCounts = recentMoods.reduce((acc, m) => {
      const emotion = m.emotion || m.mood;
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topEmotion = Object.entries(emotionCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || null;

    return {
      averageMood: parseFloat(averageMood.toFixed(1)),
      participationRate: Math.round(participationRate),
      topEmotion,
      totalEntries: recentMoods.length,
      activeMembers: uniqueUsers.size,
    };
  } catch (error) {
    console.error("Failed to calculate team mood stats:", error);
    throw new MoodsServiceError("Failed to calculate team mood stats", 500);
  }
}

/**
 * 获取团队情绪分布
 */
export async function getTeamDistribution(
  userId: string,
  timeRange: '7' | '30' | '90' = '7'
): Promise<TeamMoodDistribution[]> {
  try {
    // 从用户ID获取团队ID
    const groupId = await getUserPrimaryGroupId(userId);
    if (!groupId) {
      return [];
    }

    const moodsList = await moods.listByGroup(groupId);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange));

    const recentMoods = moodsList.filter(m => new Date(m.recordedAt) >= cutoffDate);

    const emotionCounts = recentMoods.reduce((acc, m) => {
      const emotion = m.emotion || m.mood;
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = recentMoods.length;
    const distribution = Object.entries(emotionCounts).map(([emotion, count]) => ({
      emotion,
      count,
      percentage: Math.round((count / total) * 100),
    }));

    return distribution;
  } catch (error) {
    console.error("Failed to get team mood distribution:", error);
    throw new MoodsServiceError("Failed to get team mood distribution", 500);
  }
}

/**
 * 获取团队情绪趋势
 */
export async function getTeamTrend(
  userId: string,
  timeRange: '7' | '30' | '90' = '7'
): Promise<TeamMoodTrend[]> {
  try {
    // 从用户ID获取团队ID
    const groupId = await getUserPrimaryGroupId(userId);
    if (!groupId) {
      return [];
    }

    const moodsList = await moods.listByGroup(groupId);
    const days = parseInt(timeRange);
    const trend: TeamMoodTrend[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayMoods = moodsList.filter(m => m.recordedAt.startsWith(dateStr));
      const averageMood = dayMoods.length > 0
        ? dayMoods.reduce((sum, m) => sum + getMoodValue(m.mood), 0) / dayMoods.length
        : 0;

      trend.push({
        date: dateStr,
        averageMood: parseFloat(averageMood.toFixed(1)),
        entries: dayMoods.length,
      });
    }

    return trend;
  } catch (error) {
    console.error("Failed to get team mood trend:", error);
    throw new MoodsServiceError("Failed to get team mood trend", 500);
  }
}

/**
 * 获取团队洞察和建议
 */
export async function getTeamInsights(
  userId: string,
  timeRange: '7' | '30' | '90' = '7'
): Promise<TeamInsights> {
  try {
    // 从用户ID获取团队ID
    const groupId = await getUserPrimaryGroupId(userId);
    if (!groupId) {
      return {
        positiveTrends: [],
        areasForImprovement: ["User is not a member of any team."],
        recommendations: ["Join a team to start tracking team mood."],
      };
    }

    const moodsList = await moods.listByGroup(groupId);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange));

    const recentMoods = moodsList.filter(m => new Date(m.recordedAt) >= cutoffDate);

    // 分析积极趋势
    const positiveTrends: string[] = [];
    let avgMood = 0;
    if (recentMoods.length > 0) {
      avgMood = recentMoods.reduce((sum, m) => sum + getMoodValue(m.mood), 0) / recentMoods.length;
      if (avgMood >= 4) {
        positiveTrends.push("Team mood is consistently high, showing excellent well-being.");
      } else if (avgMood >= 3.5) {
        positiveTrends.push("Team maintains good emotional balance and engagement.");
      }
    }

    // 分析需要改进的领域
    const areasForImprovement: string[] = [];
    const emotionCounts = recentMoods.reduce((acc, m) => {
      const emotion = m.emotion || m.mood;
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const negativeEmotions = ['anxious', 'stressed', 'frustrated', 'tired'];
    const negativeCount = Object.entries(emotionCounts)
      .filter(([emotion]) => negativeEmotions.includes(emotion))
      .reduce((sum, [, count]) => sum + count, 0);

    if (negativeCount > recentMoods.length * 0.3) {
      areasForImprovement.push("Consider implementing stress management activities or team wellness programs.");
    }

    if (recentMoods.length < 5) {
      areasForImprovement.push("Encourage more team members to participate in mood tracking for better insights.");
    }

    // 生成建议
    const recommendations: string[] = [];
    if (avgMood >= 4) {
      recommendations.push("Continue current practices that support team well-being.");
      recommendations.push("Consider sharing best practices with other teams.");
    } else if (avgMood >= 3) {
      recommendations.push("Focus on team building activities to boost morale.");
      recommendations.push("Implement regular check-ins to address concerns proactively.");
    } else {
      recommendations.push("Schedule team wellness sessions and mental health support.");
      recommendations.push("Consider one-on-one discussions to understand individual challenges.");
    }

    return {
      positiveTrends,
      areasForImprovement,
      recommendations,
    };
  } catch (error) {
    console.error("Failed to generate team insights:", error);
    throw new MoodsServiceError("Failed to generate team insights", 500);
  }
}

/**
 * 将情绪字符串转换为数值
 */
function getMoodValue(mood: string): number {
  const moodMap: Record<string, number> = {
    awesome: 5,
    good: 4,
    neutral: 3,
    low: 2,
    poor: 1,
    joyful: 5,
    calm: 4,
    anxious: 2,
    stressed: 1,
    excited: 5,
    tired: 2,
    grateful: 4,
    frustrated: 1,
  };
  return moodMap[mood.toLowerCase()] || 3;
}
