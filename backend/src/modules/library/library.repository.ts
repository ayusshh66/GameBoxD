import { and, desc, eq } from "drizzle-orm";
import { db, games, userFavorites, userWishlist } from "../../db";


export const addToWishlist = async (
  userId: string,
  gameId: string
) => {
  const [result] = await db
    .insert(userWishlist)
    .values({ userId, gameId })
    .onConflictDoNothing() // do thing bcz, if a user again adds to wishlist then it wont forma  new data set in wishlist
    .returning();

  return result ?? null;
};

export const removeFromWishlist = async (
  userId: string,
  gameId: string
) => {
  const [deleted] = await db
    .delete(userWishlist)
    .where(
      and(
        eq(userWishlist.userId, userId),
        eq(userWishlist.gameId, gameId)
      )
    )
    .returning();

  return deleted ?? null;
};

export const getUserWishlist = async (
  userId: string,
  limit: number,
  offset: number
) => {
  return db.query.userWishlist.findMany({
    columns: {
      gameId: true,
      createdAt: true,
    },

    with: {
      game: {
        columns: {
          id: true,
          name: true,
          slug: true,
          averageRating: true,
        },
      },
    },

    where: (userWishlist, { eq }) =>
      eq(userWishlist.userId, userId),

    orderBy: (userWishlist, { desc }) => [
      desc(userWishlist.createdAt),
      desc(userWishlist.gameId),
    ],

    limit,
    offset,
  });
};


export const addToFavorites = async (
  userId: string,
  gameId: string
) => {
  const [result] = await db
    .insert(userFavorites)
    .values({ userId, gameId })
    .onConflictDoNothing()
    .returning();

  return result ?? null;
};

export const removeFromFavorites = async (
  userId: string,
  gameId: string
) => {
  const [deleted] = await db
    .delete(userFavorites)
    .where(
      and(
        eq(userFavorites.userId, userId),
        eq(userFavorites.gameId, gameId)
      )
    )
    .returning();

  return deleted ?? null;
};

export const getUserFavorites  = async(
    userId:string,
    limit:number,
    offset:number
) => {

    return db.query.userFavorites.findMany({
        columns : {
            gameId: true,
            createdAt: true,
        },
        with : {
            game : {
                column : {
                    id:true,
                    name:true,
                    slug:true,
                    averageRating:true,
                }
            }
        },
        where : (userFavorites,{eq}) => eq(userFavorites.userId, userId),
        limit,
        offset,

    })

}