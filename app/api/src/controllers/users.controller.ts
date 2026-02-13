import { users, groupMembers, groupInvitations } from "../../../../packages/db";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function loginOrCreateUser(payload: { email?: string; name?: string; avatar?: string }) {
  if (!payload.email || !payload.email.trim()) {
    return {
      error: Response.json({ error: "Email is required" }, { status: 400 }),
    };
  }

  const normalizedEmail = normalizeEmail(payload.email);
  let user = await users.findByEmail(normalizedEmail);
  let isNewUser = false;

  if (!user) {
    user = await users.create({
      email: normalizedEmail,
      name: payload.name,
      avatar: payload.avatar,
    });
    isNewUser = true;
  }

  const invitationResult = await groupInvitations.consumeByEmail({
    email: normalizedEmail,
    userId: user.id,
  });

  return {
    user,
    isNewUser,
    joinedGroupIds: invitationResult.joinedGroupIds,
  };
}

export const usersController = {
  async list() {
    const allUsers = await users.list();
    return Response.json(allUsers);
  },

  async create(req: Request) {
    const data = (await req.json()) as { email?: string; name?: string; avatar?: string };
    const result = await loginOrCreateUser(data);
    if ("error" in result) return result.error;
    return Response.json(result, { status: result.isNewUser ? 201 : 200 });
  },

  async login(req: Request) {
    const data = (await req.json()) as { email?: string; name?: string; avatar?: string };
    const result = await loginOrCreateUser(data);
    if ("error" in result) return result.error;
    return Response.json(result);
  },

  async getById(req: Request) {
    const user = await users.findById(req.params.id);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    return Response.json(user);
  },

  async getUserGroups(req: Request) {
    const userGroups = await groupMembers.listByUser(req.params.id);
    return Response.json(userGroups);
  },
};
