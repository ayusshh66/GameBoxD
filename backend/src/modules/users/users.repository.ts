
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema";
import { count } from "drizzle-orm";
import {
  reviews,
  userGameRatings,
  userFavorites,
} from "../../db/schema";
import type { UpdateProfileInput } from "./users.validation";

const privateFields = {
  id: users.id,
  username: users.username,
  email: users.email,
  displayName: users.displayName,
  bio: users.bio,
  avatarUrl: users.avatarUrl,
  role: users.role,
  isVerified: users.isVerified,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

export const findUserById = async (userId: string) => {
  const [user] = await db
    .select(privateFields)
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user ?? null;
};

export const findUserByUsername = async (
  username: string
) => {
  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      bio: users.bio,
      avatarUrl: users.avatarUrl,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  return user ?? null;
};

export const updateUserProfile = async (
  userId: string,
  data: UpdateProfileInput
) => {
  const [updatedUser] = await db
    .update(users)
    .set(data)
    .where(eq(users.id, userId))
    .returning(privateFields);

  return updatedUser ?? null;
};


export const getUserProfileStats = async (userId: string) => {

  const [reviewStats, ratingStats, favoriteStats] =
    await Promise.all([

      db.select({ count: count() })
        .from(reviews)
        .where(eq(reviews.userId, userId)),

      db.select({ count: count() })
        .from(userGameRatings)
        .where(eq(userGameRatings.userId, userId)),

      db.select({ count: count() })
        .from(userFavorites)
        .where(eq(userFavorites.userId, userId)),

    ]);

  return {
    reviewsCount: reviewStats[0].count,
    ratingsCount: ratingStats[0].count,
    favoritesCount: favoriteStats[0].count,
  };
};
