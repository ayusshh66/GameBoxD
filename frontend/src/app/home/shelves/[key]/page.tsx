import Link from "next/link";
import { homeApi, type GameShelf } from "@/lib/home-data";
import "@/components/home/gameboxd-home.css";

export default async function ShelfPage({ params, searchParams }: {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { key } = await params;
  const raw = (await searchParams).page ?? "1";
  const page = /^\d+$/.test(raw) ? Math.max(1, Math.min(100, Number(raw))) : 1;
  let result: GameShelf | null = null;
  try { result = await homeApi<GameShelf>(`/api/discovery/home/shelves/${encodeURIComponent(key)}?page=${page}&limit=18`); }
  catch { /* Show an honest empty/error state, not fake posters. */ }
  return <div className="gbh-root"><div className="gbh-main">
    <div className="gbh-collection-heading"><Link href="/home" style={{color:"#fc521e"}}>← Back to Home</Link><h1>{result?.title ?? "Unable to load collection"}</h1><p>{result?.subtitle ?? "Please check your backend or try again."}</p></div>
    <div className="gbh-collection-grid">{result?.games.map(game => <Link key={game.id} href={game.href} className="gbh-game-item"><div className="gbh-image-shell">{game.imageUrl ? <img className="gbh-cover" src={game.imageUrl} alt={game.name} loading="lazy" /> : <div className="gbh-cover gbh-cover-empty">{game.name}</div>}</div><div className="gbh-poster-caption"><span>{game.name}</span></div></Link>)}</div>
    <div className="gbh-pagination">{page > 1 && <Link href={`/home/shelves/${key}?page=${page - 1}`}>Previous</Link>}{result?.hasMore && <Link href={`/home/shelves/${key}?page=${page + 1}`}>Next Page →</Link>}</div>
  </div><footer className="gbh-footer"><a href="https://rawg.io/" target="_blank" rel="noopener noreferrer">Game data and images by RAWG</a></footer></div>;
}
