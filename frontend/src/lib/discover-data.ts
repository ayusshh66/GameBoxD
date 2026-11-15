// Server-only data reader for the public Discover page.
// The browser never calls RAWG or receives your RAWG API key.

export type CatalogGame = {
  rawgId: number;
  slug: string;
  name: string;
  coverUrl: string | null;
  backgroundUrl: string | null;
  released: string | null;
  rating: number | null;
  ratingsCount: number | null;
  metacritic: number | null;
  genres: string[];
  platforms: string[];
  source: "rawg";
};

export type LocalGame = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  backgroundUrl: string | null;
  releaseDate: string | null;
  averageRating: string | number | null;
  ratingsCount: number;
  reviewsCount: number;
  trendingScore?: number;
};

export type FeedAuthor = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type FeedActivity = {
  type: "review" | "rating" | "favorite";
  id: string;
  content?: string;
  isSpoiler?: boolean;
  rating?: string;
  createdAt: string;
  author: FeedAuthor;
  game: { id: string; name: string; slug: string; coverUrl: string | null };
};

export type FeedPayload = {
  activities: FeedActivity[];
  page: number;
  limit: number;
  hasMore: boolean;
};

type Api<T> = { success: boolean; data: T; message?: string };

export async function backendGet<T>(path: string): Promise<T> {
  const base = process.env.BACKEND_URL || "http://127.0.0.1:8000";
  const response = await fetch(`${base}${path}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Backend returned ${response.status} for ${path}`);
  const json = (await response.json()) as Api<T>;
  if (!json.success) throw new Error(json.message ?? "Backend request failed");
  return json.data;
}

export async function getDiscoverData(q = "") {
  const query = q ? `&q=${encodeURIComponent(q)}` : "";
  const [catalogResult, trendingResult, topResult] = await Promise.allSettled([
    backendGet<{ games: CatalogGame[]; page: number; limit: number; hasMore: boolean }>(`/api/games/catalog?page=1&limit=24${query}`),
    backendGet<LocalGame[]>("/api/games/trending?limit=6"),
    backendGet<LocalGame[]>("/api/games/top?limit=6"),
  ]);

  return {
    catalog: catalogResult.status === "fulfilled" ? catalogResult.value : { games: [], page: 1, limit: 24, hasMore: false },
    trending: trendingResult.status === "fulfilled" && Array.isArray(trendingResult.value) ? trendingResult.value : [],
    top: topResult.status === "fulfilled" && Array.isArray(topResult.value) ? topResult.value : [],
    error: catalogResult.status === "rejected" ? "Unable to load the RAWG catalogue. Check your Express server, Redis, and RAWG_API_KEY." : null,
  };
}
