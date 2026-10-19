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