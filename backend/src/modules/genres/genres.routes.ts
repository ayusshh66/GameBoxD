import express, {RequestHandler} from "express";
import { createGenreController, deleteGenreController, getAllGenreByIdController,getAllGenreBySlugController,getAllGenresController, updateGenreController } from "./genres.controller";
import { authenticate } from "../auth/auth.middleware";
import { authorize } from "../../db/middleware/authorize";


const genreRouter = express.Router();

genreRouter.get("/",getAllGenresController);
genreRouter.get("/", getAllGenreBySlugController);
genreRouter.get("/:genreId",getAllGenreByIdController);
genreRouter.post("/",authenticate,authorize("admin","moderator"),createGenreController);
genreRouter.patch("/:genreId",authenticate, authorize("admin","moderator"), updateGenreController as RequestHandler);
genreRouter.delete("/:genreId",authenticate,authorize("admin","moderator"), deleteGenreController as RequestHandler);

export default genreRouter; 