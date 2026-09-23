import { findAllGames, findGameBySlug, findLatestGames, findTopGames, findUpcominigGames, searchGames } from "./games.repository"
import { db, games, gameGenres, gamePlatforms, gameTags } from "../../db";
import { eq } from "drizzle-orm";

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

//inface
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
// create game use db.transaction
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
// interface to udpdate games
interface UpdateGameInput {
  name?: string;
  slug?: string;
  description?: string;
  coverUrl?: string;
  backgroundUrl?: string;
  releaseDate?: Date;
  status?: "upcoming" | "released" | "cancelled";
  metacriticScore?: number;

  genreIds?: string[];
  platformIds?: string[];
  tagIds?: string[];
}

export const updateGame = async(
    gameId : string,
    data : UpdateGameInput,
) => {

    return db.transaction(async(tx) => {
        //checks if game exisits with the provided gameId
        const existingGame = await tx.query.games.findFirst({
            where : (games, {eq}) => (eq(games.id, gameId)),
        })

        if (!existingGame) {
            return null;
        }

        //if user dont give any field then it will be undefined and wont be updated
        const gameData = {
      ...(data.name !== undefined && {
        name: data.name,
      }),

      ...(data.slug !== undefined && {
        slug: data.slug,
      }),

      ...(data.description !== undefined && {
        description: data.description,
      }),

      ...(data.coverUrl !== undefined && {
        coverUrl: data.coverUrl,
      }),

      ...(data.backgroundUrl !== undefined && {
        backgroundUrl: data.backgroundUrl,
      }),

      ...(data.releaseDate !== undefined && {
        releaseDate: data.releaseDate,
      }),

      ...(data.status !== undefined && {
        status: data.status,
      }),

      ...(data.metacriticScore !== undefined && {
        metacriticScore: data.metacriticScore,
      }),

      updatedAt: new Date(),
    };

    if(Object.keys( gameData).length>1){
        await tx.update(games).set(gameData).where(eq(games.id, gameId))
    }

    if(data.platformIds !== undefined){
        await tx.delete(gamePlatforms).where(eq(gamePlatforms.gameId, gameId));

        if(data.platformIds.length>0){
            await tx.insert(gamePlatforms).values(
                data.platformIds.map((platformId) => ({
                    gameId,
                    platformId,
                }))
            )
        }
    }

    if(data.tagIds !== undefined){
        await tx.delete(gameTags).where(eq(gameTags.gameId, gameId));

        if(data.tagIds.length>0){
            await tx.insert(gameTags).values(
                data.tagIds.map((tagId) => ({
                    gameId,
                    tagId,
                }))
            )
        }
    }

    if(data.genreIds !==undefined){
        await tx.delete(gameGenres).where(eq(gameGenres.gameId, gameId));

        if(data.genreIds.length > 0){
            await tx.insert(gameGenres).values(
                data.genreIds.map((genreId) => ({// we do "({})" when we dont want to use return  
                    gameId,
                    genreId,
                }))
            )
        }
    }

    const updateGame = await tx.query.games.findFirst({
        where : (games, {eq}) => (eq(games.id, gameId))
    })

    return updateGame;

    })

}
