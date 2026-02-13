import { usersRoutes } from "./users.routes";
import { groupsRoutes } from "./groups.routes";
import { ideasRoutes } from "./ideas.routes";
import { goalsRoutes } from "./goals.routes";

export const routes = {
  ...usersRoutes,
  ...groupsRoutes,
  ...ideasRoutes,
  ...goalsRoutes,
};
