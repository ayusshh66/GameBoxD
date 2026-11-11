
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

//unlike a review 
export const removeReviewLike = async(
  userId:string,
  reviewId:string,
) => {
  const [deleted] = await db.delete(reviewLikes).where(
    and(eq(reviewLikes.reviewId, reviewId), eq(reviewLikes.userId, userId))
  ).returning()

  return deleted ?? null;
}

// Total likes on a review
export const countReviewLikes = async (
  reviewId: string
) => {
  const [result] = await db
    .select({ total: count() })
    .from(reviewLikes)
    .where(eq(reviewLikes.reviewId, reviewId));

  return result.total;
};

// Check if a specific user liked a review
export const findUserReviewLike = async (
  userId: string,
  reviewId: string
) => {
  const [result] = await db
    .select({ userId: reviewLikes.userId })
    .from(reviewLikes)
    .where(
      and(
        eq(reviewLikes.userId, userId),
        eq(reviewLikes.reviewId, reviewId)
      )
    )
    .limit(1);

  return result ?? null;
};

