import type { Response, NextFunction } from "express";
import { createReviewSchema, gameIdSchema, paginationSchema, ratingSchema } from "./reviews.validation";
import { createGameReview, deleteRating, getGameReviews, rateGame } from "./reviews.service";
import type { AuthRequest } from "../auth/auth.middleware";

export const rateGameController = async (
  req: AuthRequest<{ gameId: string }>,
  res: Response,
  next: NextFunction,
) => {
  const result = await gameIdSchema.safeParseAsync(req.params.gameId);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: result.error.flatten(),
    });
  }

  const gameId = result.data;

  const ratingResult = await ratingSchema.safeParseAsync(req.body);

  if (!ratingResult.success) {
    return res.status(400).json({
      success: false,
      error: ratingResult.error.flatten(),
    });
  }

  const rating = ratingResult.data.rating;

  // Check authentication
  if (!req.userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    const rate = await rateGame(
      gameId,
      req.userId,
      rating
    );

    if (!rate) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Game rated successfully",
      data: rate,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRatingController = async (
  req: AuthRequest<{ gameId: string }>,
  res: Response
) => {
  const gameId = req.params.gameId;

  if (!gameIdSchema.safeParse(gameId).success) {
    return res.status(400).json({ message: "Invalid game ID" });
  }

  if (!req.userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    const deleted = await deleteRating(gameId, req.userId);

    if (!deleted) {
      return res.status(404).json({ message: "Rating not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Rating deleted successfully",
    });
  } catch (error) {
    console.error("Delete rating error:", error);
    return res.status(500).json({ message: "Failed to delete rating" });
  }
};

export const createReviewController = async (
  req: AuthRequest<{gameId: string}>,
  res: Response
) => {
  const gameId = req.params.gameId;

  if (!gameIdSchema.safeParse(gameId).success) {
    return res.status(400).json({ message: "Invalid game ID" });
  }

  const parsed = createReviewSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid review",
      errors: parsed.error.flatten(),
    });
  }

  if (!req.userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    const result = await createGameReview(
      gameId,
      req.userId,
      parsed.data
    );

    if (result.status === "game_not_found") {
      return res.status(404).json({ message: "Game not found" });
    }

    if (result.status === "already_exists") {
      return res.status(409).json({
        message: "You have already reviewed this game",
      });
    }

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Create review error:", error);
    return res.status(500).json({ message: "Failed to create review" });
  }
};

export const getGameReviewsController = async (
  req: AuthRequest<{gameId:string}>,
  res: Response
) => {
  const gameId = req.params.gameId ;

  if (!gameIdSchema.safeParse(gameId).success) {
    return res.status(400).json({ message: "Invalid game ID" });
  }

  const parsed = paginationSchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid pagination" });
  }

  try {
    const { page, limit } = parsed.data;
    const data = await getGameReviews(gameId, page, limit);

    return res.status(200).json({
      success: true,
      page,
      limit,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Fetch reviews error:", error);
    return res.status(500).json({ message: "Failed to fetch reviews" });
  }
};
