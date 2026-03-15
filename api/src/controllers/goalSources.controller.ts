import { goals, goalSources } from "../../../packages/db/index.js";

type RequestWithParams<T extends Record<string, string>> = Request & { params: T };

export const goalSourcesController = {
  async listByGoal(req: Request) {
    const request = req as RequestWithParams<{ id: string }>;
    const goal = await goals.findById(request.params.id);
    if (!goal) {
      return Response.json({ error: "Goal not found" }, { status: 404 });
    }
    const sources = await goalSources.listByGoal(request.params.id);
    return Response.json(sources);
  },

  async create(req: Request) {
    const request = req as RequestWithParams<{ id: string }>;
    const goal = await goals.findById(request.params.id);
    if (!goal) {
      return Response.json({ error: "Goal not found" }, { status: 404 });
    }
    const data = (await req.json()) as {
      type: string;
      title: string;
      description?: string;
      metadata?: unknown;
    };
    if (!data.type || !data.title) {
      return Response.json({ error: "Type and title are required" }, { status: 400 });
    }
    const source = await goalSources.create({
      goalId: request.params.id,
      type: data.type,
      title: data.title,
      description: data.description,
      metadata: data.metadata,
    });
    return Response.json(source, { status: 201 });
  },

  async getById(req: Request) {
    const request = req as RequestWithParams<{ id: string }>;
    const source = await goalSources.findById(request.params.id);
    if (!source) {
      return Response.json({ error: "Source not found" }, { status: 404 });
    }
    return Response.json(source);
  },

  async update(req: Request) {
    const request = req as RequestWithParams<{ id: string }>;
    const source = await goalSources.findById(request.params.id);
    if (!source) {
      return Response.json({ error: "Source not found" }, { status: 404 });
    }
    const data = (await req.json()) as {
      title?: string;
      description?: string;
      metadata?: unknown;
    };
    await goalSources.update(request.params.id, data);
    const updated = await goalSources.findById(request.params.id);
    return Response.json(updated);
  },

  async delete(req: Request) {
    const request = req as RequestWithParams<{ id: string }>;
    const source = await goalSources.findById(request.params.id);
    if (!source) {
      return Response.json({ error: "Source not found" }, { status: 404 });
    }
    await goalSources.delete(request.params.id);
    return Response.json({ success: true });
  },
};
