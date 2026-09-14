import { db, games } from "../../db";
import { desc, eq } from "drizzle-orm";


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