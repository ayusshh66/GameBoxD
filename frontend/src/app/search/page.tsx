import { Suspense } from "react";
import GlobalSearch from "@/components/social/global-search";
export const metadata = { title: "Search | GameboxD" };
export default function SearchPage() { return <Suspense fallback={<main style={{padding:120}}>Loading search…</main>}><GlobalSearch/></Suspense>; }
