import express from "express";
import { login, register } from "./auth.controller";
import { authenticate, getMe, AuthRequest } from "./auth.middleware";
import { loginRateLimiter } from "../../middleware/rateLimit";

const router = express.Router();

router.post("/register", register);
router.post("/login", loginRateLimiter ,login);
router.get("/me", authenticate,getMe);

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export default router;