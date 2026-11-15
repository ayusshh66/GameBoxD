import Link from "next/link";
import {backendGet,type CatalogGame} from "@/lib/discover-data";
import "../discover/discover.css";

export default async function BrowseGames({searchParams}: {searchParams:Promise<{page?:string;q?:string}>}){
  const params=await searchParams;
  const page=Math.min(1000,Math.max(1,Number.parseInt(params.page??"1")||1));
  const q=typeof params.q==="string"?params.q.trim().slice(0,80):"";
  let data:{games:CatalogGame[];page:number;limit:number;hasMore:boolean}|null=null;
  let error="";
  try{data=await backendGet<{games:CatalogGame[];page:number;limit:number;hasMore:boolean}>(`/api/games/catalog?page=${page}&limit=24${q?`&q=${encodeURIComponent(q)}`:""}`)}catch{error="Games unavailable. Check the backend catalogue route and RAWG key."}
  return <main className="gd-discover" style={{minHeight:"100vh",padding:"32px max(16px,5vw)"}}>
    <Link href="/discover" style={{color:"#FC521E"}}>← Back to Discover</Link>
    <h1 style={{marginTop:30,fontSize:"clamp(1.9rem,4vw,3rem)"}}>Browse Games</h1>
    <form action="/games" method="get" style={{display:"flex",gap:10,marginTop:20,marginBottom:24}}><input name="q" defaultValue={q} placeholder="Search games..." style={{border:"1px solid #24514a",background:"#0b2d2b",color:"white",borderRadius:4,padding:"12px 16px",maxWidth:400,width:"100%"}}/><button type="submit" className="gd-primary-button">Search</button></form>
    {error&&<p style={{color:"#FFAD9C"}}>{error}</p>}
    {data&&<>
      {data.games.length?<div className="gd-popular-grid">{data.games.map(game=><article className="gd-game-card" key={game.rawgId}><Link href={`/games/rawg/${game.rawgId}`} className="gd-poster-link gd-poster-frame" style={{display:"block"}}>{game.coverUrl?<img className="gd-poster-image" loading="lazy" src={game.coverUrl} alt={`${game.name} artwork`}/>:<div className="gd-media-placeholder" style={{width:"100%",height:"100%"}}>No artwork</div>}</Link><Link className="gd-poster-title" href={`/games/rawg/${game.rawgId}`}>{game.name}</Link><div className="gd-poster-sub">{[game.released?.slice(0,4),game.rating!==null?`RAWG ${game.rating.toFixed(1)}/5`:null].filter(Boolean).join(" • ")}</div></article>)}</div>:<p>No games found.</p>}
      <nav style={{display:"flex",gap:20,justifyContent:"center",alignItems:"center",marginTop:36,paddingBottom:30}} aria-label="Catalogue pagination">
        {page>1?<Link className="gd-secondary-button" href={`/games?page=${page-1}${q?`&q=${encodeURIComponent(q)}`:""}`}>← Previous</Link>:null}
        <span style={{color:"#8EA4A4"}}>Page {page}</span>
        {data.hasMore?<Link className="gd-primary-button" href={`/games?page=${page+1}${q?`&q=${encodeURIComponent(q)}`:""}`}>Next →</Link>:null}
      </nav>
    </>}
  </main>
}
