import express from "express";
import container from "../container.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const { getScoreHistory } = container.cradle.fitnessScoreController;

const router = express.Router();

router.get("/", requireAuth, getScoreHistory);

export default router;
