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

export const findTagBySlug = async(slug:string) => {

    const tag = await db.query.tags.findFirst({
        where: (tags, {eq}) => (eq(tags.slug, slug)),
    })

    return tag;

}

export const createTag = async(data : {
    name: string;
    slug: string;
})  => {

    const newTag = await db.insert(tags).values(data).returning();

    return newTag;

}

export const updateTag = async(tagId : string,data:{
    name?:string,
    slug?:string,
}) => {

    const [updatedTag] = await db.update(tags).set(data).where(eq(tags.id, tagId)).returning();

    return updatedTag;

}