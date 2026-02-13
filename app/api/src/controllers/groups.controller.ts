import { groups, groupMembers, groupInvitations, users } from "../../../../packages/db";

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
    const data = await req.json();
    const group = await groups.create(data);
    return Response.json(group, { status: 201 });
  },

  async getById(req: Request) {
    const group = await groups.findById(req.params.id);
    if (!group) {
      return Response.json({ error: "Group not found" }, { status: 404 });
    }
    return Response.json(group);
  },

  async update(req: Request) {
    const data = await req.json();
    await groups.update(req.params.id, data);
    const updated = await groups.findById(req.params.id);
    return Response.json(updated);
  },

  async delete(req: Request) {
    await groups.delete(req.params.id);
    return Response.json({ success: true });
  },

  async getMembers(req: Request) {
    const members = await groupMembers.listByGroup(req.params.id);
    return Response.json(members);
  },

  async addMember(req: Request) {
    const data = (await req.json()) as { userId: string; role?: string };
    const member = await groupMembers.add({
      ...data,
      groupId: req.params.id,
    });
    return Response.json(member, { status: 201 });
  },

  async removeMember(req: Request) {
    await groupMembers.remove(req.params.userId, req.params.groupId);
    return Response.json({ success: true });
  },

  async listInvitations(req: Request) {
    const invitations = await groupInvitations.listByGroup(req.params.id);
    return Response.json(invitations);
  },

  async inviteByEmail(req: Request) {
    const data = (await req.json()) as { email?: string; invitedByUserId?: string };
    if (!data?.email || !String(data.email).trim()) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    const email = normalizeEmail(String(data.email));
    const user = await users.findByEmail(email);

    if (user) {
      const member = await groupMembers.add({
        groupId: req.params.id,
        userId: user.id,
      });
      await groupInvitations.removeByGroupAndEmail(req.params.id, email);

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
      groupId: req.params.id,
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
    const settings = await groups.getSettings(req.params.id);
    if (!settings) {
      return Response.json({ error: "Group not found" }, { status: 404 });
    }
    return Response.json(settings);
  },

  async updateSettings(req: Request) {
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
      const updated = await groups.updateSettings(req.params.id, {
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
