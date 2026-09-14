import express from "express";
import { getGame, getGames } from "./games.controller";

const router = express.Router();

router.get("/games", getGames);
router.get("/game/:slug", getGame);

export default router;

