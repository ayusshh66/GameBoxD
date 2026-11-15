"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight, Bookmark, ChevronDown, ChevronLeft, ChevronRight,
  CircleUserRound, Flame, Gamepad2, Heart, List, LoaderCircle,
  MessageSquare, Plus, Radio, Search, Star, X,
} from "lucide-react";
import type { CatalogGame, FeedActivity, FeedPayload, LocalGame } from "@/lib/discover-data";
import { apiRequest } from "@/lib/api";

type Incoming = {
  catalog: { games: CatalogGame[]; page: number; limit: number; hasMore: boolean };
  trending: LocalGame[];
  top: LocalGame[];
  error: string | null;
};

type DisplayGame = {
  key: string;
  name: string;
  href: string;
  image: string | null;
  background: string | null;
  rating: number | null;
  ratingSource: "RAWG" | "GameboxD";
  year: string | null;
  genre: string | null;
  rawgId: number | null;
  localId: string | null;
};

function fromRawg(game: CatalogGame): DisplayGame {
  return {
    key: `rawg:${game.rawgId}`,
    name: game.name,
    href: `/games/rawg/${game.rawgId}`,
    image: game.coverUrl,
    background: game.backgroundUrl ?? game.coverUrl,
    rating: game.rating,
    ratingSource: "RAWG",
    year: game.released?.slice(0, 4) ?? null,
    genre: game.genres[0] ?? null,
    rawgId: game.rawgId,
    localId: null,
  };
}

function fromLocal(game: LocalGame): DisplayGame {
  const value = Number(game.averageRating);
  return {
    key: `local:${game.id}`,
    name: game.name,
    href: `/games/${game.slug}`,
    image: game.coverUrl,
    background: game.backgroundUrl ?? game.coverUrl,
    rating: Number.isFinite(value) && game.averageRating !== null ? value : null,
    ratingSource: "GameboxD",
    year: game.releaseDate?.slice(0, 4) ?? null,
    genre: null,
    rawgId: null,
    localId: game.id,
  };
}

function score(v: number | null) {
  return v === null ? "—" : v.toFixed(1);
}

function Poster({ src, alt, className = "" }: { src: string | null; alt: string; className?: string }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);
  return src && !broken ? (
    // Backend supplies RAWG/Neon media URLs. Avoid a Next image-domain config dependency.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} loading="lazy" onError={() => setBroken(true)} />
  ) : <div className={`gd-media-placeholder ${className}`}><Gamepad2 size={36}/></div>;
}

function Stars({ value }: { value: number | null }) {
  if (value === null) return <span className="gd-no-rating">Not rated</span>;
  return <span className="gd-stars" aria-label={`${value.toFixed(1)} out of 5`}>
    {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={13} fill={i + 0.5 <= value ? "currentColor" : "none"} />)}
  </span>;
}

