import { Router } from "express";
import { authenticate } from "../auth/auth.middleware";

import {
  rateGameController,
  deleteRatingController,
  createReviewController,
  getGameReviewsController,
  updateReviewController,
  deleteReviewController,
} from "./reviews.controller";

const router = Router();

router.put(
  "/games/:gameId/rating",
  authenticate,
  rateGameController
);

router.delete(
  "/games/:gameId/rating",
  authenticate,
  deleteRatingController
);

router.post(
  "/games/:gameId/reviews",
  authenticate,
  createReviewController
);

router.get(
  "/games/:gameId/reviews",
  getGameReviewsController
);

router.patch(
  "/reviews/:reviewId",
  authenticate,
  updateReviewController
);

router.delete(
  "/reviews/:reviewId",
  authenticate,
  deleteReviewController
);

export default router;