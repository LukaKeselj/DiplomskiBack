import express from "express";
import container from "../container.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const {
    getAllExercises,
    getExercise,
    createExercise,
    updateExercise,
    deleteExercise,
} = container.cradle.exercisesController;

const router = express.Router();

router.get("/", requireAuth, getAllExercises);
router.get("/:id", requireAuth, getExercise);
router.post("/", requireAuth, requireAdmin, createExercise);
router.put("/:id", requireAuth, requireAdmin, updateExercise);
router.delete("/:id", requireAuth, requireAdmin, deleteExercise);

export default router;
