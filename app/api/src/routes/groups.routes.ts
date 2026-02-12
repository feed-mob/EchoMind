import { groupsController } from "../controllers";

export const groupsRoutes = {
  "/api/groups": {
    GET: groupsController.list,
    POST: groupsController.create,
  },
  "/api/groups/:id": {
    GET: groupsController.getById,
    PUT: groupsController.update,
    DELETE: groupsController.delete,
  },
  "/api/groups/:id/members": {
    GET: groupsController.getMembers,
    POST: groupsController.addMember,
  },
  "/api/groups/:groupId/members/:userId": {
    DELETE: groupsController.removeMember,
  },
};
