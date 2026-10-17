import { games } from "../../db/schema/games";
import { reviews, userGameRatings } from "../../db/schema/reviews";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../../db/index";

export const refreshRatingStats = async (tx: any, gameId: string) => {
  const [stats] = await tx
    .select({
      average: sql<string | null>`
        ROUND(AVG(${userGameRatings.rating})::numeric, 2)
      `,
      count: sql<number>`COUNT(*)::integer`,
    })
    .from(userGameRatings)
    .where(eq(userGameRatings.gameId, gameId));

  await tx
    .update(games)
    .set({
      averageRating: stats.average,
      ratingCount: stats.count,
    })
    .when(eq(games.id, gameId));
};

export const refreshReviewCount = async (tx: any, gameId: string) => {
  const [stats] = await tx
    .select({
      count: sql<number>`COUNT(*)::integer`,
    })
    .from(reviews)
    .when(eq(reviews.gameId, gameId));

  await tx
    .update(games)
    .set({
      reviewsCount: stats.count,
    })
    .where(eq(games.id, gameId));
};

export const upsertGameRating = async (
  gameId: string,
  userId: string,
  rating: number,
) => {
  return await db.transaction(async (tx) => {
    const [data] = await tx
      .select({ id: games.id, slug: games.slug })
      .from(games)
      .where(eq(games.id, gameId))
      .for("update");

    // inserts the ratings in the userGameRatings table
    const [result] = await tx
      .insert(userGameRatings)
      .values({
        gameId,
        userId,
        rating: rating.toFixed(1), // 4 === 4.0,
      })
      .onConflictDoUpdate(
        // if any user has rated again, tehn it will update the games rating, if user has rated already then tehre will be gameId and userId already in tehdata thats why it is checking the fields in target
        {
          target: [userGameRatings.gameId, userGameRatings.userId],
          set: {
            rating: rating.toFixed(1),
            updatedAt: new Date(),
          },
        },
      )
      .returning();

    await refreshRatingStats(tx, gameId);

    return {
      rating: result,
      slug: data?.slug,
    };
  });
};

export const removeGameRating = async(
    gameId:string,
    userId:string,
) => {

    return db.transaction(async(tx) => {

        const [data] = await tx.select({
            id:games.id, slug:games.slug,
        }).from(games).where(eq(games.id, gameId)).for("update");

        if(!data) return null;

        const [deleted] = await tx.delete(userGameRatings).where(
            and(
                eq(
                    userGameRatings.gameId, gameId
                ),
                eq(
                    userGameRatings.userId, userId
                )
            )
        ).returning()

        await refreshRatingStats(tx, gameId);

        return {
            isDeleted: true,
            deletedGame : deleted,
            slug: data.slug,
        }

    })

}
