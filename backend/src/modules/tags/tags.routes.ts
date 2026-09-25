import express, {RequestHandler} from "express";
import { createTagController, deleteTagController, getAllTagController, getTagByIdController, getTagBySlugController, updateTagController } from "./tags.controller";
import { authenticate } from "../auth/auth.middleware";
import { authorize } from "../../db/middleware/authorize";

const tagsRouter = express.Router();

tagsRouter.get("/", getAllTagController);
tagsRouter.get("/:tagId", getTagByIdController);
tagsRouter.get("/slug/:slug", getTagBySlugController);
tagsRouter.post("/",authenticate, authorize("admin","moderator"), createTagController);
tagsRouter.patch("/:tagId", authenticate, authorize("admin","admin"),updateTagController as RequestHandler)
tagsRouter.delete("/tagId", authenticate, authorize("moderator","admin"), deleteTagController as RequestHandler);

export default tagsRouter;