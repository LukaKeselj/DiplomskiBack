import express from "express";
import {
    getAllLogs,
    logSupplementTaken,
    deleteLog,
} from "../controllers/supplementLogsController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, getAllLogs);
router.post("/", requireAuth, logSupplementTaken);
router.delete("/:id", requireAuth, deleteLog);

export default router;
