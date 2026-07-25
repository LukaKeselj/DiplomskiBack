import express from "express";
import {
    getAllUserSupplements,
    getUserSupplement,
    createUserSupplement,
    updateUserSupplement,
    deleteUserSupplement,
} from "../controllers/userSupplementsController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, getAllUserSupplements);
router.get("/:id", requireAuth, getUserSupplement);
router.post("/", requireAuth, createUserSupplement);
router.put("/:id", requireAuth, updateUserSupplement);
router.delete("/:id", requireAuth, deleteUserSupplement);

export default router;