function Header({ query }: { query: string }) {
  const [user, setUser] = useState<{username: string} | null>(null);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    let live = true;
    apiRequest<{username: string}>("/api/auth/me")
      .then((r) => { if (live) setUser(r.data); })
      .catch(() => { if (live) setUser(null); });
    return () => { live = false; };
  }, []);

  return <>
    <header className="gd-header">
      <div className="gd-header-inner">
        <Link className="gd-logo" href="/discover" aria-label="GameboxD Discover">
          <Gamepad2 size={25} strokeWidth={2.4}/><span>GAMEBOX<span className="gd-brand-orange">D</span></span>
        </Link>
        <nav className="gd-desktop-navigation" aria-label="Main navigation">
          <Link className="gd-nav-active" href="/discover">Discover</Link>
          <Link href="/following">Following</Link>
          <Link href="/wishlist">Wishlist</Link>
          <Link href="/lists">Lists</Link>
        </nav>
        <form action="/discover" method="get" className="gd-header-search" role="search">
          <Search size={17}/>
          <input name="q" key={query} defaultValue={query} aria-label="Search games" placeholder="Search games, reviews, lists..."/>
          <kbd>/</kbd>
        </form>
        <button className="gd-log-button" type="button" disabled title="Game logging is planned; Wishlist works now"><Plus size={16}/> Log Game</button>
        <Link className="gd-profile" href={user ? `/users/${encodeURIComponent(user.username)}` : "/login"} title={user ? user.username : "Log in"}>
          <CircleUserRound size={25}/><ChevronDown size={12} />
        </Link>
        <button className="gd-mobile-search" aria-label="Toggle search" type="button" onClick={() => setMenu(x => !x)}>{menu ? <X size={22}/> : <Search size={22}/>}</button>
        {user && <span className="gd-mobile-avatar"><CircleUserRound size={25}/></span>}
      </div>
      {menu && <form className="gd-search-mobile-panel" action="/discover" method="get"><input autoFocus name="q" defaultValue={query} placeholder="Search games..."/><button type="submit"><Search size={18}/></button></form>}
    </header>
    <nav className="gd-bottom-nav" aria-label="Mobile navigation">
      <Link className="gd-mobile-active" href="/discover"><Gamepad2 size={20}/><span>Discover</span></Link>
      <Link href="/following"><CircleUserRound size={20}/><span>Following</span></Link>
      <Link href="/wishlist"><Bookmark size={20}/><span>Wishlist</span></Link>
      <Link href="/following"><Radio size={20}/><span>Activity</span></Link>
      <Link href={user ? `/users/${encodeURIComponent(user.username)}` : "/login"}><CircleUserRound size={20}/><span>Profile</span></Link>
    </nav>
  </>;
}

function BookmarkButton({game,small=false}:{game:DisplayGame;small?:boolean}) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err,setErr] = useState<string|null>(null);

  async function add(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault(); event.stopPropagation();
    if (busy || saved) return;
    setBusy(true); setErr(null);
    try {
      let gameId = game.localId;
      if (!gameId && game.rawgId) {
        const response = await apiRequest<{gameId:string}>(`/api/games/catalog/${game.rawgId}/import`, {method:"POST"});
        gameId = response.data.gameId;
      }
      if (!gameId) throw new Error("Game ID unavailable");
      await apiRequest(`/api/games/${gameId}/wishlist`, {method:"POST"});
      setSaved(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save game";
      if (/auth|token|unauthorized/i.test(message)) router.push("/login");
      else if (/already|wishlist/i.test(message)) setSaved(true);
      else setErr(message);
    } finally {setBusy(false);}
  }
  return <div className="gd-save-wrap">
    <button type="button" className={small?"gd-card-save":"gd-secondary-button"} onClick={add} disabled={busy||saved} aria-label={saved?`Added ${game.name} to wishlist`:`Add ${game.name} to wishlist`} title={err ?? (saved?"Added to wishlist":"Add to wishlist")}>
      {busy?<LoaderCircle className="gd-spin" size={17}/>:<Bookmark size={small?17:19} fill={saved?"currentColor":"none"}/>}
      {!small && (saved?"In Wishlist":"Add to Backlog")}
    </button>
    {err && !small && <span className="gd-action-error" role="alert">{err}</span>}
  </div>;
}

function Hero({game}:{game:DisplayGame|null}) {
  return <section className="gd-hero" aria-label="Featured spotlight">
    <div className="gd-hero-image">{game?.background && <Poster src={game.background} alt="" className="gd-hero-art"/>}</div>
    <div className="gd-hero-gradient"/>
    <div className="gd-hero-container">
      <div className="gd-hero-copy">
        <div className="gd-hero-badges"><span className="gd-pill gd-pill-green"><i/> Featured Spotlight</span><span className="gd-pill">Game Discovery</span></div>
        {game ? <>
          <p className="gd-hero-eyebrow">FEATURED GAME</p>
          <h1>{game.name}</h1>
          <div className="gd-hero-meta">
            {game.year && <span>{game.year}</span>}
            {game.genre && <><span className="gd-dot">•</span><span>{game.genre}</span></>}
            <span className="gd-dot">•</span><span>{game.ratingSource} catalogue</span>
          </div>
          <div className="gd-hero-rating">
            <b>{score(game.rating)}</b><div><Stars value={game.rating}/><small>{game.rating !== null ? `${game.ratingSource} rating` : "Rating unavailable"}</small></div>
            <span className="gd-hero-rating-note">Explore the game and its details in the GameboxD catalogue.</span>
          </div>
          <div className="gd-hero-buttons">
            <Link href={game.href} className="gd-primary-button"><Gamepad2 size={18}/> Explore Game <ArrowRight size={17}/></Link>
            <BookmarkButton game={game}/>
          </div>
        </> : <>
          <h1>DISCOVER YOUR NEXT GAME<span className="gd-brand-orange">.</span></h1>
          <p className="gd-hero-empty">Games will appear here when your backend catalogue is available.</p>
        </>}
      </div>
    </div>
  </section>;
}

