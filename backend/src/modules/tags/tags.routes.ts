import express, {RequestHandler} from "express";
import { createTagController, deleteTagController, getAllTagController, getTagByIdController, getTagBySlugController, updateTagController } from "./tags.controller";
import { authenticate } from "../auth/auth.middleware";
import { authorize } from "../../db/middleware/authorize";

const tagsRouter = express.Router();

tagsRouter.get("/", getAllTagController); //tested
tagsRouter.get("/:tagId", getTagByIdController); //tested
tagsRouter.get("/slug/:slug", getTagBySlugController); //tested
tagsRouter.post("/",authenticate, authorize("admin","moderator"), createTagController); // tested
tagsRouter.patch("/:tagId", authenticate, authorize("admin","admin"),updateTagController as RequestHandler) //tested
tagsRouter.delete("/:tagId", authenticate, authorize("moderator","admin"), deleteTagController as RequestHandler); //tested

export default tagsRouter;