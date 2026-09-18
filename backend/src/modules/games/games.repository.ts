import { db, games } from "../../db";
import { asc, desc, eq, ilike } from "drizzle-orm";


export const findAllGames = async(limit : number,
    offset: number
) => {

    try {

        const result = await db.query.games.findMany({
            limit : limit,
            offset : offset,
            orderBy: (games, {desc}) => [desc(games.createdAt)],
        });
        return result ?? null;
        
    } catch (error) {
        console.error("error in getting all the games", error);
        throw error;
    }

}

export const findGameBySlug = async(slug : string) =>{

    try {

        const result = await db.query.games.findFirst({
            where : eq(games.slug, slug),
        })

        return result;
        
    } catch (error) {
        console.error("error in finding games my slug",error)
        throw error;
    }

}

export const findLatestGames = async(limit : number) => {

    try {

        const result = await db.query.games.findMany({
            where : (games, {eq}) => eq(games.status, "released"),
            limit : limit,
            orderBy : (games, {desc}) => [desc(games.releaseDate)]
        })

        return result;
        
    } catch (error) {
        console.error("error in fetching latest game", error);
        throw error;
    }

}

export const findUpcominigGames = async(limit:number) => {

    try {

        const result = await db.query.games.findMany({
            where : (games, {eq}) => (eq(games.status, "upcoming")),
            limit : limit,
            orderBy : (games, {asc}) => [(asc(games.releaseDate))]
        })

        return result;
        
    } catch (error) {
        console.error("error in finding upcoming games", error);
        throw error;
    }

}

export const findTopGames = async(limit:number) => {

    try {

        const result = await db.query.games.findMany({
            where : (games, {eq}) => (eq(games.status, "released")),
            limit,
            orderBy : (games, {desc}) => [(desc(games.averageRating)), desc(games.ratingsCount)]
        })

        return result;
        
    } catch (error) {
        console.error("error in fetching top games", error);
        throw error;
    }

}

export const searchGames = async(query: string, limit:number, offset:number) => {

    try {

        const result = await db.query.games.findMany({
            where : (games, {ilike}) => (ilike(games.name, `%${query}%`)),
            limit,
            offset,
            orderBy : (games, {desc}) => (desc(games.releaseDate)),
        })

        return result;
        
    } catch (error) {
        console.error("error in fetching search games results", error);
        throw error;
    }

}