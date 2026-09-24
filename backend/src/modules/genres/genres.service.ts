import { findAllGenres, findGenreBySlug, findGenresById, updateGenre, deleteGenre,createGenre } from "./genres.repository"


export const getAllGenres = async() => {

    return await findAllGenres();

}

export const getAllGenresById = async(genreId:string) => {

    return await findGenresById(genreId);

}

export const getGenresBySlug = async(slug:string) => {

    return await findGenreBySlug(slug);

}