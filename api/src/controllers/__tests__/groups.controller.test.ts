import { beforeAll, beforeEach, describe, expect, it, mock } from "bun:test";

const dbMock = {
  db: {},
  initDatabase: mock(() => {}),
  generateId: mock(() => "id-mock"),
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
  groupMembers: {
    listByGroup: mock(async (_id: string) => []),
    add: mock(async (payload: Record<string, unknown>) => ({ id: "m1", ...payload })),
    remove: mock(async () => {}),
  },
  groupInvitations: {
    listByGroup: mock(async (_id: string) => []),
    removeByGroupAndEmail: mock(async () => {}),
    createOrRefresh: mock(async (payload: Record<string, unknown>) => ({
      id: "inv-1",
      ...payload,
    })),
  },
  users: {
    findById: mock(async (_id: string) => null),
    findByEmail: mock(async (_email: string) => null),
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

let groupsController: typeof import("../groups.controller.ts").groupsController;

beforeAll(async () => {
  ({ groupsController } = await import("../groups.controller.ts"));
});

beforeEach(() => {
  mock.clearAllMocks();
});

async function jsonBody(response: Response) {
  return (await response.json()) as Record<string, unknown>;
}

describe("groupsController", () => {
  it("create returns 400 when creatorUserId is missing", async () => {
    const response = await groupsController.create(
      new Request("http://localhost/api/groups", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "A Group" }),
      }),
    );

    expect(response.status).toBe(400);
    expect(await jsonBody(response)).toEqual({ error: "creatorUserId is required" });
  });

  it("create returns 404 when creator does not exist", async () => {
    dbMock.users.findById.mockResolvedValueOnce(null);

    const response = await groupsController.create(
      new Request("http://localhost/api/groups", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "A Group", creatorUserId: "u-missing" }),
      }),
    );

    expect(response.status).toBe(404);
    expect(await jsonBody(response)).toEqual({ error: "Creator user not found" });
  });

  it("inviteByEmail returns 400 when email is blank", async () => {
    const request = new Request("http://localhost/api/groups/g1/invitations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "   " }),
    }) as Request & { params: { id: string } };
    request.params = { id: "g1" };

    const response = await groupsController.inviteByEmail(request);

    expect(response.status).toBe(400);
    expect(await jsonBody(response)).toEqual({ error: "Email is required" });
  });

  it("inviteByEmail adds existing user directly", async () => {
    dbMock.users.findByEmail.mockResolvedValueOnce({
      id: "u1",
      email: "existing@example.com",
    });
    dbMock.groupMembers.add.mockResolvedValueOnce({
      id: "m1",
      userId: "u1",
      groupId: "g1",
    });

    const request = new Request("http://localhost/api/groups/g1/invitations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: " Existing@Example.com " }),
    }) as Request & { params: { id: string } };
    request.params = { id: "g1" };

    const response = await groupsController.inviteByEmail(request);

    expect(response.status).toBe(201);
    expect(dbMock.groupInvitations.removeByGroupAndEmail).toHaveBeenCalledWith(
      "g1",
      "existing@example.com",
    );
    expect(await jsonBody(response)).toEqual({
      type: "existing_user_added",
      user: {
        id: "u1",
        email: "existing@example.com",
      },
      member: {
        id: "m1",
        userId: "u1",
        groupId: "g1",
      },
    });
  });

  it("inviteByEmail creates invitation when user does not exist", async () => {
    dbMock.users.findByEmail.mockResolvedValueOnce(null);
    dbMock.groupInvitations.createOrRefresh.mockResolvedValueOnce({
      id: "inv-42",
      groupId: "g1",
      email: "new@example.com",
    });

    const request = new Request("http://localhost/api/groups/g1/invitations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "new@example.com", invitedByUserId: "u-admin" }),
    }) as Request & { params: { id: string } };
    request.params = { id: "g1" };

    const response = await groupsController.inviteByEmail(request);

    expect(response.status).toBe(201);
    expect(dbMock.groupInvitations.createOrRefresh).toHaveBeenCalledWith({
      groupId: "g1",
      email: "new@example.com",
      invitedByUserId: "u-admin",
    });
    expect(await jsonBody(response)).toEqual({
      type: "invitation_created",
      invitation: {
        id: "inv-42",
        groupId: "g1",
        email: "new@example.com",
      },
    });
  });

  it("updateSettings returns 400 for invalid payload types", async () => {
    const request = new Request("http://localhost/api/groups/g1/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ publicAccessEnabled: "yes", aiCollaborationEnabled: true }),
    }) as Request & { params: { id: string } };
    request.params = { id: "g1" };

    const response = await groupsController.updateSettings(request);

    expect(response.status).toBe(400);
    expect(await jsonBody(response)).toEqual({ error: "Invalid payload for group settings" });
  });

  it("updateSettings returns 400 for unsupported workspaceVisibility", async () => {
    const request = new Request("http://localhost/api/groups/g1/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        publicAccessEnabled: true,
        aiCollaborationEnabled: false,
        workspaceVisibility: "Public",
      }),
    }) as Request & { params: { id: string } };
    request.params = { id: "g1" };

    const response = await groupsController.updateSettings(request);

    expect(response.status).toBe(400);
    expect(await jsonBody(response)).toEqual({ error: "Invalid workspaceVisibility value" });
  });

  it("updateSettings returns 404 when update throws", async () => {
    dbMock.groups.updateSettings.mockRejectedValueOnce(new Error("missing"));

    const request = new Request("http://localhost/api/groups/g404/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        publicAccessEnabled: true,
        aiCollaborationEnabled: false,
        workspaceVisibility: "Members only",
      }),
    }) as Request & { params: { id: string } };
    request.params = { id: "g404" };

    const response = await groupsController.updateSettings(request);

    expect(response.status).toBe(404);
    expect(await jsonBody(response)).toEqual({ error: "Group not found" });
  });

  it("updateSettings updates and returns settings", async () => {
    dbMock.groups.updateSettings.mockResolvedValueOnce({
      id: "g1",
      publicAccessEnabled: false,
      aiCollaborationEnabled: true,
      workspaceVisibility: "Internal organization",
    });

    const request = new Request("http://localhost/api/groups/g1/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        publicAccessEnabled: false,
        aiCollaborationEnabled: true,
        workspaceVisibility: "Internal organization",
      }),
    }) as Request & { params: { id: string } };
    request.params = { id: "g1" };

    const response = await groupsController.updateSettings(request);

    expect(response.status).toBe(200);
    expect(dbMock.groups.updateSettings).toHaveBeenCalledWith("g1", {
      publicAccessEnabled: false,
      aiCollaborationEnabled: true,
      workspaceVisibility: "Internal organization",
    });
    expect(await jsonBody(response)).toEqual({
      id: "g1",
      publicAccessEnabled: false,
      aiCollaborationEnabled: true,
      workspaceVisibility: "Internal organization",
    });
  });
});
