import express from "express";
import container from "../container.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const {
    getAllUserSupplements,
    getUserSupplement,
    createUserSupplement,
    updateUserSupplement,
    deleteUserSupplement,
} = container.cradle.userSupplementsController;

const router = express.Router();

router.get("/", requireAuth, getAllUserSupplements);
router.get("/:id", requireAuth, getUserSupplement);
router.post("/", requireAuth, createUserSupplement);
router.put("/:id", requireAuth, updateUserSupplement);
router.delete("/:id", requireAuth, deleteUserSupplement);

export default router;
