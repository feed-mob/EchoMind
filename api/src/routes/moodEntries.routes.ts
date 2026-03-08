import { moodEntriesController } from "../controllers/index.js";

export const moodEntriesRoutes = {
  "/api/mood-entries": {
    GET: moodEntriesController.list,
    POST: moodEntriesController.create,
  },
  "/api/mood-entries/stats": {
    GET: moodEntriesController.getStats,
  },
  "/api/mood-entries/:id": {
    GET: moodEntriesController.getById,
    PUT: moodEntriesController.update,
    DELETE: moodEntriesController.delete,
  },
};