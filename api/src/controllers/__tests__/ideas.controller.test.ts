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

let ideasController: typeof import("../ideas.controller.ts").ideasController;

beforeAll(async () => {
  ({ ideasController } = await import("../ideas.controller.ts"));
});

beforeEach(() => {
  mock.clearAllMocks();
});

async function jsonBody(response: Response) {
  return (await response.json()) as Record<string, unknown>;
}

describe("ideasController", () => {
  it("getById returns 404 when idea does not exist", async () => {
    dbMock.ideas.findById.mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/ideas/missing") as Request & { params: { id: string } };
    req.params = { id: "missing" };
    const response = await ideasController.getById(req);

    expect(response.status).toBe(404);
    expect(await jsonBody(response)).toEqual({ error: "Idea not found" });
  });

  it("createComment validates required fields", async () => {
    const req1 = new Request("http://localhost/api/ideas/i1/comments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content: "" }),
    }) as Request & { params: { id: string } };
    req1.params = { id: "i1" };

    const response1 = await ideasController.createComment(req1);
    expect(response1.status).toBe(400);
    expect(await jsonBody(response1)).toEqual({ error: "content is required" });

    const req2 = new Request("http://localhost/api/ideas/i1/comments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content: "hello" }),
    }) as Request & { params: { id: string } };
    req2.params = { id: "i1" };

    const response2 = await ideasController.createComment(req2);
    expect(response2.status).toBe(400);
    expect(await jsonBody(response2)).toEqual({ error: "authorId is required" });
  });

  it("createComment returns 404 for missing idea or author", async () => {
    dbMock.ideas.findById.mockResolvedValueOnce(null);
    dbMock.users.findById.mockResolvedValueOnce({ id: "u1", name: "U" });

    const req1 = new Request("http://localhost/api/ideas/i-missing/comments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content: "hello", authorId: "u1" }),
    }) as Request & { params: { id: string } };
    req1.params = { id: "i-missing" };

    const response1 = await ideasController.createComment(req1);
    expect(response1.status).toBe(404);
    expect(await jsonBody(response1)).toEqual({ error: "Idea not found" });

    dbMock.ideas.findById.mockResolvedValueOnce({ id: "i1", title: "Idea" });
    dbMock.users.findById.mockResolvedValueOnce(null);

    const req2 = new Request("http://localhost/api/ideas/i1/comments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content: "hello", authorId: "u-missing" }),
    }) as Request & { params: { id: string } };
    req2.params = { id: "i1" };

    const response2 = await ideasController.createComment(req2);
    expect(response2.status).toBe(404);
    expect(await jsonBody(response2)).toEqual({ error: "Author not found" });
  });

  it("createComment creates comment when payload is valid", async () => {
    dbMock.ideas.findById.mockResolvedValueOnce({ id: "i1", title: "Idea" });
    dbMock.users.findById.mockResolvedValueOnce({ id: "u1", name: "User" });
    dbMock.comments.create.mockResolvedValueOnce({
      id: "c1",
      ideaId: "i1",
      authorId: "u1",
      content: "great idea",
    });

    const req = new Request("http://localhost/api/ideas/i1/comments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content: "  great idea ", authorId: " u1 " }),
    }) as Request & { params: { id: string } };
    req.params = { id: "i1" };

    const response = await ideasController.createComment(req);

    expect(response.status).toBe(201);
    expect(dbMock.comments.create).toHaveBeenCalledWith({
      content: "great idea",
      authorId: "u1",
      ideaId: "i1",
    });
  });

  it("updateComment handles not found and forbidden", async () => {
    const reqBase = {
      method: "PUT",
      headers: { "content-type": "application/json" },
    };

    dbMock.comments.findById.mockResolvedValueOnce(null);
    const req1 = new Request("http://localhost/api/comments/c-missing", {
      ...reqBase,
      body: JSON.stringify({ content: "new", authorId: "u1" }),
    }) as Request & { params: { id: string } };
    req1.params = { id: "c-missing" };
    const response1 = await ideasController.updateComment(req1);
    expect(response1.status).toBe(404);
    expect(await jsonBody(response1)).toEqual({ error: "Comment not found" });

    dbMock.comments.findById.mockResolvedValueOnce({ id: "c1", authorId: "u2" });
    const req2 = new Request("http://localhost/api/comments/c1", {
      ...reqBase,
      body: JSON.stringify({ content: "new", authorId: "u1" }),
    }) as Request & { params: { id: string } };
    req2.params = { id: "c1" };
    const response2 = await ideasController.updateComment(req2);
    expect(response2.status).toBe(403);
    expect(await jsonBody(response2)).toEqual({ error: "Forbidden" });
  });

  it("deleteComment validates author and enforces ownership", async () => {
    const req1 = new Request("http://localhost/api/comments/c1", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    }) as Request & { params: { id: string } };
    req1.params = { id: "c1" };
    const response1 = await ideasController.deleteComment(req1);
    expect(response1.status).toBe(400);
    expect(await jsonBody(response1)).toEqual({ error: "authorId is required" });

    dbMock.comments.findById.mockResolvedValueOnce(null);
    const req2 = new Request("http://localhost/api/comments/c-missing", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ authorId: "u1" }),
    }) as Request & { params: { id: string } };
    req2.params = { id: "c-missing" };
    const response2 = await ideasController.deleteComment(req2);
    expect(response2.status).toBe(404);
    expect(await jsonBody(response2)).toEqual({ error: "Comment not found" });

    dbMock.comments.findById.mockResolvedValueOnce({ id: "c1", authorId: "u2" });
    const req3 = new Request("http://localhost/api/comments/c1", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ authorId: "u1" }),
    }) as Request & { params: { id: string } };
    req3.params = { id: "c1" };
    const response3 = await ideasController.deleteComment(req3);
    expect(response3.status).toBe(403);
    expect(await jsonBody(response3)).toEqual({ error: "Forbidden" });

    dbMock.comments.findById.mockResolvedValueOnce({ id: "c1", authorId: "u1" });
    const req4 = new Request("http://localhost/api/comments/c1", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ authorId: "u1" }),
    }) as Request & { params: { id: string } };
    req4.params = { id: "c1" };
    const response4 = await ideasController.deleteComment(req4);
    expect(response4.status).toBe(200);
    expect(dbMock.comments.delete).toHaveBeenCalledWith("c1");
    expect(await jsonBody(response4)).toEqual({ success: true });
  });
});
