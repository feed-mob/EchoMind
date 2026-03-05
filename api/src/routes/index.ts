import { usersRoutes } from "./users.routes.js";
import { groupsRoutes } from "./groups.routes.js";
import { ideasRoutes } from "./ideas.routes.js";
import { goalsRoutes } from "./goals.routes.js";
import { aiEvaluationSettingsRoutes } from "./aiEvaluationSettings.routes.js";
import { healthRoutes } from "./health.routes.js";

export const routes = {
  ...healthRoutes,
  ...usersRoutes,
  ...groupsRoutes,
  ...ideasRoutes,
  ...goalsRoutes,
  ...aiEvaluationSettingsRoutes,
};
