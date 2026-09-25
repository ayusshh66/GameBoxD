import { db, tags } from "../../db"
import { desc, eq } from "drizzle-orm";

export const findAllTags = async() => {

    const tags = await db.query.tags.findMany({
        orderBy : (tags, {desc}) => (desc(tags.id))
    });

    return tags;

}

export const findTagById = async(tagId:string) => {

    const tag = await db.query.tags.findFirst({
        where : (tags, {eq}) => (eq(tags.id, tagId))
    })

    return tag;

}
