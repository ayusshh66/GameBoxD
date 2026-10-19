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

export const deleteWishlistController = async (
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

    const deleted = await libraryService.deleteWishlistGame(
      req.userId,
      parsed.data
    );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Game not found in wishlist",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Game removed from wishlist",
    });
  } catch (error) {
    next(error);
  }
};

export const getWishlistController = async (
  req: AuthRequest,
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

    const parsed = libraryPaginationSchema.safeParse(
      req.query
    );

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
    }

    const { page, limit } = parsed.data;

    const result = await libraryService.fetchUserWishlist(
      req.userId,
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const addFavoriteController = async (
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

    const result = await libraryService.addFavoriteGame(
      req.userId,
      parsed.data
    );

    if (!result) {
      return res.status(409).json({
        success: false,
        message: "Game already exists in favorites",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Game added to favorites",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFavoriteController = async (
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

    const deleted = await libraryService.deleteFavoriteGame(
      req.userId,
      parsed.data
    );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Game not found in favorites",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Game removed from favorites",
    });
  } catch (error) {
    next(error);
  }
};

export const getFavoritesController = async (
  req: AuthRequest,
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

    const parsed = libraryPaginationSchema.safeParse(
      req.query
    );

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
    }

    const { page, limit } = parsed.data;

    const result = await libraryService.fetchUserFavorites(
      req.userId,
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
