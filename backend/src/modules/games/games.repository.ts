import { db, games } from "../../db";
import { eq } from "drizzle-orm";


export const findAllGames = async() => {

    try {

        const result = await db.query.games.findMany();
        return result;
        
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