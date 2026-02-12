import { initDatabase, users, groups, groupMembers, ideas } from "../../packages/db";

await initDatabase();

Bun.serve({
  port: 3001,
  routes: {
    // Users
    "/api/users": {
      GET: async () => {
        const allUsers = await users.list();
        return Response.json(allUsers);
      },
      POST: async (req) => {
        const data = await req.json();
        const user = await users.create(data);
        return Response.json(user, { status: 201 });
      },
    },
    "/api/users/:id": {
      GET: async (req) => {
        const user = await users.findById(req.params.id);
        if (!user) return Response.json({ error: "User not found" }, { status: 404 });
        return Response.json(user);
      },
    },

    // Groups
    "/api/groups": {
      GET: async () => {
        const allGroups = await groups.listWithStats();
        return Response.json(allGroups);
      },
      POST: async (req) => {
        const data = await req.json();
        const group = await groups.create(data);
        return Response.json(group, { status: 201 });
      },
    },
    "/api/groups/:id": {
      GET: async (req) => {
        const group = await groups.findById(req.params.id);
        if (!group) return Response.json({ error: "Group not found" }, { status: 404 });
        return Response.json(group);
      },
      PUT: async (req) => {
        const data = await req.json();
        await groups.update(req.params.id, data);
        const updated = await groups.findById(req.params.id);
        return Response.json(updated);
      },
      DELETE: async (req) => {
        await groups.delete(req.params.id);
        return Response.json({ success: true });
      },
    },

    // Group Members
    "/api/groups/:id/members": {
      GET: async (req) => {
        const members = await groupMembers.listByGroup(req.params.id);
        return Response.json(members);
      },
      POST: async (req) => {
        const data = await req.json();
        const member = await groupMembers.add({
          ...data,
          groupId: req.params.id,
        });
        return Response.json(member, { status: 201 });
      },
    },
    "/api/groups/:groupId/members/:userId": {
      DELETE: async (req) => {
        await groupMembers.remove(req.params.userId, req.params.groupId);
        return Response.json({ success: true });
      },
    },

    // Ideas
    "/api/groups/:id/ideas": {
      GET: async (req) => {
        const groupIdeas = await ideas.listByGroup(req.params.id);
        return Response.json(groupIdeas);
      },
      POST: async (req) => {
        const data = await req.json();
        const idea = await ideas.create({
          ...data,
          groupId: req.params.id,
        });
        return Response.json(idea, { status: 201 });
      },
    },
    "/api/ideas/:id": {
      GET: async (req) => {
        const idea = await ideas.findById(req.params.id);
        if (!idea) return Response.json({ error: "Idea not found" }, { status: 404 });
        return Response.json(idea);
      },
      PUT: async (req) => {
        const data = await req.json();
        await ideas.update(req.params.id, data);
        const updated = await ideas.findById(req.params.id);
        return Response.json(updated);
      },
      DELETE: async (req) => {
        await ideas.delete(req.params.id);
        return Response.json({ success: true });
      },
    },

    // User's groups
    "/api/users/:id/groups": {
      GET: async (req) => {
        const userGroups = await groupMembers.listByUser(req.params.id);
        return Response.json(userGroups);
      },
    },
  },
  development: {
    hmr: true,
    console: true,
  },
});

console.log("API server running on http://localhost:3001");
