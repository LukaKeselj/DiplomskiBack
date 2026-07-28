import express from "express";
import container from "../container.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const { searchFood, getFood } = container.cradle.foodController;

const router = express.Router();

router.get("/search", requireAuth, searchFood);
router.get("/:id", requireAuth, getFood);

export default router;
