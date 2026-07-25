import express from "express";
import {
    getAllSupplements,
    getSupplement,
    createSupplement,
    updateSupplement,
    deleteSupplement,
} from "../controllers/supplementsController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, getAllSupplements);
router.get("/:id", requireAuth, getSupplement);
router.post("/", requireAuth, requireAdmin, createSupplement);
router.put("/:id", requireAuth, requireAdmin, updateSupplement);
router.delete("/:id", requireAuth, requireAdmin, deleteSupplement);

export default router;
