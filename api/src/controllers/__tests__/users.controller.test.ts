import { afterAll, beforeAll, beforeEach, describe, expect, it, mock } from "bun:test";

const dbMock = {
  db: {},
  initDatabase: mock(() => {}),
  generateId: mock(() => "id-mock"),
  users: {
    list: mock(async () => []),
    findByEmail: mock(async (_email: string) => null),
    create: mock(async (_data: { email: string; name?: string; avatar?: string }) => ({
      id: "u-new",
      email: _data.email,
      name: _data.name,
      avatar: _data.avatar,
    })),
    findById: mock(async (_id: string) => null),
  },
  groupMembers: {
    listByUser: mock(async (_userId: string) => []),
  },
  groups: {
    listWithStats: mock(async () => []),
    create: mock(async (data: Record<string, unknown>) => ({ id: "g1", ...data })),
    findById: mock(async (_id: string) => null),
    update: mock(async () => {}),
    delete: mock(async () => {}),
    getSettings: mock(async (_id: string) => null),
    updateSettings: mock(async (_id: string, payload: Record<string, unknown>) => ({
      id: _id,
      ...payload,
    })),
  },
  groupInvitations: {
    consumeByEmail: mock(async () => ({ joinedGroupIds: [] as string[] })),
    listByGroup: mock(async (_id: string) => []),
    removeByGroupAndEmail: mock(async () => {}),
    createOrRefresh: mock(async (payload: Record<string, unknown>) => ({
      id: "inv-1",
      ...payload,
    })),
  },
  ideas: {
    listByGroup: mock(async (_groupId: string) => []),
    create: mock(async (payload: Record<string, unknown>) => ({ id: "idea-1", ...payload })),
    findById: mock(async (_id: string) => null),
    update: mock(async () => {}),
    delete: mock(async () => {}),
  },
  comments: {
    listByIdea: mock(async (_ideaId: string) => []),
    create: mock(async (payload: Record<string, unknown>) => ({ id: "comment-1", ...payload })),
    findById: mock(async (_id: string) => null),
    update: mock(async (_id: string, payload: Record<string, unknown>) => ({ id: _id, ...payload })),
    delete: mock(async () => {}),
  },
  goals: {
    listByGroup: mock(async (_groupId: string) => []),
    create: mock(async (payload: Record<string, unknown>) => ({ id: "goal-1", ...payload })),
    findById: mock(async (_id: string) => null),
    update: mock(async () => {}),
    delete: mock(async () => {}),
  },
  aiEvaluationSettings: {
    listByGroup: mock(async (_groupId: string) => []),
    create: mock(async (payload: Record<string, unknown>) => ({ id: "setting-1", ...payload })),
    findById: mock(async (_id: string) => null),
  },
  aiEvaluationResults: {
    listBySetting: mock(async (_settingId: string) => []),
    createMany: mock(async () => {}),
  },
};

const dbIndexJs = new URL("../../../../packages/db/index.js", import.meta.url).pathname;
const dbIndexTs = new URL("../../../../packages/db/index.ts", import.meta.url).pathname;
mock.module(dbIndexJs, () => dbMock);
mock.module(dbIndexTs, () => dbMock);

let usersController: typeof import("../users.controller.ts").usersController;
const originalFetch = globalThis.fetch;

beforeAll(async () => {
  ({ usersController } = await import("../users.controller.ts"));
});

beforeEach(() => {
  mock.clearAllMocks();
  delete process.env.GOOGLE_CLIENT_ID;
  delete process.env.VITE_GOOGLE_CLIENT_ID;
});

afterAll(() => {
  globalThis.fetch = originalFetch;
});

async function jsonBody(response: Response) {
  return (await response.json()) as Record<string, unknown>;
}

describe("usersController", () => {
  it("create returns 400 when email is missing", async () => {
    const response = await usersController.create(
      new Request("http://localhost/api/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "No Email" }),
      }),
    );

    expect(response.status).toBe(400);
    expect(await jsonBody(response)).toEqual({ error: "Email is required" });
  });

  it("create creates new user with normalized email", async () => {
    dbMock.users.findByEmail.mockResolvedValueOnce(null);
    dbMock.groupInvitations.consumeByEmail.mockResolvedValueOnce({
      joinedGroupIds: ["g1"],
    });

    const response = await usersController.create(
      new Request("http://localhost/api/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: "  TEST@EXAMPLE.COM ", name: "Test" }),
      }),
    );

    expect(response.status).toBe(201);
    expect(dbMock.users.create).toHaveBeenCalledWith({
      email: "test@example.com",
      name: "Test",
      avatar: undefined,
    });
    expect(await jsonBody(response)).toEqual({
      user: {
        id: "u-new",
        email: "test@example.com",
        name: "Test",
        avatar: undefined,
      },
      isNewUser: true,
      joinedGroupIds: ["g1"],
    });
  });

  it("create returns 200 for existing user", async () => {
    dbMock.users.findByEmail.mockResolvedValueOnce({
      id: "u1",
      email: "existing@example.com",
      name: "Existing",
      avatar: null,
    });

    const response = await usersController.create(
      new Request("http://localhost/api/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: "existing@example.com" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(dbMock.users.create).not.toHaveBeenCalled();
    expect(await jsonBody(response)).toEqual({
      user: {
        id: "u1",
        email: "existing@example.com",
        name: "Existing",
        avatar: null,
      },
      isNewUser: false,
      joinedGroupIds: [],
    });
  });

  it("googleLogin returns 400 when credential is missing", async () => {
    const response = await usersController.googleLogin(
      new Request("http://localhost/api/users/google-login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(400);
    expect(await jsonBody(response)).toEqual({ error: "Google credential is required" });
  });

  it("googleLogin returns 401 for invalid token", async () => {
    globalThis.fetch = mock(async () => new Response("", { status: 401 })) as typeof fetch;

    const response = await usersController.googleLogin(
      new Request("http://localhost/api/users/google-login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ credential: "bad-token" }),
      }),
    );

    expect(response.status).toBe(401);
    expect(await jsonBody(response)).toEqual({ error: "Invalid Google token" });
  });

  it("googleLogin returns 401 when audience mismatches configured client id", async () => {
    process.env.GOOGLE_CLIENT_ID = "expected-client-id";
    globalThis.fetch = mock(async () =>
      Response.json({
        email: "test@example.com",
        email_verified: true,
        name: "Google User",
        aud: "another-client-id",
      }),
    ) as typeof fetch;

    const response = await usersController.googleLogin(
      new Request("http://localhost/api/users/google-login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ credential: "token" }),
      }),
    );

    expect(response.status).toBe(401);
    expect(await jsonBody(response)).toEqual({
      error: "Google token audience mismatch",
    });
  });

  it("getById returns 404 when user does not exist", async () => {
    dbMock.users.findById.mockResolvedValueOnce(null);

    const request = new Request("http://localhost/api/users/u404", { method: "GET" }) as Request & {
      params: { id: string };
    };
    request.params = { id: "u404" };

    const response = await usersController.getById(request);

    expect(response.status).toBe(404);
    expect(await jsonBody(response)).toEqual({ error: "User not found" });
  });
});
