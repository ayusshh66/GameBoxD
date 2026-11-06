
import * as feedRepository from "./feed.repository";

export const getFollowingFeed = async (
  userId: string,
  page: number,
  limit: number
) => {
  const offset = (page - 1) * limit;

  const reviews = await feedRepository.getFollowingReviews(
    userId,
    limit,
    offset
  );

  const hasMore = reviews.length > limit;

  const activities = reviews
    .slice(0, limit)
    .map((review) => ({
      type: "review" as const,
      ...review,
    }));

  return {
    activities,
    page,
    limit,
    hasMore,
  };
};
