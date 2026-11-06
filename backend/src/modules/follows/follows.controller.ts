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

// DELETE - Unfollow user
export const unfollowUserController = async (
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

    const result = await followsService.unfollowUser(
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
          message: "You cannot unfollow yourself",
        });

      case "not_following":
        return res.status(404).json({
          success: false,
          message: "You are not following this user",
        });

      case "unfollowed":
        return res.status(200).json({
          success: true,
          message: "User unfollowed successfully",
        });
    }
  } catch (error) {
    next(error);
  }
};

// GET - Followers
export const getFollowersController = async (
  req: Request<UsernameParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const username = usernameSchema.safeParse(
      req.params.username
    );

    const pagination = followPaginationSchema.safeParse(
      req.query
    );

    if (!username.success || !pagination.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request parameters",
      });
    }

    const { page, limit } = pagination.data;

    const result = await followsService.fetchFollowers(
      username.data,
      page,
      limit
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "User not found",
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

// GET - Following
export const getFollowingController = async (
  req: Request<UsernameParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const username = usernameSchema.safeParse(
      req.params.username
    );

    const pagination = followPaginationSchema.safeParse(
      req.query
    );

    if (!username.success || !pagination.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request parameters",
      });
    }

    const { page, limit } = pagination.data;

    const result = await followsService.fetchFollowing(
      username.data,
      page,
      limit
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "User not found",
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