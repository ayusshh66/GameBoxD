// Server-side data adapters for the existing GameboxD discovery and views APIs.
// RAWG API keys remain exclusively on the Express server.
export type HomeGame = {
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
  todayViews?: number;
};

export type GameShelf = {
  key: string;
  title: string;
  subtitle: string | null;
  games: HomeGame[];
  hasMore: boolean;
  page: number;
};

export type GameboxdHomePayload = {
  hero: HomeGame | null;
  heroVideoUrl: string | null;
  topTen: HomeGame[];
  shelves: GameShelf[];
  unavailableSections: string[];
  trending?: HomeGame[];
};

type ApiEnvelope<T> = { success: boolean; data: T; message?: string };

const backendUrl = () => (process.env.BACKEND_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

export async function homeApi<T>(path: string): Promise<T> {
  // Only call from Next.js Server Components or the server-side data module.
  const response = await fetch(`${backendUrl()}${path}`, { cache: "no-store" });
  const body = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!response.ok || !body?.success) {
    throw new Error(`Home API ${response.status}: ${body?.message ?? "Request failed"}`);
  }
  return body.data;
}

type TrendingDbRow = {
  id: string;
  slug: string;
  name: string;
  coverUrl: string | null;
  backgroundUrl: string | null;
  releaseDate: string | null;
  averageRating: string | number | null;
  trendingScore: number;
};

/**
 * Read the existing Redis daily leaderboard. Failure/empty list must not break
 * the public RAWG homepage, especially when no GameboxD users have visited yet.
 */
async function getTodayTrending(): Promise<HomeGame[]> {
  try {
    const rows = await homeApi<TrendingDbRow[]>("/api/games/trending?limit=10");
    if (!Array.isArray(rows)) return [];
    return rows
      .filter(g => g.id && g.slug && g.name)
      .map((g): HomeGame => ({
        id: g.id,
        name: g.name,
        slug: g.slug,
        href: `/games/${encodeURIComponent(g.slug)}`,
        imageUrl: g.coverUrl ?? g.backgroundUrl,
        backgroundUrl: g.backgroundUrl ?? g.coverUrl,
        released: g.releaseDate ?? null,
        rating: g.averageRating == null || !Number.isFinite(Number(g.averageRating)) ? null : Number(g.averageRating),
        genre: null,
        source: "gameboxd",
        todayViews: Number(g.trendingScore ?? 0),
      }))
      .filter(g => g.backgroundUrl || g.imageUrl);
  } catch {
    // Browsing should remain available even if Redis is empty/offline.
    return [];
  }
}

export async function loadHome(): Promise<{ data: GameboxdHomePayload | null; error: string | null }> {
  try {
    const [data, trending] = await Promise.all([
      homeApi<GameboxdHomePayload>("/api/discovery/home"),
      getTodayTrending(),
    ]);
    return { data: { ...data, trending }, error: null };
  } catch (error) {
    console.error("GameboxD homepage API failed:", error);
    return { data: null, error: "Unable to load games. Check the backend discovery endpoint." };
  }
}
