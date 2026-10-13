import express from "express";
import { login, register } from "./auth.controller";
import { authenticate, getMe, AuthRequest } from "./auth.middleware";
import { loginRateLimiter } from "../../middleware/rateLimit";

const router = express.Router();

router.post("/register", register);
router.post("/login", loginRateLimiter ,login);
router.get("/me", authenticate,getMe);

export default router;