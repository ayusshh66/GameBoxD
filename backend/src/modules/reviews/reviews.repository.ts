import { games } from "../../db/schema/games";
import { userGameRatings } from "../../db/schema/reviews"
import { and, desc, eq, sql } from "drizzle-orm";


const refreshRatingStats = async(
    tx:any,
    gameId:string,
) => {

    const [stats] = await tx.select({
        average: sql    <string | null>`
        ROUND(AVG(${userGameRatings.rating})::numeric, 2)
      `,
      count: sql<number>`COUNT(*)::integer`,
    }).from(userGameRatings).where(eq(userGameRatings.gameId, gameId))

    await tx.update(games).set({
        averageRating : stats.average,
        ratingCount : stats.count,
    }).when(eq(games.id, gameId));

}