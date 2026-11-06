
import { and, desc, eq } from "drizzle-orm";

import {
  db,
  userFollows,
  reviews,
  users,
  games,
} from "../../db";

export const getFollowingReviews = async (
  userId: string,
  limit: number,
  offset: number
) => {
  const result = await db
    .select({
      id: reviews.id,
      content: reviews.content,
      isSpoiler: reviews.isSpoiler,
      isEdited: reviews.isEdited,
      createdAt: reviews.createdAt,
      updatedAt: reviews.updatedAt,

      author: {
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
      },

      game: {
        id: games.id,
        name: games.name,
        slug: games.slug,
        coverUrl: games.coverUrl,
      },
    })
    .from(reviews)

    .innerJoin(
      userFollows,
      and(
        eq(userFollows.followingId, reviews.userId),
        eq(userFollows.followerId, userId)
      )
    )

    .innerJoin(
      users,
      eq(reviews.userId, users.id)
    )

    .innerJoin(
      games,
      eq(reviews.gameId, games.id)
    )

    .orderBy(
      desc(reviews.createdAt),
      desc(reviews.id)
    )
    .limit(limit + 1)
    .offset(offset);

  return result;
};
