import express from "express";
import {
    getAllLogs,
    getWeeklyStatus,
    logWeight,
    deleteLog,
} from "../controllers/weightLogsController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/status", requireAuth, getWeeklyStatus);
router.get("/", requireAuth, getAllLogs);
router.post("/", requireAuth, logWeight);
router.delete("/:id", requireAuth, deleteLog);

export default router;
