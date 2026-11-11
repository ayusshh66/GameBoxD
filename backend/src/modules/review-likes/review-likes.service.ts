import * as repository from "./review-likes.repository";

//fnc to like a review
export const likeReview = async (
  userId: string,
  reviewId: string
) => {
  const review = await repository.findReview(reviewId);

  if (!review) {
    return "review_not_found" as const;
  }

  const result = await repository.addReviewLike(
    userId,
    reviewId
  );

  return result
    ? ("liked" as const)
    : ("already_liked" as const);
};

//func to unlike a review 
export const unlikeReview = async (
  userId: string,
  reviewId: string
) => {
  const review = await repository.findReview(reviewId);

  if (!review) {
    return "review_not_found" as const;
  }

  const deleted = await repository.removeReviewLike(
    userId,
    reviewId
  );

  return deleted
    ? ("unliked" as const)
    : ("not_liked" as const);
};
