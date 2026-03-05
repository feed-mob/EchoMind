import { goals } from "../../../packages/db/index.js";
type RequestWithParams<T extends Record<string, string>> = Request & { params: T };

export const goalsController = {
  async listByGroup(req: Request) {
    const request = req as RequestWithParams<{ id: string }>;
    const groupGoals = await goals.listByGroup(request.params.id);
    return Response.json(groupGoals);
  },

  async create(req: Request) {
    const request = req as RequestWithParams<{ id: string }>;
    const data = (await req.json()) as {
      title: string;
      description?: string;
      status?: string;
      successMetrics?: unknown;
      constraints?: unknown;
      selectedIdeaId?: string | null;
      selectedSettingId?: string | null;
    };
    const goal = await goals.create({
      ...data,
      groupId: request.params.id,
    });
    return Response.json(goal, { status: 201 });
  },

  async getById(req: Request) {
    const request = req as RequestWithParams<{ id: string }>;
    const goal = await goals.findById(request.params.id);
    if (!goal) {
      return Response.json({ error: "Goal not found" }, { status: 404 });
    }
    return Response.json(goal);
  },

  async update(req: Request) {
    const request = req as RequestWithParams<{ id: string }>;
    const data = (await req.json()) as {
      title?: string;
      description?: string;
      status?: string;
      successMetrics?: unknown;
      constraints?: unknown;
      selectedIdeaId?: string | null;
      selectedSettingId?: string | null;
    };
    await goals.update(request.params.id, data);
    const updated = await goals.findById(request.params.id);
    return Response.json(updated);
  },

  async delete(req: Request) {
    const request = req as RequestWithParams<{ id: string }>;
    await goals.delete(request.params.id);
    return Response.json({ success: true });
  },
};
