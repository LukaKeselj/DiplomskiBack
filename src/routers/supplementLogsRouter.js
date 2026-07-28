import express from "express";
import container from "../container.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const {
    getAllLogs,
    logSupplementTaken,
    deleteLog,
} = container.cradle.supplementLogsController;

const router = express.Router();

router.get("/", requireAuth, getAllLogs);
router.post("/", requireAuth, logSupplementTaken);
router.delete("/:id", requireAuth, deleteLog);

export default router;
