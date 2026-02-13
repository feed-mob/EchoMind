import { usersController } from "../controllers";

export const usersRoutes = {
  "/api/users": {
    GET: usersController.list,
    POST: usersController.create,
  },
  "/api/users/login": {
    POST: usersController.login,
  },
  "/api/users/:id": {
    GET: usersController.getById,
  },
  "/api/users/:id/groups": {
    GET: usersController.getUserGroups,
  },
};
