"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, BookmarkPlus, ChevronLeft, ChevronRight, Gamepad2,
  Heart, Pause, Play, Star, Volume2, VolumeX,
} from "lucide-react";
import type { GameboxdHomePayload, GameShelf, HomeGame } from "@/lib/home-data";
import "./gameboxd-home.css";

type Mode = "all" | "mobile";
type RailStyle = "poster" | "landscape" | "recent" | "compact";

const genresOrder = ["recent", "community", "indie", "horror", "action", "open-world", "rpg", "zombies", "racing", "multiplayer", "mobile"];
const headingOverrides: Record<string, { title: string; eyebrow?: string }> = {
  recent: { title: "Recently Released", eyebrow: "Fresh worlds to explore" },
  community: { title: "Everyone's Talking About These", eyebrow: "Most reviewed by GameboxD players" },
  indie: { title: "Indie Gems", eyebrow: "Unforgettable independent adventures" },
  horror: { title: "Horror Nights", eyebrow: "Survive the unexpected" },
  action: { title: "Action & Adventure", eyebrow: "High-intensity journeys" },
  "open-world": { title: "Open-World Adventures", eyebrow: "Go anywhere, discover everything" },
  rpg: { title: "Deep RPG Worlds", eyebrow: "Build your own story" },
  zombies: { title: "Zombie Survival", eyebrow: "Make every moment count" },
  racing: { title: "Racing Games", eyebrow: "Push the limits" },
  multiplayer: { title: "Multiplayer With Friends", eyebrow: "Better together" },
  mobile: { title: "Mobile & Handheld Hits", eyebrow: "Play wherever you go" },
};

function GameArtwork({ game, landscape = false, eager = false }: { game: HomeGame; landscape?: boolean; eager?: boolean }) {
  const src = landscape ? game.backgroundUrl ?? game.imageUrl : game.imageUrl ?? game.backgroundUrl;
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return src && !failed ? (
    // Remote RAWG images are URL data. Avoid requiring new next.config image domains.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={game.name} loading={eager ? "eager" : "lazy"} className="gbs-artwork" onError={() => setFailed(true)} />
  ) : (
    <div className="gbs-artwork gbs-artwork-empty"><Gamepad2 size={32}/><span>{game.name}</span></div>
  );
}

function RatingTag({ game }: { game: HomeGame }) {
  return game.rating !== null && Number.isFinite(game.rating) ? (
    <span className="gbs-rating"><Star size={12} fill="currentColor"/>{game.rating.toFixed(1)} <small>{game.source === "rawg" ? "RAWG" : "GameboxD"}</small></span>
  ) : null;
}

function CinematicHero({ game, videoUrl }: { game: HomeGame; videoUrl: string | null }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  useEffect(() => {
    if (videoRef.current && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      videoRef.current.pause();
      setPaused(true);
    }
  }, []);
  const togglePlayback = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) void el.play().then(() => setPaused(false)).catch(() => setPaused(true));
    else { el.pause(); setPaused(true); }
  };
  return (
    <section className="gbs-hero" aria-labelledby="gbs-featured-title">
      <div className="gbs-hero-image" style={{ backgroundImage: game.backgroundUrl ? `url("${game.backgroundUrl}")` : undefined }} />
      {videoUrl ? (
        <video ref={videoRef} className="gbs-hero-video" src={videoUrl} poster={game.backgroundUrl ?? undefined} autoPlay muted={muted} loop playsInline preload="none" />
      ) : null}
      <div className="gbs-hero-overlay" />
      <div className="gbs-hero-badge"><span className="gbs-live-dot"/> Featured Game</div>
      {videoUrl && (
        <div className="gbs-hero-media-controls">
          <button type="button" onClick={togglePlayback} aria-label={paused ? "Play trailer" : "Pause trailer"}>{paused ? <Play size={17}/> : <Pause size={17}/>}</button>
          <button type="button" onClick={() => setMuted(x => !x)} aria-label={muted ? "Unmute trailer" : "Mute trailer"}>{muted ? <VolumeX size={17}/> : <Volume2 size={17}/>}</button>
        </div>
      )}
      <div className="gbs-hero-copy">
        <div className="gbs-hero-kicker"><span>SPOTLIGHT</span> {game.genre && <span>{game.genre}</span>} {game.released && <span>{game.released.slice(0,4)}</span>}</div>
        <h1 id="gbs-featured-title">{game.name}</h1>
        <div className="gbs-hero-rating"><RatingTag game={game}/></div>
        <p>Explore the story, community reviews, ratings and screenshots on GameboxD.</p>
        <div className="gbs-hero-actions">
          <Link href={game.href} className="gbs-cta"><Gamepad2 size={17}/> Game Details <ArrowRight size={17}/></Link>
          <Link href="/games" className="gbs-cta-secondary">Explore games</Link>
        </div>
      </div>
    </section>
  );
}

