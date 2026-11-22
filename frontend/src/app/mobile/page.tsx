import GameboxdHome from "@/components/home/gameboxd-home";
import { loadHome } from "@/lib/home-data";

export const metadata = { title: "Mobile Games | GameboxD" };
export default async function MobileGamesPage() {
  const { data, error } = await loadHome();
  return <GameboxdHome data={data} error={error} mode="mobile" />;
}
