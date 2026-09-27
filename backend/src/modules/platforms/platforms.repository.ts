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

export const findPlatformBySlug = async(slug:string) => {

    const platform = await db.query.platforms.findFirst({
        where: (platforms,{eq}) => (eq(platforms.slug, slug))
    })

    return platform;

}

export const createPlatform = async(data:{
    name:string,
    slug:string,
    logoUrl?: string | null,
}) => {

    const [newPlatform] = await db.insert(platforms).values(data).returning();

    return newPlatform;

}

export const updatePlatform = async(platformId:string, data : {
    name?:string,
    slug?:string,
    logoUrl?:string,
}) => {

    const [updatedPlatform] = await db.update(platforms).set(data).where(eq(platforms.id, platformId)).returning();

    return updatedPlatform;

}

export const deletePlatform = async(platformId:string) => {

    const [deletedPlatform] = await db.delete(platforms).where(eq(platforms.id, platformId)).returning();

    return deletedPlatform;

}