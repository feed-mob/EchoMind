import { AiEvaluationServiceError, aiEvaluationSettingsService } from "../services/aiEvaluationSettings.service";

type CreateSettingBody = {
  goalId: string;
  model: string;
  impactWeight: number;
  feasibilityWeight: number;
  originalityWeight: number;
  selectedIdeaIds: string[];
};

export const aiEvaluationSettingsController = {
  async listByGroup(req: Request) {
    const request = req as Request & { params: { id: string } };
    const settings = await aiEvaluationSettingsService.listByGroup(request.params.id);
    return Response.json(settings);
  },

  async create(req: Request) {
    const request = req as Request & { params: { id: string } };
    const data = (await req.json()) as CreateSettingBody;

    try {
      const result = await aiEvaluationSettingsService.createAndEvaluate({
        groupId: request.params.id,
        goalId: data.goalId,
        model: data.model,
        impactWeight: data.impactWeight,
        feasibilityWeight: data.feasibilityWeight,
        originalityWeight: data.originalityWeight,
        selectedIdeaIds: data.selectedIdeaIds,
      });

      return Response.json(result, { status: 201 });
    } catch (error) {
      if (error instanceof AiEvaluationServiceError) {
        return Response.json({ error: error.message }, { status: error.status });
      }
      throw error;
    }
  },

  async getById(req: Request) {
    const request = req as Request & { params: { id: string } };
    const setting = await aiEvaluationSettingsService.findById(request.params.id);
    if (!setting) {
      return Response.json({ error: "AI evaluation setting not found" }, { status: 404 });
    }
    return Response.json(setting);
  },

  async listResultsBySetting(req: Request) {
    const request = req as Request & { params: { id: string } };
    const results = await aiEvaluationSettingsService.listResultsBySetting(request.params.id);
    return Response.json(results);
  },
};
