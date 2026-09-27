import express, { RequestHandler } from "express";
import { createPlatformController, deletePlatformController, getAllPlatformController, getPlatformByIdController, getPlatformBySlugController, updatePlatformController } from "./platforms.controller";
import { authenticate } from "../auth/auth.middleware";
import { authorize } from "../../db/middleware/authorize";

const platformRouter = express.Router();

platformRouter.get("/",getAllPlatformController);
platformRouter.get("/:platformId",getPlatformByIdController);
platformRouter.get("/slug/:slug",getPlatformBySlugController);
platformRouter.post("/",authenticate,authorize("admin","moderator"),createPlatformController);
platformRouter.patch("/:platformId",authenticate,authorize("admin","moderator"),updatePlatformController as RequestHandler) ;
platformRouter.delete("/:platformId",authenticate,authorize("admin","moderator"),deletePlatformController as RequestHandler) ;

export default platformRouter;