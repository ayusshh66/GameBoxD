import type {
  Request,
  Response,
  NextFunction,
} from "express";

import type { AuthRequest } from "../auth/auth.middleware";
import {
  usernameSchema,
  followPaginationSchema,
} from "./follows.validation";

import * as followsService from "./follows.service";

type UsernameParams = { username: string };

// POST - Follow user
export const followUserController = async (
  req: AuthRequest<UsernameParams>,
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

    const parsed = usernameSchema.safeParse(
      req.params.username
    );

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid username",
      });
    }

    const result = await followsService.followUser(
      req.userId,
      parsed.data
    );

    switch (result.status) {
      case "not_found":
        return res.status(404).json({
          success: false,
          message: "User not found",
        });

      case "self_follow":
        return res.status(400).json({
          success: false,
          message: "You cannot follow yourself",
        });

      case "already_following":
        return res.status(409).json({
          success: false,
          message: "Already following this user",
        });

      case "followed":
        return res.status(201).json({
          success: true,
          message: "User followed successfully",
        });
    }
  } catch (error) {
    next(error);
  }
};