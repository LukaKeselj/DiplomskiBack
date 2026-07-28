import express from "express";
import container from "../container.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const {
    getAllLogs,
    logWeight,
    deleteLog,
} = container.cradle.workoutLogsController;

const router = express.Router();

router.get("/", requireAuth, getAllLogs);
router.post("/", requireAuth, logWeight);
router.delete("/:id", requireAuth, deleteLog);

export default router;
