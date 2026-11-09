
import { and, count, eq } from "drizzle-orm";
import { db, reviews, reviewLikes } from "../../db";

// Check if the review exists
export const findReview = async (reviewId: string) => {
  const [review] = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(eq(reviews.id, reviewId))
    .limit(1);

  return review ?? null;
};

// Like a review
export const addReviewLike = async (
  userId: string,
  reviewId: string
) => {
  const [result] = await db
    .insert(reviewLikes)
    .values({ userId, reviewId })
    .onConflictDoNothing()
    .returning();

  return result ?? null;
};

