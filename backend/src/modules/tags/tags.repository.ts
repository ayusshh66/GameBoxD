import { db, tags } from "../../db"
import { desc } from "drizzle-orm";

export const findAllTags = async() => {

    const tags = await db.query.tags.findMany({
        orderBy : (tags, {desc}) => (desc(tags.id))
    });

    return tags;

}