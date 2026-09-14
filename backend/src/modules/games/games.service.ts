import { findAllGames, findGameBySlug } from "./games.repository"


export const getAllGames = async(limit: number, offset:number) => {

    return await findAllGames(limit, offset);

}

export const getGameBySlug = async(slug:string) =>{

    return await findGameBySlug(slug);

}