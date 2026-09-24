import { db } from "../../db";
import { findAllGenres, findGenreBySlug, findGenresById, updateGenre, deleteGenre,createGenre } from "./genres.repository"
import { CreateGenreInput, UpdateGenreInput } from "./genres.validation";


export const getAllGenres = async() => {

    return await findAllGenres();

}

export const getAllGenresById = async(genreId:string) => {

    return await findGenresById(genreId);

}

export const getGenresBySlug = async(slug:string) => {

    return await findGenreBySlug(slug);

}

export const createGenreService = async(data:CreateGenreInput) => {

    return await createGenre(data);

}

export const updateGenreService = async(genreId:string, data:UpdateGenreInput) => {

    const existingGenre = await db.query.genres.findFirst({
        where : (genres, {eq}) => (eq(genres.id, genreId)),
    })

    if(!existingGenre){
        return null;
    }

    return await updateGenre(genreId,data);

}