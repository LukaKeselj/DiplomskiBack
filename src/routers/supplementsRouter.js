import express from "express";
import container from "../container.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const {
    getAllSupplements,
    getSupplement,
    createSupplement,
    updateSupplement,
    deleteSupplement,
} = container.cradle.supplementsController;

const router = express.Router();

router.get("/", requireAuth, getAllSupplements);
router.get("/:id", requireAuth, getSupplement);
router.post("/", requireAuth, requireAdmin, createSupplement);
router.put("/:id", requireAuth, requireAdmin, updateSupplement);
router.delete("/:id", requireAuth, requireAdmin, deleteSupplement);

export default router;