function GamePoster({game,compact=false}:{game:DisplayGame;compact?:boolean}) {
  return <article className={`gd-game-card ${compact?"gd-game-card-compact":""}`}>
    <div className="gd-poster-frame">
      <Link href={game.href} aria-label={`View ${game.name}`} className="gd-poster-link">
        <Poster src={game.image} alt={`${game.name} artwork`} className="gd-poster-image"/>
      </Link>
      {game.rating !== null && <span className="gd-poster-score"><Star size={12} fill="currentColor"/> {score(game.rating)}</span>}
      <div className="gd-poster-overlay"><BookmarkButton game={game} small/></div>
    </div>
    <Link className="gd-poster-title" href={game.href} title={game.name}>{game.name}</Link>
    <div className="gd-poster-sub">{[game.year, game.genre].filter(Boolean).join(" • ") || game.ratingSource}</div>
  </article>;
}

function Trending({games,ownTrending}:{games:DisplayGame[];ownTrending:boolean}) {
  const track = useRef<HTMLDivElement>(null);
  return <section className="gd-section gd-trending" aria-labelledby="gd-trending-title">
    <div className="gd-section-heading">
      <div><p className="gd-eyebrow"><i className="gd-orange-dot"/>{ownTrending?"LIVE TELEMETRY":"RAWG CATALOGUE"}</p><h2 id="gd-trending-title">{ownTrending?"Trending Today":"Popular on RAWG"}</h2></div>
      <div className="gd-carousel-actions"><Link href="/games" className="gd-link-small">View full charts <ArrowRight size={14}/></Link>
        <button aria-label="Scroll trending left" onClick={()=>track.current?.scrollBy({left:-460,behavior:"smooth"})}><ChevronLeft size={18}/></button>
        <button aria-label="Scroll trending right" onClick={()=>track.current?.scrollBy({left:460,behavior:"smooth"})}><ChevronRight size={18}/></button>
      </div>
    </div>
    {games.length ? <div className="gd-game-strip" ref={track}>{games.map(game=><GamePoster key={game.key} game={game}/>)}</div>
    : <div className="gd-section-empty">No games to show yet. Your catalogue may still be loading.</div>}
  </section>;
}

function Popular({games,fromDb}:{games:DisplayGame[];fromDb:boolean}) {
  const [filter,setFilter]=useState("All Time");
  const filtered = useMemo(() => games.filter((g)=>{
    if (filter==="2024 Releases") return g.year==="2024";
    if (filter==="Highly Rated") return g.rating!==null && g.rating>=4.5;
    if (filter==="Indie Games") return g.genre?.toLowerCase()==="indie";
    return true;
  }),[games,filter]);
  return <section className="gd-section gd-popular" aria-labelledby="gd-popular-title">
    <div className="gd-section-heading gd-popular-heading">
      <div><p className="gd-eyebrow">ARCHIVAL CANON</p><h2 id="gd-popular-title">Popular Among Vault Keepers</h2></div>
      <div className="gd-filter-tabs" role="group" aria-label="Filter displayed popular games">
        {["All Time","2024 Releases","Highly Rated","Indie Games"].map(t=><button key={t} type="button" aria-pressed={filter===t} className={filter===t?"gd-filter-active":""} onClick={()=>setFilter(t)}>{t}</button>)}
      </div>
    </div>
    {fromDb && <p className="gd-data-source">GameboxD community ratings · Filters apply to the currently loaded games</p>}
    {filtered.length ? <div className="gd-popular-grid">{filtered.slice(0, 12).map(g=><GamePoster key={g.key} game={g} compact/>)}</div>
      : <div className="gd-section-empty">No games in this filter yet. Try All Time.</div>}
  </section>;
}

