import { Router, type NextFunction, type Response } from "express";
import { and, desc, eq, ilike, inArray, ne, or, sql } from "drizzle-orm";
import { z } from "zod";
import {
  db,
  games,
  reviews,
  reviewLikes,
  userFavorites,
  userFollows,
  userWishlist,
  users,
} from "../../db";
import { userGameLogs, notificationReads } from "../../db/schema/social";
import { authenticate, type AuthRequest } from "../auth/auth.middleware";

const router = Router();
const safely =
  (fn: (req: AuthRequest, res: Response) => Promise<unknown>) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
const pageLimit = (v: unknown, fallback = 20) =>
  Math.max(1, Math.min(50, Number(v) || fallback));
const searchQuery = z.string().trim().min(2).max(70);
const logBody = z
  .object({
    status: z.enum(["playing", "completed", "paused", "dropped", "played"]),
    playtimeMinutes: z.number().int().min(0).max(1000000).nullable().optional(),
    note: z.string().trim().max(500).nullable().optional(),
  })
  .strict();

// Public search: never return email, passwordHash, or private user information.
router.get(
  "/search/users",
  safely(async (req, res) => {
    const parsed = searchQuery.safeParse(req.query.q);
    if (!parsed.success)
      return res
        .status(400)
        .json({
          success: false,
          message: "Search must contain 2–70 characters",
        });
    const q = parsed.data.replace(/[\\%_]/g, "\\$&");
    const result = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        bio: users.bio,
      })
      .from(users)
      .where(
        or(ilike(users.username, `%${q}%`), ilike(users.displayName, `%${q}%`)),
      )
      .orderBy(users.username)
      .limit(pageLimit(req.query.limit, 10));
    return res.json({ success: true, data: result });
  }),
);

