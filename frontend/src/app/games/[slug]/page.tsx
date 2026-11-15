import Link from "next/link";
import { backendGet, type LocalGame } from "@/lib/discover-data";
import GameDetailView from "@/components/games/game-detail-view";
import { EMPTY_EXTRA, type PageExtra } from "@/components/games/game-detail-types";

export default async function LocalGamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [gameResult, extraResult] = await Promise.allSettled([
    backendGet<LocalGame>(`/api/games/${encodeURIComponent(slug)}`),
    backendGet<PageExtra>(`/api/games/local/${encodeURIComponent(slug)}/page-data`),
  ]);
  if (gameResult.status !== "fulfilled") {
    return <main className="min-h-screen bg-[#011717] p-10 text-[#F0F7F6]">Game unavailable. <Link href="/discover" className="text-[#FC521E]">Back to Discover</Link></main>;
  }
  const game = gameResult.value;
  const extra = extraResult.status === "fulfilled" ? extraResult.value : {
    ...EMPTY_EXTRA,
    localId: game.id,
    localSlug: game.slug,
    community: { ...EMPTY_EXTRA.community,
      averageRating: game.averageRating == null ? null : Number(game.averageRating),
      ratingsCount: game.ratingsCount ?? 0, reviewsCount: game.reviewsCount ?? 0,
    },
  };
  return <GameDetailView game={{
    name: game.name, slug: game.slug,
    rawgId: extra.rawgId, localId: game.id,
    coverUrl: game.coverUrl, backgroundUrl: game.backgroundUrl,
    description: game.description, releaseDate: game.releaseDate,
    genres: [], platforms: [], rawgRating: null, extra,
  }} />;
}
