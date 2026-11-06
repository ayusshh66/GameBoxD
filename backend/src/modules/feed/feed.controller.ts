    
import type { Response, NextFunction } from "express";

import type { AuthRequest } from "../auth/auth.middleware";

import { feedPaginationSchema } from "./feed.validation";
import * as feedService from "./feed.service";

export const getFollowingFeedController = async (
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

    const parsed = feedPaginationSchema.safeParse(
      req.query
    );

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
        errors: parsed.error.flatten(),
      });
    }

    const { page, limit } = parsed.data;

    const result = await feedService.getFollowingFeed(
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
