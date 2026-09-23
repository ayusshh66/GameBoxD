import { RequestHandler, Router } from "express";

import {
  getGames,
  getGame,
  latestGames,
  upcomingGames,
  topGames,
  searchTopGames,
  postGame,
  patchGame,
  deletedGame,
} from "./games.controller";
import { authenticate } from "../auth/auth.middleware";
import { authorize } from "../../db/middleware/authorize";

const router = Router();

router.get("/", getGames);

router.get("/latest", latestGames);

router.get("/upcoming", upcomingGames);

router.get("/top", topGames);

router.get("/search", searchTopGames);

router.get("/:slug", getGame);

router.patch(
  "/:gameId",
  authenticate,
  authorize("admin","moderator"),
  patchGame as RequestHandler,
);

router.delete(
  "/:gameId",
  authenticate,
  authorize("admin"),
  deletedGame
)

router.post(
  "/",
  authenticate,
  authorize("admin", "moderator"),
  postGame
);


export default router;  