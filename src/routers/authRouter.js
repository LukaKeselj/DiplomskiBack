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
import { authRateLimiter, loginRateLimiter } from "../middleware/authRateLimiter.js";

const router = express.Router();

router.post("/register", authRateLimiter, register);
router.post("/login", loginRateLimiter, login);
router.get("/verify-email", verifyEmail);
router.post("/google", googleLogin);
router.post("/google/complete", completeGoogleRegistration);
router.post("/forgot-password", authRateLimiter, forgotPassword);
router.post("/reset-password", authRateLimiter, resetPassword);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get("/me", requireAuth, me);

export default router;
