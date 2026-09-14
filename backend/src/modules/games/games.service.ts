import { findAllGames, findGameBySlug } from "./games.repository"


export const getGames = async() => {

    return await findAllGames()

}

export const getGameBySlug = async(slug:string) =>{

    return await findGameBySlug(slug);

}