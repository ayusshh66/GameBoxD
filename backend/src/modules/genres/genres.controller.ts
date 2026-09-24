import express, { Request, Response, NextFunction } from "express";
import { getAllGenres, getAllGenresById, getGenresBySlug } from "./genres.service";

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

export const getAllGenreByIdController = async(req:Request<{genreId:string}>, res:Response,next:NextFunction) => {

    const {genreId} = req.params;

    const genreById = await getAllGenresById(genreId);

    if(!genreById){
        return res.status(400).json({
            success:false,
            message:"genre not found",
        })
    }

    return res.status(200).json({
        success:true,
        message:"genre found",
        data:genreById,
    })

}

export const getAllGenreBySlugController = async(req:Request<{slug:string}>,res:Response, next:NextFunction) => {

    const {slug} = req.params;

    const genreBySlug = await getGenresBySlug(slug);

    if(!genreBySlug){
        return res.status(400).json({
            success:false,
            message:"no genre found with this slug"
        })
    }


    return res.status(200).json({
        success:true,
        message:"genre found!",
        data:genreBySlug,
    })

}