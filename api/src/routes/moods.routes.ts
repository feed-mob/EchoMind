import { moodsController } from "../controllers/index.js";

export const moodsRoutes = {
  "/api/moods": {
    GET: moodsController.list,
    POST: moodsController.create,
  },
  "/api/moods/analyze": {
    POST: moodsController.analyze,
  },
  "/api/moods/history": {
    GET: moodsController.getHistory,
  },
  "/api/moods/spectrum": {
    GET: moodsController.getSpectrum,
  },
  "/api/moods/stats": {
    GET: moodsController.getStats,
  },
  "/api/moods/team-stats": {
    GET: moodsController.getTeamStats,
  },
  "/api/moods/team-distribution": {
    GET: moodsController.getTeamDistribution,
  },
  "/api/moods/team-trend": {
    GET: moodsController.getTeamTrend,
  },
  "/api/moods/team-insights": {
    GET: moodsController.getTeamInsights,
  },
  "/api/moods/:id": {
    GET: moodsController.getById,
    PUT: moodsController.update,
    DELETE: moodsController.delete,
  },
};
