import { aiEvaluationSettingsController } from "../controllers";

export const aiEvaluationSettingsRoutes = {
  "/api/groups/:id/ai-evaluation-settings": {
    GET: aiEvaluationSettingsController.listByGroup,
    POST: aiEvaluationSettingsController.create,
  },
  "/api/ai-evaluation-settings/:id": {
    GET: aiEvaluationSettingsController.getById,
  },
  "/api/ai-evaluation-settings/:id/results": {
    GET: aiEvaluationSettingsController.listResultsBySetting,
  },
};
