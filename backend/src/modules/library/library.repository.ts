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
  const result = await db
    .select({
      gameId: userWishlist.gameId,
      createdAt: userWishlist.createdAt,

      game: {
        id: games.id,
        name: games.name,
        slug: games.slug,
        coverUrl: games.coverUrl,
        averageRating: games.averageRating,
      },
    })
    .from(userWishlist)
    .innerJoin(
      games,
      eq(userWishlist.gameId, games.id)
    )
    .where(eq(userWishlist.userId, userId))
    .orderBy(
      desc(userWishlist.createdAt),
      desc(userWishlist.gameId)
    )
    .limit(limit)
    .offset(offset);

  return result;
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



export const getUserFavorites = async (
  userId: string,
  limit: number,
  offset: number
) => {
  const result = await db
    .select({
      gameId: userFavorites.gameId,
      createdAt: userFavorites.createdAt,

      game: {
        id: games.id,
        name: games.name,
        slug: games.slug,
        coverUrl: games.coverUrl,
        averageRating: games.averageRating,
      },
    })
    .from(userFavorites)
    .innerJoin(
      games,
      eq(userFavorites.gameId, games.id)
    )
    .where(eq(userFavorites.userId, userId))
    .orderBy(
      desc(userFavorites.createdAt),
      desc(userFavorites.gameId)
    )
    .limit(limit)
    .offset(offset);

  return result;
};