function formatRelative(iso: string) {
  const time = new Date(iso).getTime();
  if (!Number.isFinite(time)) return "Recently";
  const minutes = Math.max(0,Math.floor((Date.now()-time)/60000));
  if (minutes<60) return `${minutes}m ago`;
  if (minutes<1440) return `${Math.floor(minutes/60)}h ago`;
  return `${Math.floor(minutes/1440)}d ago`;
}

function ReviewLike({id}:{id:string}) {
  const [state,setState]=useState<{likesCount:number;isLiked:boolean}|null>(null);
  const [busy,setBusy]=useState(false);
  useEffect(()=>{
    let live=true;
    apiRequest<{likesCount:number;isLiked:boolean}>(`/api/reviews/${id}/like-status`).then(r=>{if(live)setState(r.data)}).catch(()=>{});
    return ()=>{live=false};
  },[id]);
  async function toggle() {
    if(!state||busy)return;
    setBusy(true);
    try {
      await apiRequest(`/api/reviews/${id}/like`,{method:state.isLiked?"DELETE":"POST"});
      setState({likesCount:state.likesCount+(state.isLiked?-1:1),isLiked:!state.isLiked});
    } catch {/* Keep current count; backend remains source of truth. */}
    finally{setBusy(false)}
  }
  return <button type="button" className={`gd-like ${state?.isLiked?"gd-liked":""}`} aria-label={state?.isLiked?"Unlike review":"Like review"} disabled={!state||busy} onClick={toggle}>
    <Heart size={15} fill={state?.isLiked?"currentColor":"none"}/><span>{state?.likesCount??"—"}</span>
  </button>;
}

function ActivityCard({item}:{item:FeedActivity}) {
  const [spoiler,setSpoiler]=useState(false);
  return <article className="gd-activity-card">
    <div className="gd-review-author">
      <div className="gd-avatar">{item.author.avatarUrl?<Poster src={item.author.avatarUrl} alt="" className="gd-avatar-image"/>:<CircleUserRound size={25}/>}</div>
      <div className="gd-author-main"><strong>@{item.author.username}</strong><small>{item.type === "review" ? "Reviewed" : item.type === "rating" ? "Rated a game" : "Added to favorites"} · {formatRelative(item.createdAt)}</small></div>
      <Bookmark size={17} className="gd-author-bookmark"/>
    </div>
    <div className="gd-review-game">
      <Poster src={item.game.coverUrl} alt="" className="gd-review-game-image"/>
      <div><b>{item.game.name}</b>{item.type==="rating"&&<span>Rated {item.rating}/5</span>}{item.type==="favorite"&&<span>Favorited this game</span>}</div>
    </div>
    {item.type === "review" && <>
      {item.isSpoiler && !spoiler ? <button className="gd-spoiler" type="button" onClick={()=>setSpoiler(true)}>Contains spoilers — reveal review</button>
      : <p className="gd-review-content">“{item.content}”</p>}
    </>}
    <footer className="gd-activity-footer">
      {item.type === "review" && <ReviewLike id={item.id}/>}
      <Link href={`/games/${encodeURIComponent(item.game.slug)}`}><MessageSquare size={15}/> View game</Link>
      <span className="gd-review-time">{formatRelative(item.createdAt)}</span>
    </footer>
  </article>;
}

