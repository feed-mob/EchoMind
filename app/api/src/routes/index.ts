import { usersRoutes } from "./users.routes";
import { groupsRoutes } from "./groups.routes";
import { ideasRoutes } from "./ideas.routes";
import { goalsRoutes } from "./goals.routes";
import { aiEvaluationSettingsRoutes } from "./aiEvaluationSettings.routes";
import { healthRoutes } from "./health.routes";

export const routes = {
  ...healthRoutes,
  ...usersRoutes,
  ...groupsRoutes,
  ...ideasRoutes,
  ...goalsRoutes,
  ...aiEvaluationSettingsRoutes,
};
