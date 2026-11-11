import type {
  Request,
  Response,
  NextFunction,
} from "express";

import type { AuthRequest } from "../auth/auth.middleware";
import { reviewIdSchema } from "../reviews/reviews.validation";
import * as service from "./review-likes.service";

type ReviewParams = { reviewId: string };

// POST - Like review
export const likeReviewController = async (
  req: AuthRequest<ReviewParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const parsed = reviewIdSchema.safeParse(
      req.params.reviewId
    );

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const result = await service.likeReview(
      req.userId,
      parsed.data
    );

    if (result === "review_not_found") {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (result === "already_liked") {
      return res.status(409).json({
        success: false,
        message: "You already liked this review",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Review liked successfully",
    });
  } catch (error) {
    next(error);
  }
};

// DELETE - Unlike review
export const unlikeReviewController = async (
  req: AuthRequest<ReviewParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const parsed = reviewIdSchema.safeParse(
      req.params.reviewId
    );

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const result = await service.unlikeReview(
      req.userId,
      parsed.data
    );

    if (result === "review_not_found") {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (result === "not_liked") {
      return res.status(404).json({
        success: false,
        message: "You haven't liked this review",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review unliked successfully",
    });
  } catch (error) {
    next(error);
  }
};

// GET - Total review likes (public)
export const getReviewLikesController = async (
  req: Request<ReviewParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsed = reviewIdSchema.safeParse(
      req.params.reviewId
    );

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const result = await service.getReviewLikes(
      parsed.data
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};