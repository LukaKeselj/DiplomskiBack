import express from "express";
import {
    getAllLogs,
    logWeight,
    deleteLog,
} from "../controllers/workoutLogsController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, getAllLogs);
router.post("/", requireAuth, logWeight);
router.delete("/:id", requireAuth, deleteLog);

export default router;
