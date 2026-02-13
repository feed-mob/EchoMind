import { ideasController } from "../controllers/index.js";

export const ideasRoutes = {
  "/api/groups/:id/ideas": {
    GET: ideasController.listByGroup,
    POST: ideasController.create,
  },
  "/api/ideas/:id": {
    GET: ideasController.getById,
    PUT: ideasController.update,
    DELETE: ideasController.delete,
  },
};
