import { db, genres } from "../../db"
import { desc } from "drizzle-orm"


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