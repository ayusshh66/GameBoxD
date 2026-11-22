import { Router, type Request, type Response, type NextFunction } from "express";
import { desc, gt } from "drizzle-orm";
import { db, games } from "../../db";
import { getOrSetCache } from "../../utils/cache";

/**
 * GameboxD browse shelves: uses RAWG metadata without importing every game.
 * Only read-only routes. Existing games/library/auth/review routes stay intact.
 */
const router = Router();

type RawgGame = {
  id: number;
  slug: string;
  name: string;
  background_image: string | null;
  released: string | null;
  rating: number | null;
  added?: number;
  genres?: Array<{ name: string }>;
};
type RawgList = { results: RawgGame[]; next: string | null };
type RawgParents = { results: Array<{ id: number; name: string; slug: string }> };

type GameCard = {
  id: string;
  name: string;
  slug: string;
  href: string;
  imageUrl: string | null;
  backgroundUrl: string | null;
  released: string | null;
  rating: number | null;
  genre: string | null;
  source: "rawg" | "gameboxd";
};

type ShelfDefinition = {
  key: string;
  title: string;
  subtitle?: string;
  genres?: string;
  tags?: string;
  ordering?: string;
  dates?: "pastYear";
  mobile?: boolean;
  presentation?: "poster" | "landscape";
};

const TOP: ShelfDefinition = {
  key: "top", title: "Top 10 • Most Added on RAWG", ordering: "-added",
};

const SHELVES: ShelfDefinition[] = [
  { key: "recent", title: "Recently Released", dates: "pastYear", ordering: "-released" },
  { key: "action", title: "Action & Adventure", genres: "action,adventure", ordering: "-added" },
  { key: "horror", title: "Horror Nights", tags: "horror", ordering: "-added" },
  { key: "open-world", title: "Open-World Adventures", tags: "open-world", ordering: "-added" },
  { key: "rpg", title: "RPG Worlds", genres: "role-playing-games-rpg", ordering: "-added" },
  { key: "zombies", title: "Zombie Survival", tags: "zombies", ordering: "-added" },
  { key: "indie", title: "Indie Gems", genres: "indie", ordering: "-added" },
  { key: "racing", title: "Racing Games", genres: "racing", ordering: "-added" },
  { key: "multiplayer", title: "Multiplayer With Friends", tags: "multiplayer", ordering: "-added" },
  { key: "mobile", title: "Mobile Games", mobile: true, ordering: "-added" },
];

function dateInUTC(d: Date) { return d.toISOString().slice(0, 10); }

async function rawgGet<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const key = process.env.RAWG_API_KEY;
  if (!key) throw new Error("RAWG_API_KEY is missing on the backend");
  const url = new URL(`https://api.rawg.io/api${path}`);
  url.searchParams.set("key", key);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const result = await fetch(url, { signal: AbortSignal.timeout(16000) });
  if (!result.ok) throw new Error(`RAWG /games request failed (${result.status})`);
  return (await result.json()) as T;
}

// Resolve mobile IDs from RAWG instead of hard-coding platform ID numbers.
async function mobileParentPlatforms(): Promise<string> {
  return getOrSetCache("gameboxd:rawg:mobile-parent-platforms:v1", async () => {
    const data = await rawgGet<RawgParents>("/platforms/lists/parents", { page_size: "40" });
    const ids = data.results
      .filter((p) => /(^|\b)(ios|android)(\b|$)/i.test(`${p.slug} ${p.name}`))
      .map((p) => p.id);
    if (!ids.length) throw new Error("Mobile parent platforms not found in RAWG response");
    return ids.join(",");
  }, 86400);
}

function mapRawg(g: RawgGame): GameCard {
  return {
    id: `rawg:${g.id}`,
    name: g.name,
    slug: g.slug,
    href: `/games/rawg/${g.id}`,
    imageUrl: g.background_image ?? null,
    backgroundUrl: g.background_image ?? null,
    released: g.released ?? null,
    rating: typeof g.rating === "number" ? g.rating : null,
    genre: g.genres?.[0]?.name ?? null,
    source: "rawg",
  };
}

