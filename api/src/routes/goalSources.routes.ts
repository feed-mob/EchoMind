import { goalSourcesController } from "../controllers/index.js";

export const goalSourcesRoutes = {
  "/api/goals/:id/sources": {
    GET: goalSourcesController.listByGoal,
    POST: goalSourcesController.create,
  },
  "/api/goal-sources/:id": {
    GET: goalSourcesController.getById,
    PUT: goalSourcesController.update,
    DELETE: goalSourcesController.delete,
  },
};
