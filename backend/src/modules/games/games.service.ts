import { findAllGames, findGameBySlug } from "./games.repository"


export const getAllGames = async() => {

    return await findAllGames()

}

export const getGameBySlug = async(slug:string) =>{

    return await findGameBySlug(slug);

}