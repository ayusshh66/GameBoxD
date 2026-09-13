import express from "express";
import { login, register } from "./auth.controller";
import { authenticate, getMe, AuthRequest } from "./auth.middleware";


const app = express.Router();

app.post("/register", register);
app.post("/login", login);
app.get("/me", authenticate,getMe);