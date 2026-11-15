import type { Metadata } from "next";
import { getDiscoverData } from "@/lib/discover-data";
import DiscoverClient from "@/components/discover/discover-client";
import "./discover.css";

export const metadata: Metadata = {
  title: "Discover Games | GameboxD",
  description: "Explore games, discover new favorites, and read reviews from gamers you follow.",
};

export default async function DiscoverPage({ searchParams }: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 80) : "";
  const data = await getDiscoverData(q);
  return <DiscoverClient initialData={data} query={q} />;
}
