
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

// Wishlist
router.post(
  "/games/:gameId/wishlist",
  authenticate,
  addWishlistController
);

router.delete(
  "/games/:gameId/wishlist",
  authenticate,
  deleteWishlistController
);

router.get(
  "/users/me/wishlist",
  authenticate,
  getWishlistController
);

// Favorites
router.post(
  "/games/:gameId/favorite",
  authenticate,
  addFavoriteController
);

router.delete(
  "/games/:gameId/favorite",
  authenticate,
  deleteFavoriteController
);

router.get(
  "/users/me/favorites",
  authenticate,
  getFavoritesController
);

export default router;
