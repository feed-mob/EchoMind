import { groups, groupMembers, groupInvitations, users } from "../../../packages/db/index.js";
type RequestWithParams<T extends Record<string, string>> = Request & { params: T };

const ALLOWED_WORKSPACE_VISIBILITY = new Set([
  "Members only",
  "Specific groups",
  "Internal organization",
]);

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export const groupsController = {
  async list() {
    const allGroups = await groups.listWithStats();
    return Response.json(allGroups);
  },

  async create(req: Request) {
    const data = (await req.json()) as {
      name: string;
      department?: string;
      icon?: string;
      logo?: string;
      description?: string;
      creatorUserId?: string;
    };

    if (!data.creatorUserId || !String(data.creatorUserId).trim()) {
      return Response.json({ error: "creatorUserId is required" }, { status: 400 });
    }

    const creatorUserId = String(data.creatorUserId).trim();
    const creator = await users.findById(creatorUserId);
    if (!creator) {
      return Response.json({ error: "Creator user not found" }, { status: 404 });
    }

    const group = await groups.create({
      ...data,
      creatorUserId,
    });
    return Response.json(group, { status: 201 });
  },

  async getById(req: Request) {
    const request = req as RequestWithParams<{ id: string }>;
    const group = await groups.findById(request.params.id);
    if (!group) {
      return Response.json({ error: "Group not found" }, { status: 404 });
    }
    return Response.json(group);
  },

  async update(req: Request) {
    const request = req as RequestWithParams<{ id: string }>;
    const data = (await req.json()) as {
      name?: string;
      department?: string;
      icon?: string;
      logo?: string;
      description?: string;
      status?: string;
    };
    await groups.update(request.params.id, data);
    const updated = await groups.findById(request.params.id);
    return Response.json(updated);
  },

  async delete(req: Request) {
    const request = req as RequestWithParams<{ id: string }>;
    await groups.delete(request.params.id);
    return Response.json({ success: true });
  },

  async getMembers(req: Request) {
    const request = req as RequestWithParams<{ id: string }>;
    const members = await groupMembers.listByGroup(request.params.id);
    return Response.json(members);
  },

  async addMember(req: Request) {
    const request = req as RequestWithParams<{ id: string }>;
    const data = (await req.json()) as { userId: string; role?: string };
    const member = await groupMembers.add({
      ...data,
      groupId: request.params.id,
    });
    return Response.json(member, { status: 201 });
  },

  async removeMember(req: Request) {
    const request = req as RequestWithParams<{ userId: string; groupId: string }>;
    await groupMembers.remove(request.params.userId, request.params.groupId);
    return Response.json({ success: true });
  },

  async listInvitations(req: Request) {
    const request = req as RequestWithParams<{ id: string }>;
    const invitations = await groupInvitations.listByGroup(request.params.id);
    return Response.json(invitations);
  },

  async inviteByEmail(req: Request) {
    const request = req as RequestWithParams<{ id: string }>;
    const data = (await req.json()) as { email?: string; invitedByUserId?: string };
    if (!data?.email || !String(data.email).trim()) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    const email = normalizeEmail(String(data.email));
    const user = await users.findByEmail(email);

    if (user) {
      const member = await groupMembers.add({
        groupId: request.params.id,
        userId: user.id,
      });
      await groupInvitations.removeByGroupAndEmail(request.params.id, email);

      return Response.json(
        {
          type: "existing_user_added",
          user,
          member,
        },
        { status: 201 },
      );
    }

    const invitation = await groupInvitations.createOrRefresh({
      groupId: request.params.id,
      email,
      invitedByUserId: data.invitedByUserId,
    });

    return Response.json(
      {
        type: "invitation_created",
        invitation,
      },
      { status: 201 },
    );
  },

  async getSettings(req: Request) {
    const request = req as RequestWithParams<{ id: string }>;
    const settings = await groups.getSettings(request.params.id);
    if (!settings) {
      return Response.json({ error: "Group not found" }, { status: 404 });
    }
    return Response.json(settings);
  },

  async updateSettings(req: Request) {
    const request = req as RequestWithParams<{ id: string }>;
    const body = (await req.json()) as {
      publicAccessEnabled?: unknown;
      aiCollaborationEnabled?: unknown;
      workspaceVisibility?: unknown;
    };

    if (
      typeof body.publicAccessEnabled !== "boolean" ||
      typeof body.aiCollaborationEnabled !== "boolean" ||
      typeof body.workspaceVisibility !== "string"
    ) {
      return Response.json(
        { error: "Invalid payload for group settings" },
        { status: 400 },
      );
    }

    if (!ALLOWED_WORKSPACE_VISIBILITY.has(body.workspaceVisibility)) {
      return Response.json(
        { error: "Invalid workspaceVisibility value" },
        { status: 400 },
      );
    }

    try {
      const updated = await groups.updateSettings(request.params.id, {
        publicAccessEnabled: body.publicAccessEnabled,
        aiCollaborationEnabled: body.aiCollaborationEnabled,
        workspaceVisibility: body.workspaceVisibility,
      });
      return Response.json(updated);
    } catch {
      return Response.json({ error: "Group not found" }, { status: 404 });
    }
  },
};
