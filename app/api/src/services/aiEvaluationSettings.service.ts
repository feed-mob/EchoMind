import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { aiEvaluationResults, aiEvaluationSettings, goals, ideas } from "../../../../packages/db";

type CreateSettingInput = {
  groupId: string;
  goalId: string;
  model: string;
  impactWeight: number;
  feasibilityWeight: number;
  originalityWeight: number;
  selectedIdeaIds: string[];
};

const reviewSchema = z.object({
  review: z.string().min(20).max(1200),
  impactScore: z.number().int().min(0).max(100),
  feasibilityScore: z.number().int().min(0).max(100),
  originalityScore: z.number().int().min(0).max(100),
});

const batchReviewSchema = z.object({
  results: z.array(
    z.object({
      id: z.string().min(1),
      review: z.string().min(20).max(1200),
      impactScore: z.number().int().min(0).max(100),
      feasibilityScore: z.number().int().min(0).max(100),
      originalityScore: z.number().int().min(0).max(100),
    }),
  ),
});

const BATCH_SIZE = 5;
const DEFAULT_GEMINI_MODEL = "gemini-1.5-flash";

export class AiEvaluationServiceError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AiEvaluationServiceError";
    this.status = status;
  }
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function weightedTotal(
  impactScore: number,
  feasibilityScore: number,
  originalityScore: number,
  impactWeight: number,
  feasibilityWeight: number,
  originalityWeight: number,
) {
  return Math.round(
    (impactScore * impactWeight + feasibilityScore * feasibilityWeight + originalityScore * originalityWeight) / 100,
  );
}

function chunkIdeas<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function formatGoalField(value: unknown) {
  if (value === null || value === undefined) return "N/A";
  if (typeof value === "string") return value.trim() || "N/A";
  try {
    const serialized = JSON.stringify(value);
    return serialized && serialized !== "{}" && serialized !== "[]" ? serialized : "N/A";
  } catch {
    return "N/A";
  }
}

function normalizeGeminiModel(model: string) {
  if (model === "gemini-1.5-pro") return DEFAULT_GEMINI_MODEL;
  if (!model.startsWith("gemini-")) return DEFAULT_GEMINI_MODEL;
  return model;
}

async function evaluateIdeaWithGoogle(params: {
  model: string;
  goalTitle: string;
  goalDescription: string;
  goalSuccessMetrics?: unknown;
  goalConstraints?: unknown;
  ideaTitle: string;
  ideaContent: string;
}) {
  const modelName = normalizeGeminiModel(params.model);

  const { object } = await generateObject({
    model: google(modelName),
    schema: reviewSchema,
    prompt: `You are evaluating one product idea against one goal.

Goal title: ${params.goalTitle}
Goal description: ${params.goalDescription || "N/A"}
Goal success metrics: ${formatGoalField(params.goalSuccessMetrics)}
Goal constraints: ${formatGoalField(params.goalConstraints)}

Idea title: ${params.ideaTitle}
Idea content: ${params.ideaContent || "N/A"}

Return objective scoring and concise review.
Scoring rules:
- impactScore: expected business/customer impact.
- feasibilityScore: implementation feasibility with realistic resources.
- originalityScore: uniqueness compared with typical market solutions.

Output JSON only, following the schema exactly.`,
  });

  return {
    review: object.review.trim(),
    impactScore: clampScore(object.impactScore),
    feasibilityScore: clampScore(object.feasibilityScore),
    originalityScore: clampScore(object.originalityScore),
  };
}

async function evaluateIdeasBatchWithGoogle(params: {
  model: string;
  goalTitle: string;
  goalDescription: string;
  goalSuccessMetrics?: unknown;
  goalConstraints?: unknown;
  ideas: Array<{ id: string; title: string; content: string }>;
}) {
  const modelName = normalizeGeminiModel(params.model);

  const ideasBlock = params.ideas
    .map(
      (idea, index) => `
Idea ${index + 1}:
- id: ${idea.id}
- title: ${idea.title}
- content: ${idea.content || "N/A"}
`.trim(),
    )
    .join("\n\n");

  const { object } = await generateObject({
    model: google(modelName),
    schema: batchReviewSchema,
    prompt: `You are evaluating multiple product ideas against one goal.

Goal title: ${params.goalTitle}
Goal description: ${params.goalDescription || "N/A"}
Goal success metrics: ${formatGoalField(params.goalSuccessMetrics)}
Goal constraints: ${formatGoalField(params.goalConstraints)}

Evaluate each idea independently and return one result per input id.
Do not drop or rename ids.

Scoring rules:
- impactScore: expected business/customer impact.
- feasibilityScore: implementation feasibility with realistic resources.
- originalityScore: uniqueness compared with typical market solutions.

Ideas:
${ideasBlock}

Output JSON only, following the schema exactly.`,
  });

  return new Map(
    object.results.map((item) => [
      item.id,
      {
        review: item.review.trim(),
        impactScore: clampScore(item.impactScore),
        feasibilityScore: clampScore(item.feasibilityScore),
        originalityScore: clampScore(item.originalityScore),
      },
    ]),
  );
}

