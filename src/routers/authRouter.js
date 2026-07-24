import express from "express";
import {
    register,
    login,
    verifyEmail,
    googleLogin,
    completeGoogleRegistration,
    forgotPassword,
    resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.post("/google", googleLogin);
router.post("/google/complete", completeGoogleRegistration);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
