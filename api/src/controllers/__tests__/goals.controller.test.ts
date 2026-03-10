import { beforeAll, beforeEach, describe, expect, it, mock } from "bun:test";

const dbMock = {
  db: {},
  initDatabase: mock(() => {}),
  generateId: mock(() => "id-mock"),
  users: {
    list: mock(async () => []),
    findByEmail: mock(async (_email: string) => null),
    create: mock(async (payload: Record<string, unknown>) => ({ id: "u1", ...payload })),
    findById: mock(async (_id: string) => null),
  },
  groups: {
    listWithStats: mock(async () => []),
    create: mock(async (payload: Record<string, unknown>) => ({ id: "g1", ...payload })),
    findById: mock(async (_id: string) => null),
    update: mock(async () => {}),
    delete: mock(async () => {}),
    getSettings: mock(async (_id: string) => null),
    updateSettings: mock(async (_id: string, payload: Record<string, unknown>) => ({ id: _id, ...payload })),
  },
  groupMembers: {
    listByUser: mock(async (_id: string) => []),
    listByGroup: mock(async (_id: string) => []),
    add: mock(async (payload: Record<string, unknown>) => ({ id: "m1", ...payload })),
    remove: mock(async () => {}),
  },
  groupInvitations: {
    consumeByEmail: mock(async () => ({ joinedGroupIds: [] as string[] })),
    listByGroup: mock(async (_id: string) => []),
    removeByGroupAndEmail: mock(async () => {}),
    createOrRefresh: mock(async (payload: Record<string, unknown>) => ({ id: "inv-1", ...payload })),
  },
  ideas: {
    listByGroup: mock(async (_id: string) => []),
    create: mock(async (payload: Record<string, unknown>) => ({ id: "idea-1", ...payload })),
    findById: mock(async (_id: string) => null),
    update: mock(async () => {}),
    delete: mock(async () => {}),
  },
  comments: {
    listByIdea: mock(async (_id: string) => []),
    create: mock(async (payload: Record<string, unknown>) => ({ id: "c1", ...payload })),
    findById: mock(async (_id: string) => null),
    update: mock(async (_id: string, payload: Record<string, unknown>) => ({ id: _id, ...payload })),
    delete: mock(async () => {}),
  },
  goals: {
    listByGroup: mock(async (_id: string) => []),
    create: mock(async (payload: Record<string, unknown>) => ({ id: "goal-1", ...payload })),
    findById: mock(async (_id: string) => null),
    update: mock(async () => {}),
    delete: mock(async () => {}),
  },
  aiEvaluationSettings: {
    listByGroup: mock(async (_id: string) => []),
    create: mock(async (payload: Record<string, unknown>) => ({ id: "setting-1", ...payload })),
    findById: mock(async (_id: string) => null),
  },
  aiEvaluationResults: {
    listBySetting: mock(async (_id: string) => []),
    createMany: mock(async () => {}),
  },
};

const dbIndexJs = new URL("../../../../packages/db/index.js", import.meta.url).pathname;
const dbIndexTs = new URL("../../../../packages/db/index.ts", import.meta.url).pathname;
mock.module(dbIndexJs, () => dbMock);
mock.module(dbIndexTs, () => dbMock);

let goalsController: typeof import("../goals.controller.ts").goalsController;

beforeAll(async () => {
  ({ goalsController } = await import("../goals.controller.ts"));
});

beforeEach(() => {
  mock.clearAllMocks();
});

async function jsonBody(response: Response) {
  return (await response.json()) as Record<string, unknown>;
}

describe("goalsController", () => {
  it("listByGroup returns goals for group", async () => {
    dbMock.goals.listByGroup.mockResolvedValueOnce([{ id: "goal-1", title: "Goal" }]);

    const req = new Request("http://localhost/api/groups/g1/goals") as Request & { params: { id: string } };
    req.params = { id: "g1" };
    const response = await goalsController.listByGroup(req);

    expect(response.status).toBe(200);
    expect(dbMock.goals.listByGroup).toHaveBeenCalledWith("g1");
    expect(await jsonBody(response)).toEqual([{ id: "goal-1", title: "Goal" }]);
  });

  it("create adds groupId and returns 201", async () => {
    const req = new Request("http://localhost/api/groups/g1/goals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Improve retention", description: "Q2", creatorId: "u1" }),
    }) as Request & { params: { id: string } };
    req.params = { id: "g1" };

    const response = await goalsController.create(req);

    expect(response.status).toBe(201);
    expect(dbMock.goals.create).toHaveBeenCalledWith({
      title: "Improve retention",
      description: "Q2",
      creatorId: "u1",
      groupId: "g1",
    });
  });

  it("create returns 400 when creatorId is missing", async () => {
    const req = new Request("http://localhost/api/groups/g1/goals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Improve retention" }),
    }) as Request & { params: { id: string } };
    req.params = { id: "g1" };

    const response = await goalsController.create(req);

    expect(response.status).toBe(400);
    expect(dbMock.goals.create).not.toHaveBeenCalled();
    expect(await jsonBody(response)).toEqual({ error: "creatorId is required" });
  });

  it("getById returns 404 when goal missing", async () => {
    dbMock.goals.findById.mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/goals/missing") as Request & { params: { id: string } };
    req.params = { id: "missing" };
    const response = await goalsController.getById(req);

    expect(response.status).toBe(404);
    expect(await jsonBody(response)).toEqual({ error: "Goal not found" });
  });

  it("update calls update and returns fresh record", async () => {
    dbMock.goals.findById.mockResolvedValueOnce({ id: "goal-1", title: "Updated" });

    const req = new Request("http://localhost/api/goals/goal-1", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Updated" }),
    }) as Request & { params: { id: string } };
    req.params = { id: "goal-1" };

    const response = await goalsController.update(req);

    expect(response.status).toBe(200);
    expect(dbMock.goals.update).toHaveBeenCalledWith("goal-1", { title: "Updated" });
    expect(await jsonBody(response)).toEqual({ id: "goal-1", title: "Updated" });
  });

  it("delete removes goal and returns success", async () => {
    const req = new Request("http://localhost/api/goals/goal-1", {
      method: "DELETE",
    }) as Request & { params: { id: string } };
    req.params = { id: "goal-1" };

    const response = await goalsController.delete(req);

    expect(response.status).toBe(200);
    expect(dbMock.goals.delete).toHaveBeenCalledWith("goal-1");
    expect(await jsonBody(response)).toEqual({ success: true });
  });
});
