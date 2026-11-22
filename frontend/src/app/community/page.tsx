import GameboxdHome from "@/components/home/gameboxd-home";
import { loadHome } from "@/lib/home-data";

export const metadata = { title: "Community | GameboxD" };
// Community hub uses only real games and links to your existing Following Feed.
// Dedicated public-post discovery is a separate backend milestone.
export default async function CommunityPage() {
  const { data, error } = await loadHome();
  return <GameboxdHome data={data ? { ...data, hero: data.shelves.find(s => s.key === "community")?.games[0] ?? null, shelves: data.shelves.filter(s => s.key === "community"), topTen: [] } : null} error={error} />;
}
