import type {
  Request,
  Response,
  NextFunction,
} from "express";

import type { AuthRequest } from "../auth/auth.middleware";
import * as usersService from "./users.service";
import { updateProfileSchema } from "./users.validation";

export const getMyProfileController = async (
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

    const user = await usersService.getMyProfile(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });

  } catch (error) {
    next(error);
  }
};

