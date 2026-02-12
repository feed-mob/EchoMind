import { users, groupMembers } from "../../../../packages/db";

export const usersController = {
  async list() {
    const allUsers = await users.list();
    return Response.json(allUsers);
  },

  async create(req: Request) {
    const data = await req.json();
    const user = await users.create(data);
    return Response.json(user, { status: 201 });
  },

  async getById(req: Request) {
    const user = await users.findById(req.params.id);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    return Response.json(user);
  },

  async getUserGroups(req: Request) {
    const userGroups = await groupMembers.listByUser(req.params.id);
    return Response.json(userGroups);
  },
};
