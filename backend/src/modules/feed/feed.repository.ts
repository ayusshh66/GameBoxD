
import { and, asc, desc, eq } from "drizzle-orm";

import {
  db,
  userFollows,
  userGameRatings,
  userFavorites,
  reviews,
  users,
  games,
} from "../../db";

export const getFollowingActivities = async (
  userId: string,
  limit: number,
  offset: number
) => {
  // We need enough records to build the requested
  // page after merging all three activity types.
  const fetchCount = offset + limit + 1;

  const [reviewRows, ratingRows, favoriteRows] =
    await Promise.all([

      // 1. Reviews from followed users
      db.select({
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
        .innerJoin(users, eq(reviews.userId, users.id))
        .innerJoin(games, eq(reviews.gameId, games.id))
        .orderBy(
          desc(reviews.createdAt),
          asc(reviews.id)
        )
        .limit(fetchCount),

      // 2. Ratings from followed users
      db.select({
        rating: userGameRatings.rating,
        createdAt: userGameRatings.updatedAt,

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
        .from(userGameRatings)
        .innerJoin(
          userFollows,
          and(
            eq(
              userFollows.followingId,
              userGameRatings.userId
            ),
            eq(userFollows.followerId, userId)
          )
        )
        .innerJoin(
          users,
          eq(userGameRatings.userId, users.id)
        )
        .innerJoin(
          games,
          eq(userGameRatings.gameId, games.id)
        )
        .orderBy(
          desc(userGameRatings.updatedAt),
          asc(userGameRatings.userId),
          asc(userGameRatings.gameId)
        )
        .limit(fetchCount),

      // 3. Favorites from followed users
      db.select({
        createdAt: userFavorites.createdAt,

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
        .from(userFavorites)
        .innerJoin(
          userFollows,
          and(
            eq(
              userFollows.followingId,
              userFavorites.userId
            ),
            eq(userFollows.followerId, userId)
          )
        )
        .innerJoin(
          users,
          eq(userFavorites.userId, users.id)
        )
        .innerJoin(
          games,
          eq(userFavorites.gameId, games.id)
        )
        .orderBy(
          desc(userFavorites.createdAt),
          asc(userFavorites.userId),
          asc(userFavorites.gameId)
        )
        .limit(fetchCount),
    ]);

  // Convert all results into activity objects.
  const reviewActivities = reviewRows.map((review) => ({
    type: "review" as const,
    ...review,
  }));

  const ratingActivities = ratingRows.map((rating) => ({
    type: "rating" as const,
    id: `${rating.author.id}:${rating.game.id}`,
    rating: rating.rating,
    createdAt: rating.createdAt,
    author: rating.author,
    game: rating.game,
  }));

  const favoriteActivities = favoriteRows.map((favorite) => ({
    type: "favorite" as const,
    id: `${favorite.author.id}:${favorite.game.id}`,
    createdAt: favorite.createdAt,
    author: favorite.author,
    game: favorite.game,
  }));

  return [
    ...reviewActivities,
    ...ratingActivities,
    ...favoriteActivities,
  ];
};
