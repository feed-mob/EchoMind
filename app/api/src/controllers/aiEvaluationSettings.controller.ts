import { aiEvaluationSettings } from "../../../../packages/db";

export const aiEvaluationSettingsController = {
  async listByGroup(req: Request) {
    const settings = await aiEvaluationSettings.listByGroup(req.params.id);
    return Response.json(settings);
  },

  async create(req: Request) {
    const data = await req.json();

    const setting = await aiEvaluationSettings.create({
      groupId: req.params.id,
      goalId: data.goalId,
      model: data.model,
      impactWeight: data.impactWeight,
      feasibilityWeight: data.feasibilityWeight,
      originalityWeight: data.originalityWeight,
      selectedIdeaIds: data.selectedIdeaIds,
    });

    return Response.json(setting, { status: 201 });
  },

  async getById(req: Request) {
    const setting = await aiEvaluationSettings.findById(req.params.id);
    if (!setting) {
      return Response.json({ error: "AI evaluation setting not found" }, { status: 404 });
    }
    return Response.json(setting);
  },
};
