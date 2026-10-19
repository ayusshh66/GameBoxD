import { and, eq } from "drizzle-orm";
import { db, userFavorites, userWishlist } from "../../db";


export const addToWishlist = async (
  userId: string,
  gameId: string
) => {
  const [result] = await db
    .insert(userWishlist)
    .values({ userId, gameId })
    .onConflictDoNothing()
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
  return db
    .select({
      gameId: games.id,
      name: games.name,
      slug: games.slug,
      averageRating: games.averageRating,
      addedAt: userWishlist.createdAt,
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
};

// ===============================
// FAVORITES
// ===============================

// Add a game to the user's favorites
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