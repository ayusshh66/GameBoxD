import { and, eq } from "drizzle-orm";
import { db, userWishlist } from "../../db";


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