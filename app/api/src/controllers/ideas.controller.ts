import { ideas } from "../../../../packages/db";

export const ideasController = {
  async listByGroup(req: Request) {
    const groupIdeas = await ideas.listByGroup(req.params.id);
    return Response.json(groupIdeas);
  },

  async create(req: Request) {
    const data = await req.json();
    const idea = await ideas.create({
      ...data,
      groupId: req.params.id,
    });
    return Response.json(idea, { status: 201 });
  },

  async getById(req: Request) {
    const idea = await ideas.findById(req.params.id);
    if (!idea) {
      return Response.json({ error: "Idea not found" }, { status: 404 });
    }
    return Response.json(idea);
  },

  async update(req: Request) {
    const data = await req.json();
    await ideas.update(req.params.id, data);
    const updated = await ideas.findById(req.params.id);
    return Response.json(updated);
  },

  async delete(req: Request) {
    await ideas.delete(req.params.id);
    return Response.json({ success: true });
  },
};