async function getShelf(def: ShelfDefinition, page: number, limit: number) {
  const today = new Date();
  const params: Record<string, string> = {
    page: String(page), page_size: String(limit),
    ordering: def.ordering ?? "-added",
  };
  if (def.genres) params.genres = def.genres;
  if (def.tags) params.tags = def.tags;
  if (def.dates) {
    const start = new Date(today);
    start.setUTCFullYear(start.getUTCFullYear() - 1);
    params.dates = `${dateInUTC(start)},${dateInUTC(today)}`;
  }
  if (def.mobile) params.parent_platforms = await mobileParentPlatforms();
  const cacheKey = `gameboxd:rawg:home-shelf:v2:${def.key}:${page}:${limit}:${params.dates ?? "all"}`;
  return getOrSetCache(cacheKey, async () => {
    const data = await rawgGet<RawgList>("/games", params);
    return {
      key: def.key,
      title: def.title,
      subtitle: def.subtitle ?? null,
      games: data.results.map(mapRawg).filter((g) => g.imageUrl),
      hasMore: Boolean(data.next),
      page,
    };
  }, 3600);
}

// Real GameboxD review activity; no fabricated review/rating statistics.
async function getMostDiscussed() {
  const rows = await db.select({
    id: games.id, slug: games.slug, name: games.name,
    coverUrl: games.coverUrl, backgroundUrl: games.backgroundUrl,
    releaseDate: games.releaseDate, averageRating: games.averageRating,
    reviewsCount: games.reviewsCount,
  }).from(games)
    .where(gt(games.reviewsCount, 0))
    .orderBy(desc(games.reviewsCount), desc(games.ratingsCount))
    .limit(12);
  return {
    key: "community", title: "Everyone’s Talking About These", subtitle: "Most reviewed on GameboxD",
    page: 1, hasMore: false,
    games: rows.map((g): GameCard => ({
      id: g.id, slug: g.slug, name: g.name,
      href: `/games/${g.slug}`,
      imageUrl: g.coverUrl,
      backgroundUrl: g.backgroundUrl,
      released: g.releaseDate,
      rating: g.averageRating === null ? null : Number(g.averageRating),
      genre: null,
      source: "gameboxd",
    })).filter((g) => g.imageUrl),
  };
}

router.get("/home", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const definitions = [TOP, ...SHELVES];
    const results = await Promise.allSettled([
      ...definitions.map((s) => getShelf(s, 1, s.key === "top" ? 10 : 12)),
      getMostDiscussed(),
    ]);
    const succeeded = results.flatMap((r) => r.status === "fulfilled" ? [r.value] : []);
    const top = succeeded.find((s) => s.key === "top");
    const shelves = succeeded.filter((s) => s.key !== "top" && s.games.length > 0);
    const errors = results
      .map((r, i) => r.status === "rejected" ? definitions[i]?.key ?? "community" : null)
      .filter((k): k is string => k !== null);
    if (!top && shelves.length === 0) {
      return res.status(503).json({ success: false, message: "Game discovery sources are unavailable" });
    }
    return res.json({ success: true, data: {
      hero: top?.games[0] ?? shelves[0]?.games[0] ?? null,
      heroVideoUrl: null, // A licensed per-game MP4 URL can be wired later.
      topTen: top?.games ?? [],
      shelves,
      unavailableSections: errors,
    } });
  } catch (error) { next(error); }
});

router.get("/home/shelves/:key", async (req: Request<{ key: string }>, res: Response, next: NextFunction) => {
  try {
    const def = [TOP, ...SHELVES].find((s) => s.key === req.params.key);
    if (!def) return res.status(404).json({ success: false, message: "Shelf does not exist" });
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 18);
    if (!Number.isInteger(page) || page < 1 || page > 100 ||
        !Number.isInteger(limit) || limit < 1 || limit > 30) {
      return res.status(400).json({ success: false, message: "Invalid page or limit" });
    }
    return res.json({ success: true, data: await getShelf(def, page, limit) });
  } catch (error) { next(error); }
});

export default router;
