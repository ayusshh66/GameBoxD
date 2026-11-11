
import { Router } from "express";
import { authenticate } from "../auth/auth.middleware";

import {
  likeReviewController,
  unlikeReviewController,
  getReviewLikesController,
  getReviewLikeStatusController,
} from "./review-likes.controller";

const router = Router();

router.post(
  "/:reviewId/like",
  authenticate,
  likeReviewController
);

router.delete(
  "/:reviewId/like",
  authenticate,
  unlikeReviewController
);

router.get(
  "/:reviewId/likes",
  getReviewLikesController
);

router.get(
  "/:reviewId/like-status",
  authenticate,
  getReviewLikeStatusController
);

export default router;
