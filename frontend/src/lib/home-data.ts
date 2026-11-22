// Shared server-side response types for the new GameboxD homepage.
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
};

type ApiEnvelope<T> = { success: boolean; data: T; message?: string };

export async function homeApi<T>(path: string): Promise<T> {
  // Only call this in Next.js Server Components. RAWG_API_KEY never reaches the browser.
  const backend = (process.env.BACKEND_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");
  const response = await fetch(`${backend}${path}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Backend request failed (${response.status})`);
  const body = (await response.json()) as ApiEnvelope<T>;
  if (!body.success) throw new Error(body.message ?? "Backend returned an error");
  return body.data;
}

export async function loadHome(): Promise<{ data: GameboxdHomePayload | null; error: string | null }> {
  try {
    return { data: await homeApi<GameboxdHomePayload>("/api/games/home"), error: null };
  } catch (error) {
    console.error("GameboxD homepage API failed:", error);
    return { data: null, error: "Unable to load games. Check Express, Redis, and RAWG_API_KEY." };
  }
}
