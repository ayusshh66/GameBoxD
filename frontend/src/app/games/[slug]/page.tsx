import Link from "next/link";
import { backendGet, type LocalGame } from "@/lib/discover-data";

export default async function LocalGamePage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  let game:LocalGame|null=null;
  try {game=await backendGet<LocalGame>(`/api/games/${encodeURIComponent(slug)}`)}catch{}
  return <main style={{minHeight:"100vh",background:"#011717",color:"#F0F7F6",padding:"48px 6vw"}}>
    <Link href="/discover" style={{color:"#FF5724"}}>← Discover</Link>
    {!game?<p style={{marginTop:25}}>This game is not available in GameboxD yet.</p>:<>
      <div style={{marginTop:25,backgroundImage:game.backgroundUrl?`linear-gradient(90deg,#011717,rgba(1,23,23,.4)),url(${game.backgroundUrl})`:undefined,backgroundSize:"cover",backgroundPosition:"center",minHeight:300,padding:32,display:"flex",alignItems:"end",borderRadius:12}}><h1 style={{fontSize:"clamp(2rem,6vw,4rem)",fontFamily:"var(--font-grotesk),sans-serif",fontWeight:750}}>{game.name}</h1></div>
      <p style={{marginTop:24,maxWidth:760,lineHeight:1.8,color:"#A6BFB8"}}>{game.description??"Game description unavailable."}</p>
      {game.averageRating !== null&&<p style={{marginTop:15}}>GameboxD rating: {game.averageRating} / 5</p>}
    </>}
  </main>;
}
