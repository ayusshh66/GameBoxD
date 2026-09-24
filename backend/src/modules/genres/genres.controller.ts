import express, { Request, Response, NextFunction } from "express";
import { getAllGenres } from "./genres.service";

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


