import { findAllGames, findGameBySlug, findLatestGames, findTopGames, findUpcominigGames, searchGames } from "./games.repository"
import { db, games, gameGenres, gamePlatforms, gameTags } from "../../db";

export const getAllGames = async(limit: number, page:number) => {

    const offset = (page-1)*limit

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

export const getSearchTopGames = async(query:string, limit:number, page:number) => {

    const offset = (page-1)*limit

    return await searchGames(query,limit,offset);

}

//in
interface CreateGameInput {
  name: string;
  slug: string;
  description?: string;
  coverUrl?: string;
  backgroundUrl?: string;
  releaseDate?: Date;
  status: "upcoming" | "released" | "cancelled";
  metacriticScore?: number;

  tagIds: string[];
  genreIds: string[];
  platformIds: string[];
}

export const createGame = async(data:CreateGameInput) => {

    // db.transaction = all or nothing
    return await db.transaction(async(tx) => {

        const [game] = await tx.insert(games).values({
            name: data.name,
            slug: data.slug,
            description: data.description,
            coverUrl: data.coverUrl,
            backgroundUrl: data.backgroundUrl,
            releaseDate: data.releaseDate,
            status: data.status,
            metacriticScore: data.metacriticScore,
        }).returning();

        if(data.tagIds.length>0){
            await tx.insert(gameTags).values(
                data.tagIds.map((tagId) => ({
                    gameId : game.id, // above game data that is inserted in games table
                    tagId: tagId
                }))
            )
        }

        if(data.platformIds.length>0){
            await tx.insert(gamePlatforms).values(
                data.platformIds.map((platformId) => ({
                    gameId : game.id,
                    platformId: platformId,
                }))
            )
        }

        if(data.genreIds.length>0){
            await tx.insert(gameGenres).values(
                data.genreIds.map((genreId) => ({
                    gameId : game.id,
                    genreId:genreId,
                }))
            )
        }

        return game;
    })

}
