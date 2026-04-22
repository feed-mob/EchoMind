import { beforeAll, beforeEach, describe, expect, it, mock } from "bun:test";

const generateObjectMock = mock(async () => ({
  object: {
    results: [],
  },
}));

const bedrockModelMock = mock((model: string) => ({ provider: "bedrock", model }));
const createAmazonBedrockMock = mock(() => bedrockModelMock);
const fromNodeProviderChainMock = mock(() => mock(async () => ({})));

const dbMock = {
  aiEvaluationSettings: {
    listByGroup: mock(async (_groupId: string) => []),
    findById: mock(async (_id: string) => null),
    create: mock(async (payload: Record<string, unknown>) => ({ id: "setting-1", ...payload })),
  },
  aiEvaluationResults: {
    listBySetting: mock(async (_id: string) => []),
    createMany: mock(async (_items: unknown[]) => {}),
  },
  goals: {
    findById: mock(async (_id: string) => null),
  },
  ideas: {
    listByGroup: mock(async (_groupId: string) => []),
  },
};

mock.module("ai", () => ({
  generateObject: generateObjectMock,
}));

mock.module("@ai-sdk/amazon-bedrock", () => ({
  createAmazonBedrock: createAmazonBedrockMock,
}));

mock.module("@aws-sdk/credential-providers", () => ({
  fromNodeProviderChain: fromNodeProviderChainMock,
}));

const dbIndexJs = new URL("../../../../packages/db/index.js", import.meta.url).pathname;
const dbIndexTs = new URL("../../../../packages/db/index.ts", import.meta.url).pathname;
mock.module(dbIndexJs, () => dbMock);
mock.module(dbIndexTs, () => dbMock);

let aiEvaluationSettingsService: typeof import("../aiEvaluationSettings.service.ts").aiEvaluationSettingsService;
let AiEvaluationServiceError: typeof import("../aiEvaluationSettings.service.ts").AiEvaluationServiceError;

beforeAll(async () => {
  process.env.BEDROCK_MODEL_ID = "amazon.nova-lite-v1:0";

  ({ aiEvaluationSettingsService, AiEvaluationServiceError } = await import(
    "../aiEvaluationSettings.service.ts"
  ));
});

beforeEach(() => {
  mock.clearAllMocks();
});

const validInput = {
  groupId: "g1",
  goalId: "goal1",
  model: "gemini-1.5-pro",
  impactWeight: 40,
  feasibilityWeight: 30,
  originalityWeight: 30,
  selectedIdeaIds: ["idea-1", "idea-2"],
};

