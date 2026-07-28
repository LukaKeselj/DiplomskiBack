import express from "express";
import container from "../container.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const {
    getNextDay,
    getSessions,
    completeDay,
    deleteSession,
} = container.cradle.workoutSessionsController;

const router = express.Router();

router.get("/next", requireAuth, getNextDay);
router.get("/", requireAuth, getSessions);
router.post("/", requireAuth, completeDay);
router.delete("/:id", requireAuth, deleteSession);

export default router;
