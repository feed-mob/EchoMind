import { comments, ideas, users } from "../../../../packages/db/index.js";
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

  async listComments(req: Request) {
    const request = req as RequestWithParams<{ id: string }>;
    const idea = await ideas.findById(request.params.id);
    if (!idea) {
      return Response.json({ error: "Idea not found" }, { status: 404 });
    }

    const result = await comments.listByIdea(request.params.id);
    return Response.json(result);
  },

  async createComment(req: Request) {
    const request = req as RequestWithParams<{ id: string }>;
    const data = (await req.json()) as {
      content?: string;
      authorId?: string;
    };

    const content = String(data.content || "").trim();
    const authorId = String(data.authorId || "").trim();
    if (!content) {
      return Response.json({ error: "content is required" }, { status: 400 });
    }
    if (!authorId) {
      return Response.json({ error: "authorId is required" }, { status: 400 });
    }

    const [idea, author] = await Promise.all([
      ideas.findById(request.params.id),
      users.findById(authorId),
    ]);
    if (!idea) {
      return Response.json({ error: "Idea not found" }, { status: 404 });
    }
    if (!author) {
      return Response.json({ error: "Author not found" }, { status: 404 });
    }

    const comment = await comments.create({
      content,
      authorId,
      ideaId: request.params.id,
    });
    return Response.json(comment, { status: 201 });
  },

  async updateComment(req: Request) {
    const request = req as RequestWithParams<{ id: string }>;
    const data = (await req.json()) as {
      content?: string;
      authorId?: string;
    };

    const content = String(data.content || "").trim();
    const authorId = String(data.authorId || "").trim();
    if (!content) {
      return Response.json({ error: "content is required" }, { status: 400 });
    }
    if (!authorId) {
      return Response.json({ error: "authorId is required" }, { status: 400 });
    }

    const comment = await comments.findById(request.params.id);
    if (!comment) {
      return Response.json({ error: "Comment not found" }, { status: 404 });
    }
    if (comment.authorId !== authorId) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await comments.update(request.params.id, { content });
    return Response.json(updated);
  },

  async deleteComment(req: Request) {
    const request = req as RequestWithParams<{ id: string }>;
    const data = (await req.json().catch(() => ({}))) as {
      authorId?: string;
    };

    const authorId = String(data.authorId || "").trim();
    if (!authorId) {
      return Response.json({ error: "authorId is required" }, { status: 400 });
    }

    const comment = await comments.findById(request.params.id);
    if (!comment) {
      return Response.json({ error: "Comment not found" }, { status: 404 });
    }
    if (comment.authorId !== authorId) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    await comments.delete(request.params.id);
    return Response.json({ success: true });
  },
};