describe("aiEvaluationSettingsService.createAndEvaluate", () => {
  it("throws 400 when weights do not add up to 100", async () => {
    await expect(
      aiEvaluationSettingsService.createAndEvaluate({
        ...validInput,
        impactWeight: 60,
      }),
    ).rejects.toMatchObject({
      name: "AiEvaluationServiceError",
      status: 400,
      message: "impactWeight + feasibilityWeight + originalityWeight must equal 100",
    });
  });

  it("throws 404 when goal does not belong to group", async () => {
    dbMock.goals.findById.mockResolvedValueOnce({
      id: "goal1",
      groupId: "another-group",
      title: "Goal",
      description: "desc",
    });

    await expect(aiEvaluationSettingsService.createAndEvaluate(validInput)).rejects.toMatchObject({
      name: "AiEvaluationServiceError",
      status: 404,
      message: "Goal not found in this group",
    });
  });

  it("throws 400 when selected ideas are not in group", async () => {
    dbMock.goals.findById.mockResolvedValueOnce({
      id: "goal1",
      groupId: "g1",
      title: "Improve onboarding",
      description: "desc",
      successMetrics: null,
      constraints: null,
    });
    dbMock.ideas.listByGroup.mockResolvedValueOnce([{ id: "idea-x", title: "X", content: "X" }]);

    await expect(aiEvaluationSettingsService.createAndEvaluate(validInput)).rejects.toMatchObject({
      status: 400,
      message: "No valid ideas selected",
    });
  });

  it("creates setting, evaluates ideas in batches, ranks by total score", async () => {
    dbMock.goals.findById.mockResolvedValueOnce({
      id: "goal1",
      groupId: "g1",
      title: "Improve onboarding",
      description: "Cut first-use drop-off",
      successMetrics: { activationRate: ">= 45%" },
      constraints: { budget: "low" },
    });

    const allIdeas = [
      { id: "idea-1", title: "Idea 1", content: "One" },
      { id: "idea-2", title: "Idea 2", content: "Two" },
      { id: "idea-3", title: "Idea 3", content: "Three" },
      { id: "idea-4", title: "Idea 4", content: "Four" },
      { id: "idea-5", title: "Idea 5", content: "Five" },
      { id: "idea-6", title: "Idea 6", content: "Six" },
    ];
    dbMock.ideas.listByGroup.mockResolvedValueOnce(allIdeas);

    const selectedIds = allIdeas.map((item) => item.id);

    generateObjectMock
      .mockResolvedValueOnce({
        object: {
          results: [
            {
              id: "idea-1",
              review: "Strong potential with clear execution path and measurable business impact.",
              impactScore: 50,
              feasibilityScore: 30,
              originalityScore: 20,
            },
            {
              id: "idea-2",
              review: "Decent idea but operational complexity is high compared with expected returns.",
              impactScore: 20,
              feasibilityScore: 20,
              originalityScore: 20,
            },
            {
              id: "idea-3",
              review: "Promising in niche segments and practical under current resource constraints.",
              impactScore: 35,
              feasibilityScore: 35,
              originalityScore: 20,
            },
            {
              id: "idea-4",
              review: "Balanced option that can ship fast and still produce meaningful value.",
              impactScore: 30,
              feasibilityScore: 30,
              originalityScore: 30,
            },
            {
              id: "idea-5",
              review: "Differentiated concept with moderate risk and moderate execution effort.",
              impactScore: 10,
              feasibilityScore: 40,
              originalityScore: 40,
            },
          ],
        },
      })
      .mockResolvedValueOnce({
        object: {
          results: [
            {
              id: "idea-6",
              review: "Very high upside with strong novelty though rollout requires staged validation.",
              impactScore: 60,
              feasibilityScore: 30,
              originalityScore: 30,
            },
          ],
        },
      });

    const result = await aiEvaluationSettingsService.createAndEvaluate({
      ...validInput,
      selectedIdeaIds: selectedIds,
    });

    expect(dbMock.aiEvaluationSettings.create).toHaveBeenCalledWith({
      groupId: "g1",
      goalId: "goal1",
      model: "amazon.nova-lite-v1:0",
      impactWeight: 40,
      feasibilityWeight: 30,
      originalityWeight: 30,
      selectedIdeaIds: selectedIds,
    });

    expect(generateObjectMock).toHaveBeenCalledTimes(2);
    expect(bedrockModelMock).toHaveBeenCalledWith("amazon.nova-lite-v1:0");

    expect(dbMock.aiEvaluationResults.createMany).toHaveBeenCalledTimes(1);
    const persistedResults = dbMock.aiEvaluationResults.createMany.mock.calls[0][0] as Array<{
      ideaId: string;
      totalScore: number;
      rank: number;
    }>;

    expect(persistedResults).toHaveLength(6);
    expect(persistedResults[0].rank).toBe(1);
    expect(persistedResults[5].rank).toBe(6);
    const idea6Result = persistedResults.find((item) => item.ideaId === "idea-6");
    expect(idea6Result).toBeDefined();
    expect(idea6Result?.totalScore).toBe(100);

    expect(result.setting).toMatchObject({
      id: "setting-1",
      model: "amazon.nova-lite-v1:0",
    });
    expect(result.results).toHaveLength(6);
  });

  it("throws 502 when AI response misses an idea result", async () => {
    dbMock.goals.findById.mockResolvedValueOnce({
      id: "goal1",
      groupId: "g1",
      title: "Goal",
      description: "desc",
      successMetrics: null,
      constraints: null,
    });
    dbMock.ideas.listByGroup.mockResolvedValueOnce([
      { id: "idea-1", title: "Idea 1", content: "One" },
      { id: "idea-2", title: "Idea 2", content: "Two" },
    ]);

    generateObjectMock.mockResolvedValueOnce({
      object: {
        results: [
          {
            id: "idea-1",
            review: "Useful concept with clear value proposition and manageable complexity.",
            impactScore: 30,
            feasibilityScore: 30,
            originalityScore: 30,
          },
        ],
      },
    });

    await expect(aiEvaluationSettingsService.createAndEvaluate(validInput)).rejects.toMatchObject({
      status: 502,
      message: "Missing evaluation result for idea idea-2",
    });
  });
});
