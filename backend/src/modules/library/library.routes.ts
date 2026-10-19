
import { Router } from "express";
import { authenticate } from "../auth/auth.middleware";

import {
  addWishlistController,
  deleteWishlistController,
  getWishlistController,
  addFavoriteController,
  deleteFavoriteController,
  getFavoritesController,
} from "./library.controller";

const router = Router();

// All library routes require authentication
router.use(authenticate);

// Wishlist
router.post(
  "/games/:gameId/wishlist",
  addWishlistController
);

router.delete(
  "/games/:gameId/wishlist",
  deleteWishlistController
);

router.get(
  "/users/me/wishlist",
  getWishlistController
);

// Favorites
router.post(
  "/games/:gameId/favorite",
  addFavoriteController
);

router.delete(
  "/games/:gameId/favorite",
  deleteFavoriteController
);

router.get(
  "/users/me/favorites",
  getFavoritesController
);

export default router;
