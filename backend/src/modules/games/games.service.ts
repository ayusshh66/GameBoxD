import { findAllGames, findGameBySlug, findLatestGames, findTopGames, findUpcominigGames, searchGames } from "./games.repository"


export const getAllGames = async(limit: number, offset:number) => {

    return await findAllGames(limit, offset);

}

export const getGameBySlug = async(slug:string) =>{

    return await findGameBySlug(slug);

}

export const getLatestGames = async(limit:number) => {

    return await findLatestGames(limit);

}

export const getUpcomingGames = async(limit:number) => {

    return await findUpcominigGames(limit);

}

export const getTopGames = async(limit:number) => {

    return await findTopGames(limit);

}

export const getSearchTopGames = async(query:string, limit:number, offset:number) => {

    return await searchGames(query,limit,offset);

}