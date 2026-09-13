import express from "express";
import { login, register } from "./auth.controller";
import { authenticate, getMe, AuthRequest } from "./auth.middleware";


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate,getMe);

export default router;