import express from "express";
import {
    getAllWorkoutPlans,
    getWorkoutPlan,
    createWorkoutPlan,
    updateWorkoutPlan,
    deleteWorkoutPlan,
} from "../controllers/workoutPlansController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, getAllWorkoutPlans);
router.get("/:id", requireAuth, getWorkoutPlan);
router.post("/", requireAuth, createWorkoutPlan);
router.put("/:id", requireAuth, updateWorkoutPlan);
router.delete("/:id", requireAuth, deleteWorkoutPlan);

export default router;
