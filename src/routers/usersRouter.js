import express from "express";
import { createUser, deleteUser, getAllUsers, updateUser,getUser } from "../controllers/usersController.js";
import requireAuth from "../middleware/authMiddleware.js";

const router = express.Router();


router.get("/",requireAuth,getAllUsers);
router.get("/:id",requireAuth,getUser);
router.post("/",createUser);
router.put("/:id",requireAuth,updateUser);
router.delete("/:id",requireAuth,deleteUser);


export default router;
