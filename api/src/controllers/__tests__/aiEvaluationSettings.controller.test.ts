import { afterAll, beforeEach, describe, expect, it, mock } from "bun:test";
import { aiEvaluationSettingsController } from "../aiEvaluationSettings.controller.ts";
import {
  AiEvaluationServiceError,
  aiEvaluationSettingsService,
} from "../../services/aiEvaluationSettings.service.ts";

const originalService = {
  listByGroup: aiEvaluationSettingsService.listByGroup,
  createAndEvaluate: aiEvaluationSettingsService.createAndEvaluate,
  findById: aiEvaluationSettingsService.findById,
  listResultsBySetting: aiEvaluationSettingsService.listResultsBySetting,
};

const listByGroupMock = mock(async (_groupId: string) => []);
const createAndEvaluateMock = mock(async (_input: Record<string, unknown>) => ({
  setting: { id: "s1" },
  results: [],
}));
const findByIdMock = mock(async (_id: string) => null);
const listResultsBySettingMock = mock(async (_id: string) => []);

beforeEach(() => {
  mock.clearAllMocks();
  aiEvaluationSettingsService.listByGroup = listByGroupMock;
  aiEvaluationSettingsService.createAndEvaluate = createAndEvaluateMock;
  aiEvaluationSettingsService.findById = findByIdMock;
  aiEvaluationSettingsService.listResultsBySetting = listResultsBySettingMock;
});

afterAll(() => {
  aiEvaluationSettingsService.listByGroup = originalService.listByGroup;
  aiEvaluationSettingsService.createAndEvaluate = originalService.createAndEvaluate;
  aiEvaluationSettingsService.findById = originalService.findById;
  aiEvaluationSettingsService.listResultsBySetting = originalService.listResultsBySetting;
});

async function jsonBody(response: Response) {
  return (await response.json()) as Record<string, unknown>;
}

describe("aiEvaluationSettingsController", () => {
  it("listByGroup returns settings", async () => {
    listByGroupMock.mockResolvedValueOnce([{ id: "s1", groupId: "g1" }]);

    const req = new Request("http://localhost/api/groups/g1/ai-evaluation-settings") as Request & {
      params: { id: string };
    };
    req.params = { id: "g1" };

    const response = await aiEvaluationSettingsController.listByGroup(req);

    expect(response.status).toBe(200);
    expect(listByGroupMock).toHaveBeenCalledWith("g1");
    expect(await jsonBody(response)).toEqual([{ id: "s1", groupId: "g1" }]);
  });

  it("create returns 201 on success", async () => {
    createAndEvaluateMock.mockResolvedValueOnce({
      setting: { id: "s1" },
      results: [{ ideaId: "i1", rank: 1 }],
    });

    const req = new Request("http://localhost/api/groups/g1/ai-evaluation-settings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        goalId: "goal1",
        model: "gemini-2.5-flash",
        impactWeight: 40,
        feasibilityWeight: 30,
        originalityWeight: 30,
        selectedIdeaIds: ["i1"],
      }),
    }) as Request & { params: { id: string } };
    req.params = { id: "g1" };

    const response = await aiEvaluationSettingsController.create(req);

    expect(response.status).toBe(201);
    expect(createAndEvaluateMock).toHaveBeenCalledWith({
      groupId: "g1",
      goalId: "goal1",
      model: "gemini-2.5-flash",
      impactWeight: 40,
      feasibilityWeight: 30,
      originalityWeight: 30,
      selectedIdeaIds: ["i1"],
    });
  });

  it("create maps AiEvaluationServiceError to response", async () => {
    createAndEvaluateMock.mockRejectedValueOnce(
      new AiEvaluationServiceError("No valid ideas selected", 400),
    );

    const req = new Request("http://localhost/api/groups/g1/ai-evaluation-settings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ goalId: "goal1", selectedIdeaIds: [] }),
    }) as Request & { params: { id: string } };
    req.params = { id: "g1" };

    const response = await aiEvaluationSettingsController.create(req);

    expect(response.status).toBe(400);
    expect(await jsonBody(response)).toEqual({ error: "No valid ideas selected" });
  });

  it("create rethrows unknown errors", async () => {
    createAndEvaluateMock.mockRejectedValueOnce(new Error("boom"));

    const req = new Request("http://localhost/api/groups/g1/ai-evaluation-settings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ goalId: "goal1", selectedIdeaIds: ["i1"] }),
    }) as Request & { params: { id: string } };
    req.params = { id: "g1" };

    await expect(aiEvaluationSettingsController.create(req)).rejects.toThrow("boom");
  });

  it("getById returns 404 when setting does not exist", async () => {
    findByIdMock.mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/ai-evaluation-settings/missing") as Request & {
      params: { id: string };
    };
    req.params = { id: "missing" };

    const response = await aiEvaluationSettingsController.getById(req);

    expect(response.status).toBe(404);
    expect(await jsonBody(response)).toEqual({ error: "AI evaluation setting not found" });
  });

  it("listResultsBySetting returns results", async () => {
    listResultsBySettingMock.mockResolvedValueOnce([{ ideaId: "i1", rank: 1 }]);

    const req = new Request("http://localhost/api/ai-evaluation-settings/s1/results") as Request & {
      params: { id: string };
    };
    req.params = { id: "s1" };

    const response = await aiEvaluationSettingsController.listResultsBySetting(req);

    expect(response.status).toBe(200);
    expect(listResultsBySettingMock).toHaveBeenCalledWith("s1");
    expect(await jsonBody(response)).toEqual([{ ideaId: "i1", rank: 1 }]);
  });
});
