import { groups, groupMembers } from "../../../../packages/db";

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
    const data = await req.json();
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
};
