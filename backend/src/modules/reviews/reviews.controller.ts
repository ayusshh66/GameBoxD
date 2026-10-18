import type { Response, NextFunction } from "express";
import { gameIdSchema, ratingSchema } from "./reviews.validation";
import { rateGame } from "./reviews.service";
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