function RankedTen({ games }: { games: HomeGame[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  if (!games.length) return null;
  const shift = (direction: number) => scroller.current?.scrollBy({ left: direction * Math.max(300, scroller.current.clientWidth * 0.8), behavior: "smooth" });
  return (
    <section className="gbs-section gbs-top-ten" aria-label="Top 10 games">
      <div className="gbs-section-heading">
        <div><div className="gbs-heading-line"><span className="gbs-heading-dot"/><h2>Top 10 Most Added Games</h2></div><p>Most added games on RAWG, not live GameboxD plays</p></div>
        <div className="gbs-heading-actions"><button onClick={() => shift(-1)} aria-label="Scroll Top 10 left"><ChevronLeft size={18}/></button><button onClick={() => shift(1)} aria-label="Scroll Top 10 right"><ChevronRight size={18}/></button></div>
      </div>
      <div className="gbs-rank-track" ref={scroller} tabIndex={0} aria-label="Scroll Top 10 games horizontally">
        {games.slice(0,10).map((game, i) => (
          <Link href={game.href} className="gbs-rank-card" key={`rank-${game.id}`} title={game.name}>
            <span className="gbs-rank-number" aria-hidden="true">{i+1}</span>
            <div className="gbs-rank-cover"><GameArtwork game={game}/><div className="gbs-poster-hover">View Game <ArrowRight size={15}/></div></div>
            <div className="gbs-card-meta"><span className="gbs-card-name">{game.name}</span><RatingTag game={game}/></div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Shelf({ shelf, style = "poster" }: { shelf: GameShelf; style?: RailStyle }) {
  const scroller = useRef<HTMLDivElement>(null);
  const config = headingOverrides[shelf.key];
  if (shelf.games.length === 0) return null;
  const shift = (direction: number) => scroller.current?.scrollBy({ left: direction * Math.max(300, scroller.current.clientWidth * 0.78), behavior: "smooth" });
  return (
    <section className={`gbs-section gbs-shelf-section gbs-style-${style}`} aria-labelledby={`shelf-${shelf.key}`}>
      <div className="gbs-section-heading">
        <div><div className="gbs-heading-line"><span className="gbs-heading-dot"/><h2 id={`shelf-${shelf.key}`}>{config?.title ?? shelf.title}</h2></div>{(config?.eyebrow ?? shelf.subtitle) && <p>{config?.eyebrow ?? shelf.subtitle}</p>}</div>
        <div className="gbs-heading-actions">
          {shelf.key === "community" ? <Link href="/following" className="gbs-view-all">Following Feed <ArrowRight size={13}/></Link> : <Link href={`/home/shelves/${encodeURIComponent(shelf.key)}`} className="gbs-view-all">See all <ArrowRight size={13}/></Link>}
          <button onClick={() => shift(-1)} aria-label={`Scroll ${shelf.title} left`}><ChevronLeft size={18}/></button>
          <button onClick={() => shift(1)} aria-label={`Scroll ${shelf.title} right`}><ChevronRight size={18}/></button>
        </div>
      </div>
      <div className="gbs-card-track" ref={scroller} tabIndex={0} aria-label={`${shelf.title} games, horizontally scrollable`}>
        {shelf.games.map((game) => (
          <Link href={game.href} key={`${shelf.key}-${game.id}`} className="gbs-game-card" title={game.name}>
            <div className="gbs-game-cover">
              <GameArtwork game={game} landscape={style === "landscape" || style === "recent"}/>
              {style === "recent" && <span className="gbs-new-chip">NEW</span>}
              <div className="gbs-poster-hover">View Game <ArrowRight size={15}/></div>
            </div>
            <div className="gbs-card-meta"><span className="gbs-card-name">{game.name}</span><RatingTag game={game}/></div>
            {style === "landscape" ? <p className="gbs-card-genre">{game.genre ?? "Discover this game"}</p> : null}
          </Link>
        ))}
      </div>
    </section>
  );
}

function CtaBanner() {
  return <section className="gbs-banner">
    <div className="gbs-banner-icon"><Gamepad2 size={25}/></div>
    <h2>Track, rate and discover your next obsession.</h2>
    <p>Build your wishlist, share thoughtful reviews, and find games worth exploring.</p>
    <div><Link href="/games" className="gbs-cta">Explore games <ArrowRight size={17}/></Link><Link href="/wishlist" className="gbs-cta-secondary"><BookmarkPlus size={16}/> Wishlist</Link></div>
    <Heart className="gbs-banner-ghost" aria-hidden="true" size={112}/>
  </section>;
}

export default function GameboxdHome({ data, error, mode = "all" }: { data: GameboxdHomePayload | null; error: string | null; mode?: Mode }) {
  const shelves = (data?.shelves ?? []).slice().sort((a,b) => genresOrder.indexOf(a.key) - genresOrder.indexOf(b.key));
  const filtered = mode === "mobile" ? shelves.filter(s => s.key === "mobile") : shelves;
  const hero = mode === "mobile" ? filtered[0]?.games[0] ?? null : data?.hero ?? null;
  const featuredArt = hero?.backgroundUrl ?? hero?.imageUrl ?? null;

  useEffect(() => {
    const root = document.documentElement;
    if (featuredArt) {
      // Drive the *entire page*, including the transparent navbar, from this game.
      root.style.setProperty("--gbd-featured-artwork", `url(${JSON.stringify(featuredArt)})`);
    } else {
      root.style.removeProperty("--gbd-featured-artwork");
    }
    return () => {
      root.style.removeProperty("--gbd-featured-artwork");
    };
  }, [featuredArt]);

  return (
    <div className="gbs-home">
      {hero && (hero.backgroundUrl || hero.imageUrl) && (
        <div
          className="gbs-ambient-backdrop"
          aria-hidden="true"
          style={{ backgroundImage: `url(${JSON.stringify(hero.backgroundUrl ?? hero.imageUrl)})` }}
        />
      )}
      <main className="gbs-home-main">
        {mode === "mobile" && <div className="gbs-page-title"><span>Browse by platform</span><h1>Mobile games</h1></div>}
        {error && <div className="gbs-load-error" role="alert">{error} Check the response from <code>/api/discovery/home</code>.</div>}
        {hero && <CinematicHero game={hero} videoUrl={mode === "all" ? data?.heroVideoUrl ?? null : null}/>}
        {mode === "all" && data?.topTen?.length ? <RankedTen games={data.topTen}/> : null}
        {filtered.map(s => <Shelf key={s.key} shelf={s} style={s.key === "recent" ? "recent" : s.key === "community" || s.key === "action" || s.key === "open-world" ? "landscape" : s.key === "mobile" ? "compact" : "poster"}/>)}
        {!error && !hero && filtered.length === 0 && <div className="gbs-no-games">No games are available to display yet. Try again when the catalogue API responds.</div>}
        {mode === "all" && <CtaBanner/>}
        {data?.unavailableSections?.length ? <p className="gbs-partial-warning">Some shelves could not load ({data.unavailableSections.join(", ")}). Other sections are still available.</p> : null}
      </main>
      <footer className="gbs-footer"><span>GAMEBOXD · Track what you play. Remember how it felt.</span><a href="https://rawg.io" target="_blank" rel="noreferrer">Game metadata and images by RAWG</a></footer>
    </div>
  );
}
