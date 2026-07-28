import express from "express";
import container from "../container.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const {
    getAllLogs,
    getWeeklyStatus,
    logWeight,
    deleteLog,
} = container.cradle.weightLogsController;

const router = express.Router();

router.get("/status", requireAuth, getWeeklyStatus);
router.get("/", requireAuth, getAllLogs);
router.post("/", requireAuth, logWeight);
router.delete("/:id", requireAuth, deleteLog);

export default router;
