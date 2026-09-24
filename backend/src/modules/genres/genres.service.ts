import { findAllGenres, findGenreBySlug, findGenresById, updateGenre, deleteGenre,createGenre } from "./genres.repository"
import { CreateGenreInput } from "./genres.validation";


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