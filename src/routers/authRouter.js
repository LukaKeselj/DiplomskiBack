import express from "express";
import {
    register,
    login,
    verifyEmail,
    googleLogin,
    completeGoogleRegistration,
    forgotPassword,
    resetPassword,
    logout,
    me,
    refresh,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.post("/google", googleLogin);
router.post("/google/complete", completeGoogleRegistration);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get("/me", requireAuth, me);

export default router;
