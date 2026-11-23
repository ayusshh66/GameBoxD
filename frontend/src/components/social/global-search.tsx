"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { socialRequest } from "@/lib/social-client";
import type { FoundGame, Player } from "@/lib/social-types";
import { GameCard, PlayerCard } from "./cards";
import "./social.css";

type Tab = "games" | "players";
export default function GlobalSearch() {
  const params = useSearchParams();
  const [text, setText] = useState(params.get("q") ?? "");
  const [tab, setTab] = useState<Tab>(params.get("tab") === "players" ? "players" : "games");
  const [players, setPlayers] = useState<Player[]>([]);
  const [games, setGames] = useState<FoundGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rawgUnavailable, setRawgUnavailable] = useState(false);

  useEffect(() => {
    if (text.trim().length < 2) { setPlayers([]); setGames([]); setError(""); setLoading(false); return; }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true); setError("");
      try {
        if (tab === "players") {
          const data = await socialRequest<Player[]>(`/api/social/search/users?q=${encodeURIComponent(text.trim())}&limit=20`, { signal: controller.signal });
          if (!controller.signal.aborted) setPlayers(data);
        } else {
          const data = await socialRequest<{ local: FoundGame[]; rawg: FoundGame[]; rawgUnavailable: boolean }>(`/api/social/search/games?q=${encodeURIComponent(text.trim())}&limit=20`, { signal: controller.signal });
          if (!controller.signal.aborted) { setGames([...data.local, ...data.rawg]); setRawgUnavailable(data.rawgUnavailable); }
        }
      } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Search failed"); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }, 350);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [text, tab]);

  return <main className="gbs-social"><div className="gbs-social-inner">
    <p className="gbs-social-eyebrow">Global discovery</p><h1>Search GameboxD</h1>
    <p className="gbs-social-intro">Find games across the catalogue and discover other players by username or display name.</p>
    <div className="gbs-social-panel">
      <label className="gbs-social-field" htmlFor="gbd-global-search">Search games or players</label>
      <div style={{ position: "relative" }}><Search size={18} style={{ position: "absolute", left: 12, top: 16, color: "#fc521e" }}/><input id="gbd-global-search" autoFocus className="gbs-social-input" style={{ paddingLeft: 41 }} value={text} onChange={e => setText(e.target.value)} placeholder={tab === "players" ? "Enter username or display name…" : "Search Witcher, GTA, Elden Ring…"} maxLength={70}/></div>
      <div className="gbs-social-tabs" style={{ marginTop: 16 }} role="tablist"><button role="tab" aria-selected={tab === "games"} className="gbs-social-tab" onClick={() => setTab("games")}>Games</button><button role="tab" aria-selected={tab === "players"} className="gbs-social-tab" onClick={() => setTab("players")}>Players</button></div>
    </div>
    {loading && <p role="status" className="gbs-social-muted">Searching…</p>}
    {error && <p role="alert" className="gbs-social-error">{error}</p>}
    <div className="gbs-social-panel" style={{marginTop:0}}><div className="gbs-social-row"><span className="gbs-social-muted">Explore genres:</span>{["action","horror","rpg","open-world","zombies","racing","indie"].map(k => <a key={k} className="gbs-social-button gbs-social-button-sm" href={`/home/shelves/${k}`}>{k.replace("-"," ")}</a>)}</div></div>
    {text.trim().length < 2 ? <div className="gbs-social-empty">Enter at least two characters to start searching.</div> : !loading && !error && (tab === "games" ?
      <><div className="gbs-social-row"><h2>Games</h2>{rawgUnavailable && <small className="gbs-social-muted">External catalogue unavailable; showing imported games only</small>}</div>{games.length ? <div className="gbs-social-grid">{games.map(g => <GameCard key={g.href} game={g}/>)}</div> : <p className="gbs-social-empty">No games found.</p>}</> :
      <><h2>Players</h2>{players.length ? <div className="gbs-social-players">{players.map(p => <PlayerCard key={p.id} user={p}/>)}</div> : <p className="gbs-social-empty">No players found.</p>}</>)}
  </div></main>;
}
