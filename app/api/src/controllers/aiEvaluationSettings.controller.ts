import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { aiEvaluationResults, aiEvaluationSettings, goals, ideas } from "../../../../packages/db";

type CreateSettingBody = {
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

const BATCH_SIZE = 5;

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

async function evaluateIdeaWithGoogle(params: {
  model: string;
  goalTitle: string;
  goalDescription: string;
  ideaTitle: string;
  ideaContent: string;
}) {
  const modelName = params.model.startsWith("gemini-") ? params.model : "gemini-1.5-pro";

  const { object } = await generateObject({
    model: google(modelName),
    schema: reviewSchema,
    prompt: `You are evaluating one product idea against one goal.

Goal title: ${params.goalTitle}
Goal description: ${params.goalDescription || "N/A"}

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

async function evaluateIdeasBatchWithGoogle(params: {
  model: string;
  goalTitle: string;
  goalDescription: string;
  ideas: Array<{ id: string; title: string; content: string }>;
}) {
  const modelName = params.model.startsWith("gemini-") ? params.model : "gemini-1.5-pro";

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

  const byId = new Map(
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

  return byId;
}

function chunkIdeas<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export const aiEvaluationSettingsController = {
  async listByGroup(req: Request) {
    const request = req as Request & { params: { id: string } };
    const settings = await aiEvaluationSettings.listByGroup(request.params.id);
    return Response.json(settings);
  },

  async create(req: Request) {
    const request = req as Request & { params: { id: string } };
    const data = (await req.json()) as CreateSettingBody;

    if (!data.goalId || !Array.isArray(data.selectedIdeaIds) || data.selectedIdeaIds.length === 0) {
      return Response.json({ error: "goalId and selectedIdeaIds are required" }, { status: 400 });
    }

    const totalWeight = data.impactWeight + data.feasibilityWeight + data.originalityWeight;
    if (totalWeight !== 100) {
      return Response.json({ error: "impactWeight + feasibilityWeight + originalityWeight must equal 100" }, { status: 400 });
    }

    const goal = await goals.findById(data.goalId);
    if (!goal || goal.groupId !== request.params.id) {
      return Response.json({ error: "Goal not found in this group" }, { status: 404 });
    }

    const groupIdeas = await ideas.listByGroup(request.params.id);
    const selectedIdeaSet = new Set(data.selectedIdeaIds);
    const selectedIdeas = groupIdeas.filter((idea) => selectedIdeaSet.has(idea.id));

    if (selectedIdeas.length === 0) {
      return Response.json({ error: "No valid ideas selected" }, { status: 400 });
    }

    const selectedModel = data.model.startsWith("gemini-") ? data.model : "gemini-1.5-pro";

    const setting = await aiEvaluationSettings.create({
      groupId: request.params.id,
      goalId: data.goalId,
      model: selectedModel,
      impactWeight: data.impactWeight,
      feasibilityWeight: data.feasibilityWeight,
      originalityWeight: data.originalityWeight,
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
            ideaTitle: idea.title,
            ideaContent: idea.content || "",
          }));

        const totalScore = weightedTotal(
          review.impactScore,
          review.feasibilityScore,
          review.originalityScore,
          data.impactWeight,
          data.feasibilityWeight,
          data.originalityWeight,
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

    return Response.json({
      setting,
      results: ranked,
    }, { status: 201 });
  },

  async getById(req: Request) {
    const request = req as Request & { params: { id: string } };
    const setting = await aiEvaluationSettings.findById(request.params.id);
    if (!setting) {
      return Response.json({ error: "AI evaluation setting not found" }, { status: 404 });
    }
    return Response.json(setting);
  },

  async listResultsBySetting(req: Request) {
    const request = req as Request & { params: { id: string } };
    const results = await aiEvaluationResults.listBySetting(request.params.id);
    return Response.json(results);
  },
};
