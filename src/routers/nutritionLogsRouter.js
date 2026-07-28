import express from "express";
import container from "../container.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const {
    getAllLogs,
    getDailySummary,
    getSummaryRange,
    createLog,
    updateLog,
    deleteLog,
} = container.cradle.nutritionLogsController;

const router = express.Router();

router.get("/summary/range", requireAuth, getSummaryRange);
router.get("/summary", requireAuth, getDailySummary);
router.get("/", requireAuth, getAllLogs);
router.post("/", requireAuth, createLog);
router.put("/:id", requireAuth, updateLog);
router.delete("/:id", requireAuth, deleteLog);

export default router;
