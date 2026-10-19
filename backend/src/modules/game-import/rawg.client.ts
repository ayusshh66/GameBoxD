
const BASE_URL = "https://api.rawg.io/api";

export interface RawgGame {
  id: number;
  slug: string;
  name: string;
  description?: string | null;
  description_raw?: string | null;
  background_image?: string | null;
  background_image_additional?: string | null;
  released?: string | null;
  tba?: boolean;
  metacritic?: number | null;
}

interface RawgGamesResponse {
  results: RawgGame[];
  next: string | null;
}

async function rawgRequest<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const apiKey = process.env.RAWG_API_KEY;

  if (!apiKey) {
    throw new Error("RAWG_API_KEY is missing");
  }

  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("key", apiKey);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`RAWG API error: ${response.status}`);
  }

  return (await response.json()) as T;
}

export const fetchRawgGames = (page: number, pageSize = 20) =>
  rawgRequest<RawgGamesResponse>("/games", {
    page: String(page),
    page_size: String(pageSize),
    ordering: "-added",
  });

export const fetchRawgGameDetails = (id: number) =>
  rawgRequest<RawgGame>(`/games/${id}`);
