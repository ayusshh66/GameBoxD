
import { Router } from "express";

import { authenticate } from "../auth/auth.middleware";

import { getFollowingFeedController } from "./feed.controller";

const router = Router();

router.get(
  "/following",
  authenticate,
  getFollowingFeedController
);

export default router;
