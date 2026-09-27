import express, { RequestHandler } from "express";
import { createPlatformController, deletePlatformController, getAllPlatformController, getPlatformByIdController, getPlatformBySlugController, updatePlatformController } from "./platforms.controller";
import { authenticate } from "../auth/auth.middleware";
import { authorize } from "../../db/middleware/authorize";

const platformRouter = express.Router();

platformRouter.get("/",getAllPlatformController); // tested and working
platformRouter.get("/:platformId",getPlatformByIdController); // tested and working
platformRouter.get("/slug/:slug",getPlatformBySlugController); // tested and working
platformRouter.post("/",authenticate,authorize("admin","moderator"),createPlatformController); // tested and working
platformRouter.patch("/:platformId",authenticate,authorize("admin","moderator"),updatePlatformController as RequestHandler) ; //tested and working
platformRouter.delete("/:platformId",authenticate,authorize("admin","moderator"),deletePlatformController as RequestHandler) ; //tested and working

export default platformRouter;