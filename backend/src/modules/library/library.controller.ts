import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../auth/auth.middleware";

import * as libraryService from "./library.service";

import {
  libraryGameIdSchema,
  libraryPaginationSchema,
} from "./library.validation";

type GameParams = { gameId: string };

export const addWishlistController = async (
  req: AuthRequest<GameParams>,
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

    const parsed = libraryGameIdSchema.safeParse(
      req.params.gameId
    );

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid game ID",
      });
    }

    const result = await libraryService.addWishlistGame(
      req.userId,
      parsed.data
    );

    if (!result) {
      return res.status(409).json({
        success: false,
        message: "Game already exists in wishlist",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Game added to wishlist",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};