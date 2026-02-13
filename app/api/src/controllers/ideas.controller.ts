import { ideas } from "../../../../packages/db";
type RequestWithParams<T extends Record<string, string>> = Request & { params: T };

export const ideasController = {
  async listByGroup(req: Request) {
    const request = req as RequestWithParams<{ id: string }>;
    const groupIdeas = await ideas.listByGroup(request.params.id);
    return Response.json(groupIdeas);
  },

  async create(req: Request) {
    const request = req as RequestWithParams<{ id: string }>;
    const data = (await req.json()) as {
      title: string;
      content?: string;
      status?: string;
      authorId: string;
    };
    const idea = await ideas.create({
      ...data,
      groupId: request.params.id,
    });
    return Response.json(idea, { status: 201 });
  },

  async getById(req: Request) {
    const request = req as RequestWithParams<{ id: string }>;
    const idea = await ideas.findById(request.params.id);
    if (!idea) {
      return Response.json({ error: "Idea not found" }, { status: 404 });
    }
    return Response.json(idea);
  },

  async update(req: Request) {
    const request = req as RequestWithParams<{ id: string }>;
    const data = (await req.json()) as {
      title?: string;
      content?: string;
      status?: string;
    };
    await ideas.update(request.params.id, data);
    const updated = await ideas.findById(request.params.id);
    return Response.json(updated);
  },

  async delete(req: Request) {
    const request = req as RequestWithParams<{ id: string }>;
    await ideas.delete(request.params.id);
    return Response.json({ success: true });
  },
};
