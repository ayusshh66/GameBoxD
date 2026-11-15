"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {apiRequest} from "@/lib/api";
import "../discover/discover.css";

type Item={gameId:string;game?:{id:string;slug:string;name:string;coverUrl?:string|null;averageRating?:string|null}};
type Result={games:Item[];page:number;limit:number};
export default function WishlistPage(){
  const [games,setGames]=useState<Item[]|null>(null);
  const [message,setMessage]=useState("");
  useEffect(()=>{apiRequest<Result>("/api/users/me/wishlist?page=1&limit=20").then(r=>setGames(r.data.games)).catch(()=>setMessage("Log in to view your wishlist, or try again later."))},[]);
  return <main className="gd-discover" style={{minHeight:"100vh",padding:"45px max(16px,5vw)"}}>
    <Link href="/discover" style={{color:"#FF5724"}}>← Back to Discover</Link>
    <h1 style={{fontSize:36,fontWeight:750,marginTop:32,marginBottom:25}}>Your Wishlist</h1>
    {message&&<p>{message} <Link href="/login" style={{color:"#FF5724"}}>Log in</Link></p>}
    {games&&<>{games.length===0?<p>You haven’t saved any games yet.</p>:<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:18}}>{games.map(item=><Link key={item.gameId} href={item.game?.slug?`/games/${item.game.slug}`:"/discover"} style={{background:"#092725",padding:10,borderRadius:6}}>{item.game?.coverUrl&&<img alt="" src={item.game.coverUrl} style={{width:"100%",aspectRatio:"3/4",objectFit:"cover",borderRadius:4}}/>}<p style={{fontSize:13,marginTop:8}}>{item.game?.name??"Saved game"}</p></Link>)}</div>}</>}
  </main>
}
