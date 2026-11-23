"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import GameboxdHeroCarousel from "./gameboxd-hero-carousel";
import Link from "next/link";
import {
  ArrowRight, BookmarkPlus, ChevronLeft, ChevronRight, Gamepad2,
  Heart, Star,
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
          {shelf.key === "trending-gameboxd" ? <span className="gbs-view-all">Today on GameboxD</span> : shelf.key === "community" ? <Link href="/following" className="gbs-view-all">Following Feed <ArrowRight size={13}/></Link> : <Link href={`/home/shelves/${encodeURIComponent(shelf.key)}`} className="gbs-view-all">See all <ArrowRight size={13}/></Link>}
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
            <div className="gbs-card-meta"><span className="gbs-card-name">{game.name}</span>{shelf.key === "trending-gameboxd" && game.todayViews !== undefined ? <span className="gbs-views">{game.todayViews} views today</span> : <RatingTag game={game}/>}</div>
            {style === "landscape" ? <p className="gbs-card-genre">{game.genre ?? "Discover this game"}</p> : null}
          </Link>
        ))}
      </div>
    </section>
  );
}

function TrendingGameboxd({ games }: { games: HomeGame[] }) {
  if (!games.length) return null;
  return (
    <Shelf
      shelf={{
        key: "trending-gameboxd",
        title: "Trending on GameboxD",
        subtitle: "Games viewed by GameboxD players today · unique signed-in views",
        games,
        page: 1,
        hasMore: false,
      }}
      style="landscape"
    />
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

/** A carousel assembled from actual RAWG/Neon game records. No hardcoded games. */
function buildFeaturedGames(data: GameboxdHomePayload | null, mode: Mode): HomeGame[] {
  if (!data) return [];
  const items = mode === "mobile"
    ? [
        ...data.shelves.filter(s => s.key === "mobile").flatMap(s => s.games),
        ...(data.topTen ?? []),
      ]
    : [
        ...(data.trending ?? []),
        ...(data.hero ? [data.hero] : []),
        ...(data.topTen ?? []),
        ...data.shelves.filter(s => s.key === "recent" || s.key === "action" || s.key === "rpg").flatMap(s => s.games),
      ];
  const seen = new Set<string>();
  return items.filter(game => {
    const key = game.name.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!game.name || !(game.backgroundUrl || game.imageUrl) || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 8);
}

export default function GameboxdHome({ data, error, mode = "all" }: { data: GameboxdHomePayload | null; error: string | null; mode?: Mode }) {
  const shelves = (data?.shelves ?? []).slice().sort((a,b) => genresOrder.indexOf(a.key) - genresOrder.indexOf(b.key));
  const filtered = mode === "mobile" ? shelves.filter(s => s.key === "mobile") : shelves;
  const featuredGames = useMemo(() => buildFeaturedGames(data, mode), [data, mode]);
  const [activeIndex, setActiveIndex] = useState(0);
  const hero = featuredGames.length ? featuredGames[activeIndex % featuredGames.length] : null;
  const featuredArt = hero?.backgroundUrl ?? hero?.imageUrl ?? null;
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const root = document.documentElement;
    if (featuredArt) {
      // Existing glass navbar and page theme already read this CSS variable.
      root.style.setProperty("--gbd-featured-artwork", `url(${JSON.stringify(featuredArt)})`);
    } else {
      root.style.removeProperty("--gbd-featured-artwork");
    }
    return () => { root.style.removeProperty("--gbd-featured-artwork"); };
  }, [featuredArt]);

  return (
    <div className="gbs-home">
      {/* Crossfading, image-derived ambient gradient that changes with every slide. */}
      <div className="gbs-live-backdrop" aria-hidden="true">
        <AnimatePresence initial={false}>
          {featuredArt && (
            <motion.div
              key={featuredArt}
              className="gbs-live-backdrop-image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.82 }}
              exit={{ opacity: 0 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 1.2 }}
              style={{ backgroundImage: `url(${JSON.stringify(featuredArt)})` }}
            />
          )}
        </AnimatePresence>
        <div className="gbs-live-backdrop-shade" />
      </div>
      <main className="gbs-home-main">
        {mode === "mobile" && <div className="gbs-page-title"><span>Browse by platform</span><h1>Mobile games</h1></div>}
        {error && <div className="gbs-load-error" role="alert">{error} Check the response from <code>/api/discovery/home</code>.</div>}
        {featuredGames.length > 0 && (
          <GameboxdHeroCarousel games={featuredGames} activeIndex={activeIndex} onActiveIndexChange={setActiveIndex} />
        )}
        {mode === "all" && data?.trending?.length ? <TrendingGameboxd games={data.trending}/> : null}
        {mode === "all" && data?.topTen?.length ? <RankedTen games={data.topTen}/> : null}
        {filtered.map(s => <Shelf key={s.key} shelf={s} style={s.key === "recent" ? "recent" : s.key === "community" || s.key === "action" || s.key === "open-world" ? "landscape" : s.key === "mobile" ? "compact" : "poster"}/>)}
        {!error && featuredGames.length === 0 && filtered.length === 0 && <div className="gbs-no-games">No games are available to display yet. Try again when the catalogue API responds.</div>}
        {mode === "all" && <CtaBanner/>}
        {data?.unavailableSections?.length ? <p className="gbs-partial-warning">Some shelves could not load ({data.unavailableSections.join(", ")}). Other sections are still available.</p> : null}
      </main>
      <footer className="gbs-footer"><span>GAMEBOXD · Track what you play. Remember how it felt.</span><a href="https://rawg.io" target="_blank" rel="noreferrer">Game metadata and images by RAWG</a></footer>
    </div>
  );
}
