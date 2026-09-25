import express, { Request, Response, NextFunction } from "express";
import {
  createGenreService,
  getAllGenres,
  getAllGenresById,
  getGenresBySlug,
  updateGenreService,
  deleteGenreService,
} from "./genres.service";
import { createGenreSchema, updateGenreSchema } from "./genres.validation";

export const getAllGenresController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const genres = await getAllGenres();

    return res.status(200).json({
      success: true,
      message: "fetched all genre",
      data: genres,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllGenreByIdController = async (
  req: Request<{ genreId: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { genreId } = req.params;

    const genreById = await getAllGenresById(genreId);

    if (!genreById) {
      return res.status(400).json({
        success: false,
        message: "genre not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "genre found",
      data: genreById,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllGenreBySlugController = async (
  req: Request<{ slug: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slug } = req.params;

    const genreBySlug = await getGenresBySlug(slug);

    if (!genreBySlug) {
      return res.status(400).json({
        success: false,
        message: "no genre found with this slug",
      });
    }

    return res.status(200).json({
      success: true,
      message: "genre found!",
      data: genreBySlug,
    });
  } catch (error) {
    next(error);
  }
};

export const createGenreController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await createGenreSchema.safeParseAsync(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "invalid input",
        error: result.error.format(),
      });
    }

    const data = result.data;

    const genre = await createGenreService(data);

    return res.status(200).json({
      success: true,
      message: "genre created successfully!",
      data: genre,
    });
  } catch (error) {
    next(error);
  }
};

export const updateGenreController = async (
  req: Request<{ genreId: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { genreId } = req.params;

    const result = await updateGenreSchema.safeParseAsync(req.body);

    if (!result.success) {
      return res.status(400).json({
        succes: false,
        message: "invalid input",
        erorr: result.error.format(),
      });
    }

    const data = result.data;

    const updatedGenre = await updateGenreService(genreId, data);

    return res.status(200).json({
      success: true,
      message: "genre updated successfully!",
      data: updatedGenre,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteGenreController = async (
  req: Request<{ genreId: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { genreId } = req.params;

    const deletedUser = await deleteGenreService(genreId);

    if (!deletedUser) {
      return res.status(400).json({
        success: false,
        message: "genre not found to delete",
      });
    }

    return res.status(200).json({
      success: true,
      message: "genre deleted successfully!",
      data: deletedUser,
    });
  } catch (error) {
    next(error);
  }
};