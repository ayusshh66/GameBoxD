
import * as feedRepository from "./feed.repository";

export const getFollowingFeed = async (
  userId: string,
  page: number,
  limit: number
) => {
  const offset = (page - 1) * limit;

  const allActivities =
    await feedRepository.getFollowingActivities(
      userId,
      limit,
      offset
    );

  // Newest activities first.
  // Use type and ID to break timestamp ties.
  allActivities.sort((a, b) => {
    const timeDifference =
      b.createdAt.getTime() - a.createdAt.getTime();

    if (timeDifference !== 0) {
      return timeDifference;
    }

    const typeDifference =
      a.type.localeCompare(b.type);

    if (typeDifference !== 0) {
      return typeDifference;
    }

    return a.id.localeCompare(b.id);
  });

  // Get the requested page plus one extra record.
  const pageActivities = allActivities.slice(
    offset,
    offset + limit + 1
  );

  const hasMore = pageActivities.length > limit;

  const activities = pageActivities.slice(0, limit);

  return {
    activities,
    page,
    limit,
    hasMore,
  };
};
