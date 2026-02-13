import { goals } from "../../../../packages/db";

export const goalsController = {
  async listByGroup(req: Request) {
    const groupGoals = await goals.listByGroup(req.params.id);
    return Response.json(groupGoals);
  },

  async create(req: Request) {
    const data = await req.json();
    const goal = await goals.create({
      ...data,
      groupId: req.params.id,
    });
    return Response.json(goal, { status: 201 });
  },

  async getById(req: Request) {
    const goal = await goals.findById(req.params.id);
    if (!goal) {
      return Response.json({ error: "Goal not found" }, { status: 404 });
    }
    return Response.json(goal);
  },

  async update(req: Request) {
    const data = await req.json();
    await goals.update(req.params.id, data);
    const updated = await goals.findById(req.params.id);
    return Response.json(updated);
  },

  async delete(req: Request) {
    await goals.delete(req.params.id);
    return Response.json({ success: true });
  },
};