export const aiEvaluationSettingsService = {
  listByGroup(groupId: string) {
    return aiEvaluationSettings.listByGroup(groupId);
  },

  findById(settingId: string) {
    return aiEvaluationSettings.findById(settingId);
  },

  listResultsBySetting(settingId: string) {
    return aiEvaluationResults.listBySetting(settingId);
  },

  async createAndEvaluate(input: CreateSettingInput) {
    if (!input.goalId || !Array.isArray(input.selectedIdeaIds) || input.selectedIdeaIds.length === 0) {
      throw new AiEvaluationServiceError("goalId and selectedIdeaIds are required", 400);
    }

    const totalWeight = input.impactWeight + input.feasibilityWeight + input.originalityWeight;
    if (totalWeight !== 100) {
      throw new AiEvaluationServiceError("impactWeight + feasibilityWeight + originalityWeight must equal 100", 400);
    }

    const goal = await goals.findById(input.goalId);
    if (!goal || goal.groupId !== input.groupId) {
      throw new AiEvaluationServiceError("Goal not found in this group", 404);
    }

    const groupIdeas = await ideas.listByGroup(input.groupId);
    const selectedIdeaSet = new Set(input.selectedIdeaIds);
    const selectedIdeas = groupIdeas.filter((idea) => selectedIdeaSet.has(idea.id));

    if (selectedIdeas.length === 0) {
      throw new AiEvaluationServiceError("No valid ideas selected", 400);
    }

    const selectedModel = normalizeGeminiModel(input.model);
    const setting = await aiEvaluationSettings.create({
      groupId: input.groupId,
      goalId: input.goalId,
      model: selectedModel,
      impactWeight: input.impactWeight,
      feasibilityWeight: input.feasibilityWeight,
      originalityWeight: input.originalityWeight,
      selectedIdeaIds: selectedIdeas.map((idea) => idea.id),
    });

    const evaluated: Array<{
      settingId: string;
      ideaId: string;
      review: string;
      impactScore: number;
      feasibilityScore: number;
      originalityScore: number;
      totalScore: number;
    }> = [];

    const ideaBatches = chunkIdeas(selectedIdeas, BATCH_SIZE);
    for (const batch of ideaBatches) {
      const batchResultMap = await evaluateIdeasBatchWithGoogle({
        model: selectedModel,
        goalTitle: goal.title,
        goalDescription: goal.description || "",
        goalSuccessMetrics: goal.successMetrics,
        goalConstraints: goal.constraints,
        ideas: batch.map((idea) => ({
          id: idea.id,
          title: idea.title,
          content: idea.content || "",
        })),
      });

      for (const idea of batch) {
        const review =
          batchResultMap.get(idea.id) ??
          (await evaluateIdeaWithGoogle({
            model: selectedModel,
            goalTitle: goal.title,
            goalDescription: goal.description || "",
            goalSuccessMetrics: goal.successMetrics,
            goalConstraints: goal.constraints,
            ideaTitle: idea.title,
            ideaContent: idea.content || "",
          }));

        const totalScore = weightedTotal(
          review.impactScore,
          review.feasibilityScore,
          review.originalityScore,
          input.impactWeight,
          input.feasibilityWeight,
          input.originalityWeight,
        );

        evaluated.push({
          settingId: setting.id,
          ideaId: idea.id,
          review: review.review,
          impactScore: review.impactScore,
          feasibilityScore: review.feasibilityScore,
          originalityScore: review.originalityScore,
          totalScore,
        });
      }
    }

    const ranked = evaluated
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));

    await aiEvaluationResults.createMany(ranked);

    return {
      setting,
      results: ranked,
    };
  },
};
