import { goalsController } from "../controllers";

export const goalsRoutes = {
  "/api/groups/:id/goals": {
    GET: goalsController.listByGroup,
    POST: goalsController.create,
  },
  "/api/goals/:id": {
    GET: goalsController.getById,
    PUT: goalsController.update,
    DELETE: goalsController.delete,
  },
};
