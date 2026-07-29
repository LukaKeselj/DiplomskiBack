import express from "express";
import container from "../container.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const {
    getAllNutritionPlans,
    getNutritionPlan,
    createNutritionPlan,
    updateNutritionPlan,
    deleteNutritionPlan,
    activateNutritionPlan,
    getActiveNutritionPlan,
    confirmItem,
} = container.cradle.nutritionPlansController;

const router = express.Router();

router.get("/active", requireAuth, getActiveNutritionPlan);
router.get("/", requireAuth, getAllNutritionPlans);
router.get("/:id", requireAuth, getNutritionPlan);
router.post("/:id/activate", requireAuth, activateNutritionPlan);
router.post("/:id/confirm-item", requireAuth, confirmItem);
router.post("/", requireAuth, createNutritionPlan);
router.put("/:id", requireAuth, updateNutritionPlan);
router.delete("/:id", requireAuth, deleteNutritionPlan);

export default router;
