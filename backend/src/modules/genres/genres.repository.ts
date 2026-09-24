import { db, genres } from "../../db"
import { desc,eq } from "drizzle-orm"

export const findAllGenres = async() => {

    const allGenres = await db.query.genres.findMany({
        orderBy : (genres, {desc}) => (desc(genres.id))
    })

    return allGenres;

}

export const findGenresById = async(genreId: string) => {

    const genresById = await db.query.genres.findFirst({
        where : (genres, {eq}) => (eq(genres.id, genreId)),
    })

    return genresById;

}

export const findGenreBySlug = async(slug:string) => {

    const genreBySlug = await db.query.genres.findFirst({
        where : (genres, {eq}) => (eq(genres.slug, slug)),
    })

    return genreBySlug

}

export const createGenre = async(data:{
    name: string,
    slug:string
}) => {

    const newGenre = await db.insert(genres).values({
        name : data.name,
        slug: data.slug
    }).returning();

    return newGenre;

}

export const updateGenre = async(genreId:string, data: {
    name?:string,
    slug?:string,
}) => {

    const updatedGenre = await db.update(genres).set(data).where(eq(genres.id,genreId)).returning();

    return updateGenre;

}