import { generateObject } from "ai";
import { z } from "zod";
import { bedrockModel } from "./bedrock.provider.js";

// 情绪光谱系统 Emotion Spectrum System
export const emotionSpectrum = {
  stress: {
    label: "压力",
    color: "#6B7280", // gray-500
    bgGradient: "from-gray-400 to-gray-600",
    icon: "delete_outline",
    container: "trash",
  },
  boredom: {
    label: "无聊",
    color: "#9CA3AF", // gray-400
    bgGradient: "from-gray-300 to-gray-500",
    icon: "hourglass_empty",
    container: "trash",
  },
  anxiety: {
    label: "焦虑",
    color: "#1E40AF", // blue-800
    bgGradient: "from-blue-700 to-indigo-900",
    icon: "cloud",
    container: "cloud",
  },
  anger: {
    label: "愤怒",
    color: "#DC2626", // red-600
    bgGradient: "from-orange-500 to-red-700",
    icon: "local_fire_department",
    container: "flame",
  },
  joy: {
    label: "快乐",
    color: "#F97316", // orange-500
    bgGradient: "from-amber-400 to-orange-600",
    icon: "sentiment_very_satisfied",
    container: "candy",
  },
  achievement: {
    label: "成就",
    color: "#EAB308", // yellow-500
    bgGradient: "from-yellow-400 to-amber-600",
    icon: "star",
    container: "star",
  },
  warmth: {
    label: "温暖",
    color: "#EC4899", // pink-500
    bgGradient: "from-pink-400 to-rose-600",
    icon: "lightbulb",
    container: "lamp",
  },
  calm: {
    label: "平静",
    color: "#22C55E", // green-500
    bgGradient: "from-emerald-400 to-green-600",
    icon: "eco",
    container: "leaf",
  },
} as const;

export type EmotionSpectrumType = keyof typeof emotionSpectrum;

// AI 情绪分析结果 schema
const emotionAnalysisSchema = z.object({
  spectrum: z.enum([
    "stress",
    "boredom",
    "anxiety",
    "anger",
    "joy",
    "achievement",
    "warmth",
    "calm",
  ]),
  emotion: z.string().min(1).max(50), // 具体情绪，如 "开心", "兴奋"
  intensity: z.number().int().min(1).max(10), // 强度 1-10
  keywords: z.array(z.string()).max(5), // 关键词
  explanation: z.string().min(10).max(200), // 简短解释
});

export type EmotionAnalysisResult = z.infer<typeof emotionAnalysisSchema>;

export class MoodAnalysisServiceError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "MoodAnalysisServiceError";
    this.status = status;
  }
}

/**
 * 使用 AI 分析用户输入的情绪文本
 */
export async function analyzeEmotion(input: string): Promise<EmotionAnalysisResult> {
  if (!input || input.trim().length === 0) {
    throw new MoodAnalysisServiceError("Input text is required", 400);
  }

  if (input.trim().length > 500) {
    throw new MoodAnalysisServiceError("Input text too long (max 500 characters)", 400);
  }

  try {
    const { object } = await generateObject({
      model: bedrockModel(),
      schema: emotionAnalysisSchema,
      prompt: `Analyze the emotional content of the following text and classify it into one of the specified emotion categories.

Input text: "${input.trim()}"

Please analyze:
1. Which spectrum does this emotion belong to?
   - stress (压力): feeling overwhelmed, pressured, burdened
   - boredom (无聊): feeling uninterested, dull, monotonous
   - anxiety (焦虑): feeling worried, nervous, uneasy, uncertain
   - anger (愤怒): feeling irritated, frustrated, furious, mad
   - joy (快乐): feeling happy, cheerful, delighted, pleased
   - achievement (成就): feeling accomplished, successful, proud, triumphant
   - warmth (温暖): feeling cozy, loved, comfortable, affectionate
   - calm (平静): feeling peaceful, relaxed, serene, tranquil

2. What is the specific emotion (in Chinese, 1-2 words)?
3. Intensity level (1-10, where 10 is strongest)
4. Up to 5 keywords from the input
5. Brief explanation of why this classification was chosen (in Chinese)`,
    });

    return object;
  } catch (error) {
    console.error("Emotion analysis failed:", error);
    throw new MoodAnalysisServiceError(
      error instanceof Error ? error.message : "Emotion analysis failed",
      500
    );
  }
}

/**
 * 根据情绪光谱类型获取样式配置
 */
export function getEmotionStyle(spectrum: EmotionSpectrumType) {
  return emotionSpectrum[spectrum];
}

/**
 * 计算动态背景渐变 - 基于最近的情绪记录
 */
export function calculateMoodGradient(spectrums: EmotionSpectrumType[]): string {
  if (spectrums.length === 0) {
    return "from-indigo-50 to-blue-50"; // 默认背景
  }

  // 统计各光谱出现频率
  const counts: Record<string, number> = {};
  spectrums.forEach((s) => {
    counts[s] = (counts[s] || 0) + 1;
  });

  // 找出最主要的情绪
  const dominant = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])[0][0] as EmotionSpectrumType;

  return emotionSpectrum[dominant].bgGradient;
}
