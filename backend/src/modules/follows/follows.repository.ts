
import { and, desc, eq } from "drizzle-orm";
import { db, userFollows, users } from "../../db";

export const addFollow = async (
  followerId: string,
  followingId: string
) => {
  const [result] = await db
    .insert(userFollows)
    .values({
      followerId,
      followingId,
    })
    .onConflictDoNothing() // now if anyone follows anyone again the db wont throw error on it 
    .returning();

  return result ?? null;
};

export const removeFollow = async (
  followerId: string,
  followingId: string
) => {
  const [deleted] = await db
    .delete(userFollows)
    .where(
      and(
        eq(userFollows.followerId, followerId),
        eq(userFollows.followingId, followingId)
      )
    )
    .returning();

  return deleted ?? null;
};

export const findFollow = async (
  followerId: string,
  followingId: string
) => {
  const [result] = await db
    .select({
      followerId: userFollows.followerId,
    })
    .from(userFollows)
    .where(
      and(
        eq(userFollows.followerId, followerId),
        eq(userFollows.followingId, followingId)
      )
    )
    .limit(1);

  return result ?? null;
};

