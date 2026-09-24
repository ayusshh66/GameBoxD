import { findAllGenres } from "./genres.repository"


export const getAllGenres = async() => {

    return await findAllGenres();

}