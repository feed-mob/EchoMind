import { healthController } from "../controllers";

export const healthRoutes = {
  "/api/health": {
    GET: healthController.check,
  }
};
