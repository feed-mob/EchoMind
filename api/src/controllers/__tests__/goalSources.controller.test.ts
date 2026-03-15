import { beforeAll, beforeEach, describe, expect, it, mock } from "bun:test";

const dbMock = {
  db: {},
  initDatabase: mock(() => {}),
  generateId: mock(() => "id-mock"),
  goals: {
    findById: mock(async (_id: string) => null),
  },
  goalSources: {
    listByGoal: mock(async (_goalId: string) => []),
    create: mock(async (payload: Record<string, unknown>) => ({ id: "gs-1", ...payload })),
    findById: mock(async (_id: string) => null),
    update: mock(async () => {}),
    delete: mock(async () => {}),
  },
};

const dbIndexJs = new URL("../../../../packages/db/index.js", import.meta.url).pathname;
const dbIndexTs = new URL("../../../../packages/db/index.ts", import.meta.url).pathname;
mock.module(dbIndexJs, () => dbMock);
mock.module(dbIndexTs, () => dbMock);

let goalSourcesController: typeof import("../goalSources.controller.ts").goalSourcesController;

beforeAll(async () => {
  ({ goalSourcesController } = await import("../goalSources.controller.ts"));
});

beforeEach(() => {
  mock.clearAllMocks();
});

async function jsonBody(response: Response) {
  return (await response.json()) as Record<string, unknown>;
}

describe("goalSourcesController", () => {
  describe("listByGoal", () => {
    it("returns 404 when goal does not exist", async () => {
      dbMock.goals.findById.mockResolvedValueOnce(null);

      const req = new Request("http://localhost/api/goals/goal-1/sources") as Request & { params: { id: string } };
      req.params = { id: "goal-1" };
      const response = await goalSourcesController.listByGoal(req);

      expect(response.status).toBe(404);
      expect(await jsonBody(response)).toEqual({ error: "Goal not found" });
    });

    it("returns sources for a valid goal", async () => {
      dbMock.goals.findById.mockResolvedValueOnce({ id: "goal-1", title: "Test Goal" });
      dbMock.goalSources.listByGoal.mockResolvedValueOnce([
        { id: "gs-1", goalId: "goal-1", type: "ai", title: "AI Analysis" },
      ]);

      const req = new Request("http://localhost/api/goals/goal-1/sources") as Request & { params: { id: string } };
      req.params = { id: "goal-1" };
      const response = await goalSourcesController.listByGoal(req);

      expect(response.status).toBe(200);
      expect(await jsonBody(response)).toEqual([
        { id: "gs-1", goalId: "goal-1", type: "ai", title: "AI Analysis" },
      ]);
    });
  });

  describe("create", () => {
    it("returns 404 when goal does not exist", async () => {
      dbMock.goals.findById.mockResolvedValueOnce(null);

      const req = new Request("http://localhost/api/goals/goal-1/sources", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type: "ai", title: "AI Analysis" }),
      }) as Request & { params: { id: string } };
      req.params = { id: "goal-1" };
      const response = await goalSourcesController.create(req);

      expect(response.status).toBe(404);
      expect(await jsonBody(response)).toEqual({ error: "Goal not found" });
    });

    it("returns 400 when type is missing", async () => {
      dbMock.goals.findById.mockResolvedValueOnce({ id: "goal-1", title: "Test Goal" });

      const req = new Request("http://localhost/api/goals/goal-1/sources", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: "AI Analysis" }),
      }) as Request & { params: { id: string } };
      req.params = { id: "goal-1" };
      const response = await goalSourcesController.create(req);

      expect(response.status).toBe(400);
      expect(await jsonBody(response)).toEqual({ error: "Type and title are required" });
    });

    it("creates a source with valid data", async () => {
      dbMock.goals.findById.mockResolvedValueOnce({ id: "goal-1", title: "Test Goal" });
      dbMock.goalSources.create.mockResolvedValueOnce({
        id: "gs-1",
        goalId: "goal-1",
        type: "ai",
        title: "AI Analysis",
        description: "An AI generated analysis",
      });

      const req = new Request("http://localhost/api/goals/goal-1/sources", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: "ai",
          title: "AI Analysis",
          description: "An AI generated analysis",
        }),
      }) as Request & { params: { id: string } };
      req.params = { id: "goal-1" };
      const response = await goalSourcesController.create(req);

      expect(response.status).toBe(201);
      expect(await jsonBody(response)).toEqual({
        id: "gs-1",
        goalId: "goal-1",
        type: "ai",
        title: "AI Analysis",
        description: "An AI generated analysis",
      });
    });
  });

  describe("update", () => {
    it("returns 404 when source does not exist", async () => {
      dbMock.goalSources.findById.mockResolvedValueOnce(null);

      const req = new Request("http://localhost/api/goal-sources/gs-1", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: "Updated Title" }),
      }) as Request & { params: { id: string } };
      req.params = { id: "gs-1" };
      const response = await goalSourcesController.update(req);

      expect(response.status).toBe(404);
      expect(await jsonBody(response)).toEqual({ error: "Source not found" });
    });

    it("updates a source with valid data", async () => {
      dbMock.goalSources.findById.mockResolvedValueOnce({
        id: "gs-1",
        goalId: "goal-1",
        type: "ai",
        title: "Old Title",
      });
      dbMock.goalSources.update.mockResolvedValueOnce({});
      dbMock.goalSources.findById.mockResolvedValueOnce({
        id: "gs-1",
        goalId: "goal-1",
        type: "ai",
        title: "Updated Title",
      });

      const req = new Request("http://localhost/api/goal-sources/gs-1", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: "Updated Title" }),
      }) as Request & { params: { id: string } };
      req.params = { id: "gs-1" };
      const response = await goalSourcesController.update(req);

      expect(response.status).toBe(200);
      expect(await jsonBody(response)).toEqual({
        id: "gs-1",
        goalId: "goal-1",
        type: "ai",
        title: "Updated Title",
      });
    });
  });

  describe("delete", () => {
    it("returns 404 when source does not exist", async () => {
      dbMock.goalSources.findById.mockResolvedValueOnce(null);

      const req = new Request("http://localhost/api/goal-sources/gs-1", {
        method: "DELETE",
      }) as Request & { params: { id: string } };
      req.params = { id: "gs-1" };
      const response = await goalSourcesController.delete(req);

      expect(response.status).toBe(404);
      expect(await jsonBody(response)).toEqual({ error: "Source not found" });
    });

    it("deletes a source successfully", async () => {
      dbMock.goalSources.findById.mockResolvedValueOnce({
        id: "gs-1",
        goalId: "goal-1",
        type: "ai",
        title: "AI Analysis",
      });
      dbMock.goalSources.delete.mockResolvedValueOnce({});

      const req = new Request("http://localhost/api/goal-sources/gs-1", {
        method: "DELETE",
      }) as Request & { params: { id: string } };
      req.params = { id: "gs-1" };
      const response = await goalSourcesController.delete(req);

      expect(response.status).toBe(200);
      expect(await jsonBody(response)).toEqual({ success: true });
    });
  });
});
