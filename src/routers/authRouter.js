import express from "express";
import {
    register,
    login,
    verifyEmail,
    googleLogin,
    completeGoogleRegistration,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.post("/google", googleLogin);
router.post("/google/complete", completeGoogleRegistration);

export default router;
