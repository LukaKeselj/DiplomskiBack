import express from "express";
import {
    getAllLogs,
    getDailySummary,
    createLog,
    updateLog,
    deleteLog,
} from "../controllers/nutritionLogsController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/summary", requireAuth, getDailySummary);
router.get("/", requireAuth, getAllLogs);
router.post("/", requireAuth, createLog);
router.put("/:id", requireAuth, updateLog);
router.delete("/:id", requireAuth, deleteLog);

export default router;
