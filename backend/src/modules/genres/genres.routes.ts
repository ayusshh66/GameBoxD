import express from "express";
import { createGenreController, deleteGenreController, getAllGenreByIdController,getAllGenreBySlugController,getAllGenresController, updateGenreController } from "./genres.controller";


const genreRouter = express.Router();

genreRouter.get("/",getAllGenresController);
genreRouter.get("/:genreId",getAllGenreByIdController);
genreRouter.get("/:slug", getAllGenreBySlugController);
genreRouter.post("/",createGenreController);
genreRouter.patch(":genreId", updateGenreController);
genreRouter.delete(":genreId", deleteGenreController);

export default genreRouter;