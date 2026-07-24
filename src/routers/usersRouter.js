import express from "express";
import { deleteUser, getAllUsers, updateUser,getUser, setUserBlockedStatus } from "../controllers/usersController.js";
import { requireAuth, requireAdmin, requireSelfOrAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();


router.get("/",requireAuth,requireAdmin,getAllUsers);
router.get("/:id",requireAuth,requireSelfOrAdmin,getUser);
router.put("/:id",requireAuth,requireSelfOrAdmin,updateUser);
router.delete("/:id",requireAuth,requireSelfOrAdmin,deleteUser);
router.patch("/:id/block",requireAuth,requireAdmin,setUserBlockedStatus);


export default router;