// Local games + optional RAWG catalogue. RAWG key never reaches the browser.
router.get(
  "/search/games",
  safely(async (req, res) => {
    const parsed = searchQuery.safeParse(req.query.q);
    if (!parsed.success)
      return res
        .status(400)
        .json({
          success: false,
          message: "Search must contain 2–70 characters",
        });
    const q = parsed.data.replace(/[\\%_]/g, "\\$&");
    const limit = pageLimit(req.query.limit, 12);
    const local = await db
      .select({
        id: games.id,
        slug: games.slug,
        name: games.name,
        coverUrl: games.coverUrl,
        backgroundUrl: games.backgroundUrl,
        averageRating: games.averageRating,
      })
      .from(games)
      .where(ilike(games.name, `%${q}%`))
      .orderBy(games.name)
      .limit(limit);
    let rawg: Array<{
      id: number;
      slug: string;
      name: string;
      background_image: string | null;
      rating: number | null;
    }> = [];
    let rawgUnavailable = false;
    if (process.env.RAWG_API_KEY) {
      try {
        const url = new URL("https://api.rawg.io/api/games");
        url.searchParams.set("key", process.env.RAWG_API_KEY);
        url.searchParams.set("search", parsed.data);
        url.searchParams.set("page_size", String(limit));
        const response = await fetch(url, {
          signal: AbortSignal.timeout(8000),
        });
        if (!response.ok) throw new Error(`RAWG ${response.status}`);
        const body = (await response.json()) as { results?: typeof rawg };
        rawg = body.results ?? [];
      } catch (error) {
        rawgUnavailable = true;
        console.warn("RAWG search unavailable:", error);
      }
    } else {
      rawgUnavailable = true;
    }
    const seen = new Set(
      local.map((g) => g.name.toLowerCase().replace(/[^a-z0-9]/g, "")),
    );
    return res.json({
      success: true,
      data: {
        local: local.map((g) => ({
          ...g,
          href: `/games/${encodeURIComponent(g.slug)}`,
        })),
        rawg: rawg
          .filter((g) => {
            const key = g.name.toLowerCase().replace(/[^a-z0-9]/g, "");
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .map((g) => ({
            id: g.id,
            name: g.name,
            slug: g.slug,
            coverUrl: g.background_image,
            averageRating: g.rating,
            href: `/games/rawg/${g.id}`,
          })),
        rawgUnavailable,
      },
    });
  }),
);

// Public community highlights: latest reviews, popular among recent reviews, and gamers to discover.
router.get(
  "/community",
  safely(async (_req, res) => {
    const recent = await db
      .select({
        id: reviews.id,
        content: reviews.content,
        isSpoiler: reviews.isSpoiler,
        createdAt: reviews.createdAt,
        game: {
          id: games.id,
          slug: games.slug,
          name: games.name,
          coverUrl: games.coverUrl,
        },
        user: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .innerJoin(games, eq(reviews.gameId, games.id))
      .orderBy(desc(reviews.createdAt))
      .limit(60);
    const counts = recent.length
      ? await db
          .select({
            reviewId: reviewLikes.reviewId,
            likes: sql<number>`count(*)::int`,
          })
          .from(reviewLikes)
          .where(
            inArray(
              reviewLikes.reviewId,
              recent.map((r) => r.id),
            ),
          )
          .groupBy(reviewLikes.reviewId)
      : [];
    const byId = new Map(counts.map((r) => [r.reviewId, Number(r.likes)]));
    const enriched = recent.map((r) => ({ ...r, likes: byId.get(r.id) ?? 0 }));
    const newestGamers = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        bio: users.bio,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(12);
    return res.json({
      success: true,
      data: {
        latest: enriched.slice(0, 12),
        popularRecent: [...enriched]
          .sort(
            (a, b) =>
              b.likes - a.likes ||
              +new Date(b.createdAt) - +new Date(a.createdAt),
          )
          .slice(0, 12),
        players: newestGamers,
      },
    });
  }),
);

// Only the routes below require a cookie. Keep the public search/community routes accessible.
router.use(authenticate);

router.get(
  "/library",
  safely(async (req, res) => {
    const userId = req.userId!;
    const [wishlist, favorites, logs] = await Promise.all([
      db
        .select({
          gameId: games.id,
          slug: games.slug,
          name: games.name,
          coverUrl: games.coverUrl,
          status: sql<string>`'wishlist'`,
          createdAt: userWishlist.createdAt,
        })
        .from(userWishlist)
        .innerJoin(games, eq(userWishlist.gameId, games.id))
        .where(eq(userWishlist.userId, userId))
        .orderBy(desc(userWishlist.createdAt))
        .limit(100),
      db
        .select({
          gameId: games.id,
          slug: games.slug,
          name: games.name,
          coverUrl: games.coverUrl,
          status: sql<string>`'favorite'`,
          createdAt: userFavorites.createdAt,
        })
        .from(userFavorites)
        .innerJoin(games, eq(userFavorites.gameId, games.id))
        .where(eq(userFavorites.userId, userId))
        .orderBy(desc(userFavorites.createdAt))
        .limit(100),
      db
        .select({
          gameId: games.id,
          slug: games.slug,
          name: games.name,
          coverUrl: games.coverUrl,
          status: userGameLogs.status,
          playtimeMinutes: userGameLogs.playtimeMinutes,
          note: userGameLogs.note,
          createdAt: userGameLogs.createdAt,
          updatedAt: userGameLogs.updatedAt,
        })
        .from(userGameLogs)
        .innerJoin(games, eq(userGameLogs.gameId, games.id))
        .where(eq(userGameLogs.userId, userId))
        .orderBy(desc(userGameLogs.updatedAt))
        .limit(100),
    ]);
    return res.json({ success: true, data: { wishlist, favorites, logs } });
  }),
);

router.put(
  "/logs/:gameId",
  safely(async (req, res) => {
    const gameId = z.string().uuid().safeParse(req.params.gameId);
    const body = logBody.safeParse(req.body);
    if (!gameId.success || !body.success)
      return res
        .status(400)
        .json({ success: false, message: "Invalid game ID or log data" });
    const [game] = await db
      .select({ id: games.id })
      .from(games)
      .where(eq(games.id, gameId.data))
      .limit(1);
    if (!game)
      return res
        .status(404)
        .json({
          success: false,
          message: "Import this RAWG game before logging it",
        });
    const now = new Date();
    const [saved] = await db
      .insert(userGameLogs)
      .values({
        userId: req.userId!,
        gameId: gameId.data,
        ...body.data,
        startedAt: body.data.status === "playing" ? now : null,
        completedAt: body.data.status === "completed" ? now : null,
      })
      .onConflictDoUpdate({
        target: [userGameLogs.userId, userGameLogs.gameId],
        set: {
          status: body.data.status,
          ...(body.data.note !== undefined ? { note: body.data.note } : {}),
          ...(body.data.playtimeMinutes !== undefined
            ? { playtimeMinutes: body.data.playtimeMinutes }
            : {}),
          ...(body.data.status === "completed" ? { completedAt: now } : {}),
          updatedAt: now,
        },
      })
      .returning();
    return res.status(200).json({ success: true, data: saved });
  }),
);

router.delete(
  "/logs/:gameId",
  safely(async (req, res) => {
    const gameId = z.string().uuid().safeParse(req.params.gameId);
    if (!gameId.success)
      return res
        .status(400)
        .json({ success: false, message: "Invalid game ID" });
    const [deleted] = await db
      .delete(userGameLogs)
      .where(
        and(
          eq(userGameLogs.userId, req.userId!),
          eq(userGameLogs.gameId, gameId.data),
        ),
      )
      .returning();
    return res
      .status(deleted ? 200 : 404)
      .json({
        success: Boolean(deleted),
        message: deleted ? "Game log removed" : "Game log not found",
      });
  }),
);

type NotificationItem = {
  eventKey: string;
  type: "follow" | "review_like";
  createdAt: Date;
  actor: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  href: string;
  read: boolean;
};
async function notificationsFor(userId: string): Promise<NotificationItem[]> {
  const [follows, likes, reads] = await Promise.all([
    db
      .select({
        actorId: userFollows.followerId,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        createdAt: userFollows.createdAt,
      })
      .from(userFollows)
      .innerJoin(users, eq(userFollows.followerId, users.id))
      .where(eq(userFollows.followingId, userId))
      .orderBy(desc(userFollows.createdAt))
      .limit(40),
    db
      .select({
        actorId: reviewLikes.userId,
        reviewId: reviewLikes.reviewId,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        gameSlug: games.slug,
        createdAt: reviewLikes.createdAt,
      })
      .from(reviewLikes)
      .innerJoin(reviews, eq(reviewLikes.reviewId, reviews.id))
      .innerJoin(users, eq(reviewLikes.userId, users.id))
      .innerJoin(games, eq(reviews.gameId, games.id))
      .where(and(eq(reviews.userId, userId), ne(reviewLikes.userId, userId)))
      .orderBy(desc(reviewLikes.createdAt))
      .limit(40),
    db
      .select({ eventKey: notificationReads.eventKey })
      .from(notificationReads)
      .where(eq(notificationReads.userId, userId))
      .limit(200),
  ]);
  const readKeys = new Set(reads.map((r) => r.eventKey));
  const events: NotificationItem[] = [
    ...follows.map((f) => ({
      eventKey: `follow:${f.actorId}`,
      type: "follow" as const,
      createdAt: f.createdAt,
      actor: {
        username: f.username,
        displayName: f.displayName,
        avatarUrl: f.avatarUrl,
      },
      href: `/users/${encodeURIComponent(f.username)}`,
      read: readKeys.has(`follow:${f.actorId}`),
    })),
    ...likes.map((l) => ({
      eventKey: `review-like:${l.actorId}:${l.reviewId}`,
      type: "review_like" as const,
      createdAt: l.createdAt,
      actor: {
        username: l.username,
        displayName: l.displayName,
        avatarUrl: l.avatarUrl,
      },
      href: `/games/${encodeURIComponent(l.gameSlug)}`,
      read: readKeys.has(`review-like:${l.actorId}:${l.reviewId}`),
    })),
  ];
  return events
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 40);
}

router.get(
  "/notifications",
  safely(async (req, res) => {
    const items = await notificationsFor(req.userId!);
    return res.json({
      success: true,
      data: { items, unreadCount: items.filter((n) => !n.read).length },
    });
  }),
);
router.post(
  "/notifications/read",
  safely(async (req, res) => {
    const { eventKey, all } = req.body ?? {};
    const events = await notificationsFor(req.userId!);
    const keys =
      all === true
        ? events.map((e) => e.eventKey)
        : events.filter((e) => e.eventKey === eventKey).map((e) => e.eventKey);
    if (!keys.length)
      return res
        .status(400)
        .json({ success: false, message: "Notification not found" });
    await db
      .insert(notificationReads)
      .values(keys.map((key) => ({ userId: req.userId!, eventKey: key })))
      .onConflictDoNothing();
    return res.json({ success: true, data: { updated: keys.length } });
  }),
);

router.post(
  "/logout",
  safely(async (_req, res) => {
    res.clearCookie("token", { path: "/" });
    return res.json({ success: true, message: "Signed out" });
  }),
);

export default router;
