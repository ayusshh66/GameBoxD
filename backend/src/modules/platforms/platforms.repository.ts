import { desc, eq } from "drizzle-orm"
import { db, platforms } from "../../db"



export const findAllPlatform = async() => {

    const platform = await db.query.platforms.findMany();

    return platform;
}

export const findPlatformById = async(platformId:string) => {

    const platform = await db.query.platforms.findFirst({
        where : (platforms,{eq}) => (eq(platforms.id, platformId))
    })

    return platform;

}