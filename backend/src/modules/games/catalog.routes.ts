import { Router, type Request, type Response, type NextFunction } from "express";
import { authenticate, type AuthRequest } from "../auth/auth.middleware";
import { fetchRawgGames, fetchRawgGameDetails, fetchRawgSearch } from "../game-import/rawg.client";
import { saveRawgGame } from "../game-import/game-import.repository";
import { getOrSetCache } from "../../utils/cache";
import { redis } from "../../config/redis";

const router = Router();

type RawgPreview = Awaited<ReturnType<typeof fetchRawgGames>>["results"][number] & {
  rating?: number;
  ratings_count?: number;
  added?: number;
  genres?: Array<{ name: string }>;
  platforms?: Array<{ platform: { name: string } }>;
};

function normalizeGame(game: RawgPreview) {
  return {
    rawgId: game.id,
    slug: game.slug,
    name: game.name,
    coverUrl: game.background_image ?? null,
    backgroundUrl: game.background_image_additional ?? game.background_image ?? null,
    released: game.released ?? null,
    rating: typeof game.rating === "number" ? game.rating : null,
    ratingsCount: typeof game.ratings_count === "number" ? game.ratings_count : null,
    metacritic: game.metacritic ?? null,
    genres: game.genres?.map((item) => item.name) ?? [],
    platforms: game.platforms?.map((item) => item.platform.name) ?? [],
    // RAWG image URLs are metadata; these aren't downloaded into PostgreSQL.
    source: "rawg" as const,
  };
}

function parsePositiveInt(value: unknown, fallback: number, max: number) {
  if (value === undefined) return fallback;
  if (typeof value !== "string" || !/^\d+$/.test(value)) return null;
  const n = Number(value);
  return Number.isSafeInteger(n) && n >= 1 && n <= max ? n : null;
}

// Public catalogue: lists RAWG games without requiring them to be imported into NeonDB.
router.get("/catalog", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parsePositiveInt(req.query.page, 1, 1000);
    const limit = parsePositiveInt(req.query.limit, 24, 40);
    if (!page || !limit) return res.status(400).json({ success: false, message: "Invalid pagination" });

    const q = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 80) : "";
    const cacheKey = `gameboxd:rawg:catalog:${page}:${limit}:${q.toLowerCase()}`;

    const payload = await getOrSetCache(cacheKey, async () => {
      const data = q
        ? await fetchRawgSearch(q, page, limit)
        : await fetchRawgGames(page, limit);
      return {
        games: data.results.map((game) => normalizeGame(game as RawgPreview)),
        page,
        limit,
        hasMore: Boolean(data.next),
      };
    }, 900);

    return res.json({ success: true, data: payload });
  } catch (error) { next(error); }
});

// RAWG detail preview works even when the game is not saved in NeonDB.
router.get("/catalog/:rawgId", async (req: Request<{ rawgId: string }>, res: Response, next: NextFunction) => {
  try {
    const id = parsePositiveInt(req.params.rawgId, 0, Number.MAX_SAFE_INTEGER);
    if (!id) return res.status(400).json({ success: false, message: "Invalid RAWG game ID" });

    const game = await getOrSetCache(`gameboxd:rawg:detail:${id}`, () => fetchRawgGameDetails(id), 3600);
    return res.json({
      success: true,
      data: {
        ...normalizeGame(game as RawgPreview),
        description: game.description_raw ?? null,
      },
    });
  } catch (error) { next(error); }
});

// Import only when a logged-in user wants to save/interact with the game.
router.post("/catalog/:rawgId/import", authenticate, async (req: AuthRequest<{rawgId: string}>, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) return res.status(401).json({ success: false, message: "Authentication required" });
    const rateKey = `gameboxd:rate:rawg-import:${req.userId}`;
    const attempts = await redis.incr(rateKey);
    if (attempts === 1) await redis.expire(rateKey, 60);
    if (attempts > 20) return res.status(429).json({ success: false, message: "Too many import requests. Try again shortly." });
    const id = parsePositiveInt(req.params.rawgId, 0, Number.MAX_SAFE_INTEGER);
    if (!id) return res.status(400).json({ success: false, message: "Invalid RAWG game ID" });
    const game = await fetchRawgGameDetails(id);
    const imported = await saveRawgGame(game);
    return res.json({ success: true, data: { gameId: imported.gameId, slug: imported.slug } });
  } catch (error) { next(error); }
});

export default router;
