"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Gamepad2, Heart } from "lucide-react";
import { socialRequest, isUnauthenticated } from "@/lib/social-client";
import type { GameListItem, MyLibrary } from "@/lib/social-types";
import "./social.css";

type Filter = "wishlist" | "favorites" | "playing" | "completed" | "paused" | "dropped" | "played";
const filters: { name: string; key: Filter }[] = [
  { name: "Wishlist", key: "wishlist" },{ name: "Favorites", key: "favorites" },
  { name: "Playing", key: "playing" },{ name: "Completed", key: "completed" },
  { name: "Paused", key: "paused" },{ name: "Dropped", key: "dropped" }, { name: "Played", key: "played" },
];
const states = ["playing", "completed", "paused", "dropped", "played"] as const;
export default function MyLibraryPage() {
  const [data, setData] = useState<MyLibrary | null>(null);
  const [tab, setTab] = useState<Filter>("wishlist");
  const [message, setMessage] = useState("");
  const [unauthenticated, setUnauthenticated] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const reload = () => socialRequest<MyLibrary>("/api/social/library").then(setData).catch(e => {setUnauthenticated(isUnauthenticated(e)); setMessage(e instanceof Error ? e.message : "Failed to load library"); });
  useEffect(() => { void reload(); }, []);
  const items: GameListItem[] = !data ? [] : tab === "wishlist" || tab === "favorites" ? data[tab] : data.logs.filter(x => x.status === tab);

  async function remove(item: GameListItem) {
    setMessage("");setBusy(item.gameId);
    try {
      if (tab === "wishlist") await socialRequest(`/api/games/${item.gameId}/wishlist`, {method:"DELETE"});
      else if (tab === "favorites") await socialRequest(`/api/games/${item.gameId}/favorite`, {method:"DELETE"});
      else await socialRequest(`/api/social/logs/${item.gameId}`, {method:"DELETE"});
      await reload();
    } catch(e) {setMessage(e instanceof Error ? e.message : "Failed to remove game");}
    finally {setBusy(null);}
  }
  async function changeStatus(item: GameListItem, status: string) {
    setMessage("");setBusy(item.gameId);
    try { await socialRequest(`/api/social/logs/${item.gameId}`, {method:"PUT", body:{status}}); await reload(); }
    catch (e) {setMessage(e instanceof Error ? e.message : "Failed to save status");}
    finally {setBusy(null);}
  }
  return <main className="gbs-social"><div className="gbs-social-inner">
    <p className="gbs-social-eyebrow">Your gaming archive</p><h1>My Library</h1>
    <p className="gbs-social-intro">Wishlist and Favorites are independent. Game Logs keep your played, playing and completed history separately.</p>
    {unauthenticated && <div className="gbs-social-panel">Please <Link style={{color:"#fc521e"}} href="/login">log in</Link> to view your library.</div>}
    {message && !unauthenticated && <p role="alert" className="gbs-social-error">{message}</p>}
    {!data && !unauthenticated && !message && <p className="gbs-social-muted">Loading library…</p>}
    {data && <div className="gbs-social-panel"><div className="gbs-social-tabs" role="tablist" style={{marginBottom:20}}>
      {filters.map(f => <button key={f.key} className="gbs-social-tab" role="tab" aria-selected={tab === f.key} onClick={() => setTab(f.key)}>
        {f.key === "wishlist" && <Bookmark size={15}/>} {f.key === "favorites" && <Heart size={15}/>} {f.key === "playing" && <Gamepad2 size={15}/>} {f.name} <small>{f.key === "wishlist" || f.key === "favorites" ? data[f.key].length : data.logs.filter(x => x.status === f.key).length}</small>
      </button>)}
    </div>
      {items.length ? <div className="gbs-social-list">{items.map(item => <article className="gbs-social-list-item" key={item.gameId}>
        <Link href={`/games/${encodeURIComponent(item.slug)}`}>{item.coverUrl ? <img src={item.coverUrl} alt=""/> : <span className="gbs-social-avatar"><Gamepad2/></span>}</Link>
        <div className="gbs-social-grow"><Link href={`/games/${encodeURIComponent(item.slug)}`}><strong>{item.name}</strong></Link><br/><small>{tab === "wishlist" ? "On wishlist" : tab === "favorites" ? "Favorite game" : `Log status: ${item.status}`}</small>
        {item.note && <p className="gbs-social-muted" style={{fontSize:12}}>{item.note}</p>}
        </div>
        <div className="gbs-social-row">
          {tab !== "wishlist" && tab !== "favorites" && <select aria-label={`Progress for ${item.name}`} className="gbs-social-input" style={{width:140,padding:8}} disabled={busy === item.gameId} value={item.status} onChange={e => void changeStatus(item,e.target.value)}>{states.map(s => <option value={s} key={s}>{s}</option>)}</select>}
          <button type="button" disabled={busy === item.gameId} className="gbs-social-button gbs-social-button-sm" onClick={() => void remove(item)}>Remove</button>
        </div>
      </article>)}</div> : <div className="gbs-social-empty">No games in this section. <Link style={{color:"#fc521e"}} href="/search">Find a game</Link>.</div>}
    </div>}
  </div></main>;
}
