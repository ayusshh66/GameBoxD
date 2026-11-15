import { Router, type Request, type Response, type NextFunction } from "express";
import { and, eq, sql } from "drizzle-orm";
import {
  db,
  games,
  gameSources,
  gameScreenshots,
  gameVideos,
  userGameRatings,
} from "../../db";
import { getOrSetCache } from "../../utils/cache";

// Supplemental read-only endpoints for the Stitch Game Details page.
// Existing games, reviews, wishlist, favorites, and auth modules stay unchanged.
const router = Router();

const validRawgId = (value: string): number | null => {
  if (!/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

type RawgScreenshotApi = {
  results?: Array<{ image?: string | null }>;
};

// Screenshots are fetched by EXPRESS, never by the frontend.
// When RAWG restricts or lacks screenshots, the UI uses the game's own background.
async function getRawgScreenshots(rawgId: number | null): Promise<string[]> {
  if (!rawgId || !process.env.RAWG_API_KEY) return [];

  try {
    return await getOrSetCache(
      `gameboxd:rawg:screenshots:${rawgId}`,
      async () => {
        const url = new URL(`https://api.rawg.io/api/games/${rawgId}/screenshots`);
        url.searchParams.set("key", process.env.RAWG_API_KEY!);
        url.searchParams.set("page_size", "8");

        const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
        if (!response.ok) return []; // video/screenshot plan restrictions are not fatal
        const json = (await response.json()) as RawgScreenshotApi;
        return (json.results ?? [])
          .map((item) => item.image)
          .filter((url): url is string => typeof url === "string" && /^https?:\/\//.test(url))
          .slice(0, 8);
      },
      1800,
    );
  } catch (error) {
    console.warn("RAWG screenshots unavailable:", error);
    return [];
  }
}

async function getGamepageDetails(localId: string | null, rawgId: number | null) {
  const [screenshots, storedScreens, videos, ratings, localRows] = await Promise.all([
    getRawgScreenshots(rawgId),
    localId
      ? db.select({ url: gameScreenshots.imageUrl })
          .from(gameScreenshots)
          .where(eq(gameScreenshots.gameId, localId))
          .limit(8)
      : Promise.resolve([] as { url: string }[]),
    localId
      ? db.select({ name: gameVideos.name, videoUrl: gameVideos.videoUrl, thumbnailUrl: gameVideos.thumbnailUrl })
          .from(gameVideos)
          .where(eq(gameVideos.gameId, localId))
          .limit(5)
      : Promise.resolve([] as { name: string | null; videoUrl: string; thumbnailUrl: string | null }[]),
    localId
      ? db.select({ rating: userGameRatings.rating, total: sql<number>`count(*)::integer` })
          .from(userGameRatings)
          .where(eq(userGameRatings.gameId, localId))
          .groupBy(userGameRatings.rating)
      : Promise.resolve([] as { rating: string; total: number }[]),
    localId
      ? db.select({ id: games.id, slug: games.slug, averageRating: games.averageRating, ratingsCount: games.ratingsCount, reviewsCount: games.reviewsCount })
          .from(games)
          .where(eq(games.id, localId))
          .limit(1)
      : Promise.resolve([] as Array<{ id: string; slug: string; averageRating: string | null; ratingsCount: number; reviewsCount: number }>),
  ]);

  const local = localRows[0] ?? null;
  // Each 0.5-step rating goes into the next whole-star bucket for this display.
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: ratings.reduce((total, row) =>
      total + (Math.ceil(Number(row.rating)) === stars ? Number(row.total) : 0), 0),
  }));

  return {
    localId: local?.id ?? null,
    localSlug: local?.slug ?? null,
    rawgId,
    screenshots: [...new Set([...storedScreens.map((r) => r.url), ...screenshots])].slice(0, 8),
    videos: videos.filter((v) => /^https?:\/\//.test(v.videoUrl)),
    community: {
      averageRating: local?.averageRating === null || local?.averageRating === undefined
        ? null : Number(local.averageRating),
      ratingsCount: local?.ratingsCount ?? 0,
      reviewsCount: local?.reviewsCount ?? 0,
      distribution,
    },
  };
}

router.get("/catalog/:rawgId/page-data", async (
  req: Request<{ rawgId: string }>, res: Response, next: NextFunction,
) => {
  try {
    const rawgId = validRawgId(req.params.rawgId);
    if (!rawgId) return res.status(400).json({ success: false, message: "Invalid RAWG ID" });
    const [match] = await db
      .select({ gameId: gameSources.gameId })
      .from(gameSources)
      .where(and(eq(gameSources.source, "rawg"), eq(gameSources.externalId, String(rawgId))))
      .limit(1);
    return res.json({ success: true, data: await getGamepageDetails(match?.gameId ?? null, rawgId) });
  } catch (error) { next(error); }
});

router.get("/local/:slug/page-data", async (
  req: Request<{ slug: string }>, res: Response, next: NextFunction,
) => {
  try {
    const [local] = await db.select({ id: games.id }).from(games)
      .where(eq(games.slug, req.params.slug)).limit(1);
    if (!local) return res.status(404).json({ success: false, message: "Game not found" });
    const [source] = await db.select({ externalId: gameSources.externalId })
      .from(gameSources)
      .where(and(eq(gameSources.gameId, local.id), eq(gameSources.source, "rawg")))
      .limit(1);
    const rawgId = source ? validRawgId(source.externalId) : null;
    return res.json({ success: true, data: await getGamepageDetails(local.id, rawgId) });
  } catch (error) { next(error); }
});

export default router;
