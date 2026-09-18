import { Router } from "express";

import {
  getGames,
  getGame,
  latestGames,
  upcomingGames,
  topGames,
  searchTopGames,
} from "./games.controller";

const router = Router();

router.get("/", getGames);

router.get("/latest", latestGames);

router.get("/upcoming", upcomingGames);

router.get("/top", topGames);

router.get("/search", searchTopGames);

router.get("/:slug", getGame);

export default router;