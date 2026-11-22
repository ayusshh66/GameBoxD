import type { Metadata } from "next";
import GameboxdHome from "@/components/home/gameboxd-home";
import { loadHome } from "@/lib/home-data";

export const metadata: Metadata = {
  title: "Home | GameboxD",
  description: "Find your next game, explore genres, and discover what the gaming community loves.",
};

export default async function HomePage() {
  const { data, error } = await loadHome();
  return <GameboxdHome data={data} error={error} />;
}
