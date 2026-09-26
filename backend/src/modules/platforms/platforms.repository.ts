import { desc, eq } from "drizzle-orm"
import { db, platforms } from "../../db"



export const findAllPlatform = async() => {

    const platform = await db.query.platforms.findMany();

    return platform;
}

