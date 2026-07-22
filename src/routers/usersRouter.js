import express from "express";
import { createUser, deleteUser, getAllUsers, updateUser,getUser } from "../controllers/usersController.js";

const router = express.Router();


router.get("/",getAllUsers);
router.get("/:id",getUser);
router.post("/",createUser);
router.put("/:id",updateUser);
router.delete("/:id",deleteUser);


export default router;
