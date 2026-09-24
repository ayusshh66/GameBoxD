import { findAllGenres, findGenresById } from "./genres.repository"


export const getAllGenres = async() => {

    return await findAllGenres();

}

export const getAllGenresById = async(genreId:string) => {

    return await findGenresById(genreId);

}