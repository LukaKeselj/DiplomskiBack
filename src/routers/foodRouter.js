import express from "express";
import { searchFood, getFood } from "../controllers/foodController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/search", requireAuth, searchFood);
router.get("/:id", requireAuth, getFood);

export default router;
