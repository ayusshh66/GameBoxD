import { Router } from "express";
import { authenticate } from "../auth/auth.middleware";

import {
  followUserController,
  unfollowUserController,
  getFollowersController,
  getFollowingController,
  getFollowStatusController,
} from "./follows.controller";

const router = Router();

router.post(
  "/:username/follow",
  authenticate,
  followUserController
);

router.delete(
  "/:username/follow",
  authenticate,
  unfollowUserController
);

router.get(
  "/:username/followers",
  getFollowersController
);

router.get(
  "/:username/following",
  getFollowingController
);

router.get(
  "/:username/follow-status",
  authenticate,
  getFollowStatusController
);

export default router;
