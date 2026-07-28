import express from "express";
import {
    getNextDay,
    getSessions,
    completeDay,
    deleteSession,
} from "../controllers/workoutSessionsController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/next", requireAuth, getNextDay);
router.get("/", requireAuth, getSessions);
router.post("/", requireAuth, completeDay);
router.delete("/:id", requireAuth, deleteSession);

export default router;
