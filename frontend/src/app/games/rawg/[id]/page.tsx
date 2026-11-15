import Link from "next/link";
import { backendGet, type CatalogGame } from "@/lib/discover-data";
import GameDetailView from "@/components/games/game-detail-view";
import { EMPTY_EXTRA, type PageExtra } from "@/components/games/game-detail-types";

type RawgDetails = CatalogGame & { description?: string | null };

export default async function RawgGamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isSafeInteger(numericId) || numericId < 1) {
    return <main className="min-h-screen bg-[#011717] p-10 text-[#F0F7F6]">Invalid game ID. <Link href="/discover">Discover games</Link></main>;
  }
  const [gameResult, extraResult] = await Promise.allSettled([
    backendGet<RawgDetails>(`/api/games/catalog/${numericId}`),
    backendGet<PageExtra>(`/api/games/catalog/${numericId}/page-data`),
  ]);
  if (gameResult.status !== "fulfilled") {
    return <main className="min-h-screen bg-[#011717] p-10 text-[#F0F7F6]">Unable to load this game from RAWG right now. <Link href="/discover" className="text-[#FC521E]">Back to Discover</Link></main>;
  }
  const game = gameResult.value;
  const extra = extraResult.status === "fulfilled" ? extraResult.value : { ...EMPTY_EXTRA, rawgId: numericId };
  return <GameDetailView game={{
    name: game.name, slug: game.slug, rawgId: numericId,
    localId: extra.localId,
    coverUrl: game.coverUrl, backgroundUrl: game.backgroundUrl,
    description: game.description ?? null,
    releaseDate: game.released,
    genres: game.genres ?? [], platforms: game.platforms ?? [],
    rawgRating: game.rating,
    extra,
  }} />;
}
