import Link from "next/link";
import { backendGet, type CatalogGame } from "@/lib/discover-data";

type GameDetails = CatalogGame & { description: string | null };

export default async function RawgDetailsPage({params}: {params: Promise<{id:string}>}) {
  const {id} = await params;
  let game: GameDetails | null = null;
  try { game = await backendGet<GameDetails>(`/api/games/catalog/${encodeURIComponent(id)}`); } catch { /* show friendly missing state */ }
  return (
    <main style={{ background: "#011717", color: "#F0F7F6", minHeight: "100vh", padding: "48px 6vw", fontFamily: "var(--font-jakarta), sans-serif" }}>
      <Link href="/discover" style={{ color: "#FF5724", display: "inline-block", marginBottom: 26 }}>← Back to Discover</Link>
      {!game ? <p>Game details are unavailable right now.</p> : <>
        <div style={{backgroundImage:game.backgroundUrl?`linear-gradient(90deg,#011717 6%,rgba(1,23,23,.28)),url(${game.backgroundUrl})`:undefined,backgroundSize:"cover",backgroundPosition:"center",minHeight:300,display:"flex",alignItems:"end",padding:32,borderRadius:12}}>
          <h1 style={{fontFamily:"var(--font-grotesk),sans-serif",fontSize:"clamp(2rem,6vw,4rem)",fontWeight:700}}>{game.name}</h1>
        </div>
        <div style={{maxWidth:880,marginTop:24,lineHeight:1.75,color:"#B0C9C4"}}>
          <p>{[game.released?.slice(0,4),...game.genres].filter(Boolean).join(" • ")}</p>
          {game.rating !== null && <p>RAWG rating: {game.rating.toFixed(1)} / 5</p>}
          <p>{game.description || "Description not available."}</p>
          <p style={{fontSize:13,color:"#87B683"}}>This is a RAWG preview. Community rating, reviews and wishlist actions will be enabled after the game is imported into GameboxD.</p>
        </div>
      </>}
    </main>
  );
}