export function FollowingPreview({full=false}:{full?:boolean}) {
  const [data,setData]=useState<FeedPayload|null>(null);
  const [status,setStatus]=useState<"loading"|"logged-out"|"loaded"|"error">("loading");
  const [busy,setBusy]=useState(false);
  useEffect(()=>{
    let live=true;
    apiRequest<FeedPayload>(`/api/feed/following?page=1&limit=${full?12:9}`)
      .then(r=>{if(live){setData(r.data);setStatus("loaded")}})
      .catch(err=>{if(live){setStatus(/auth|token|unauthorized/i.test(err?.message??"")?"logged-out":"error")}});
    return()=>{live=false};
  },[full]);
  async function loadMore(){
    if(!data?.hasMore||busy)return;
    setBusy(true);
    try {
      const r=await apiRequest<FeedPayload>(`/api/feed/following?page=${data.page+1}&limit=${data.limit}`);
      setData({...r.data,activities:[...data.activities,...r.data.activities]});
    }finally{setBusy(false)}
  }
  return <section className="gd-section gd-community" aria-labelledby="gd-community-title">
    <div className="gd-section-heading"><div><p className="gd-eyebrow">COMMUNITY PULSE</p><h2 id="gd-community-title">Recent Member Logs &amp; Critiques</h2><p className="gd-section-sub">See what gamers you follow are reviewing.</p></div>
      {!full && <Link className="gd-link-small" href="/following">Explore all critiques <ArrowRight size={14}/></Link>}
    </div>
    {status==="loading" && <div className="gd-section-empty">Loading community activity…</div>}
    {status==="logged-out" && <div className="gd-section-empty">Sign in to see reviews, ratings, and favorites from gamers you follow. <Link href="/login">Log in →</Link></div>}
    {status==="error" && <div className="gd-section-empty">Community activity is unavailable. Verify the backend and try again.</div>}
    {status==="loaded" && data && <>
      {data.activities.length ? <div className="gd-review-grid">{data.activities.slice(0,full?data.activities.length:3).map(item=><ActivityCard key={`${item.type}:${item.id}`} item={item}/>)}</div>
        : <div className="gd-section-empty">Your Following Feed is empty. Follow some gamers and their activity will appear here.</div>}
      {full&&data.hasMore&&<button className="gd-load-more" disabled={busy} onClick={loadMore}>{busy?"Loading...":"Load more activity"}</button>}
    </>}
  </section>;
}

function Promo({image}:{image:string|null}) {
  return <section className="gd-section"><div className="gd-promo" style={image?{backgroundImage:`linear-gradient(90deg,#092525 20%,rgba(7,29,30,.82) 63%,rgba(7,29,30,.46)),url(${image})`}:undefined}>
    <p className="gd-eyebrow"><List size={15}/> DISCOVER MORE</p>
    <h2>Explore the GameboxD Catalogue</h2>
    <p>Find your next favorite game, explore fresh releases, and build your backlog.</p>
    <Link href="/games" className="gd-promo-cta">Browse Games <ArrowRight size={17}/></Link>
  </div></section>;
}

function Footer(){return <footer className="gd-footer"><div className="gd-footer-inner">
  <div><b>GAMEBOX<span className="gd-brand-orange">D</span></b><p>A gaming archive for discoveries, reviews, and the games you love.</p><small>Game metadata: RAWG · Community data: GameboxD</small></div>
  <div><span>Discover</span><span>Following</span><span>Wishlist</span></div>
  <div className="gd-footer-copy">© {new Date().getFullYear()} GameboxD</div>
</div></footer>}

export default function DiscoverClient({initialData,query}:{initialData:Incoming;query:string}) {
  const catalog=useMemo(()=>initialData.catalog.games.map(fromRawg),[initialData.catalog.games]);
  const ownTrending=initialData.trending.length>0;
  const ownPopular=initialData.top.length>0;
  const trending=ownTrending?initialData.trending.map(fromLocal):catalog.slice(0,7);
  const popular=ownPopular?initialData.top.map(fromLocal):catalog.slice(7,19).length?catalog.slice(7,19):catalog;
  const featured=trending.find(g=>g.background)||catalog.find(g=>g.background)||null;
  return <div className="gd-discover">
    <Header query={query}/>
    <main>
      <Hero game={featured}/>
      {initialData.error && <div className="gd-data-error" role="alert">{initialData.error}</div>}
      {query && <div className="gd-search-info"><strong>Search results for “{query}”</strong><Link href="/discover">Clear search <X size={14}/></Link></div>}
      <Trending games={query?catalog:trending} ownTrending={query?false:ownTrending}/>
      {!query && <><Popular games={popular} fromDb={ownPopular}/><FollowingPreview/><Promo image={catalog[4]?.background??featured?.background??null}/></>}
    </main>
    <Footer/>
  </div>;
}
