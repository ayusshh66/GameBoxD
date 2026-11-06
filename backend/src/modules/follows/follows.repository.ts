
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

