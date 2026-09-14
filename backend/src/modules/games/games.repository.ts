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

