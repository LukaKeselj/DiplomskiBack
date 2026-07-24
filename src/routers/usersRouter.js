import express from "express";
import { deleteUser, getAllUsers, updateUser,getUser } from "../controllers/usersController.js";
import { requireAuth, requireAdmin, requireSelfOrAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();


router.get("/",requireAuth,requireAdmin,getAllUsers);
router.get("/:id",requireAuth,requireSelfOrAdmin,getUser);
router.put("/:id",requireAuth,requireSelfOrAdmin,updateUser);
router.delete("/:id",requireAuth,requireSelfOrAdmin,deleteUser);


export default router;
