"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight, ChevronLeft, ChevronRight, CircleUserRound,
  Gamepad2, Menu, Pause, Play, Search, Volume2, VolumeX, X,
} from "lucide-react";
import type { GameboxdHomePayload, GameShelf, HomeGame } from "@/lib/home-data";
import { apiRequest } from "@/lib/api";
import "./gameboxd-home.css";

const LINKS = [
  { label: "Home", href: "/home" },
  { label: "Games", href: "/games" },
  { label: "Mobile", href: "/mobile" },
  { label: "Following", href: "/following" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Community", href: "/community" },
];

function TopNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);
  useEffect(() => {
    let mounted = true;
    apiRequest<{ username: string }>("/api/auth/me")
      .then((res) => { if (mounted) setUser(res.data); })
      .catch(() => { if (mounted) setUser(null); });
    return () => { mounted = false; };
  }, []);
  return (
    <header className="gbh-header">
      <Link href="/home" className="gbh-brand" aria-label="GameboxD home">
        <Gamepad2 size={25} strokeWidth={2.5} /> GAMEBOX<span>D</span>
      </Link>
      <nav className={`gbh-pill-nav ${open ? "gbh-pill-open" : ""}`} aria-label="Main navigation">
        {LINKS.map((link) => (
          <Link key={link.label} href={link.href}
            aria-current={(pathname === link.href || (link.href === "/home" && pathname === "/discover")) ? "page" : undefined}
            onClick={() => setOpen(false)}
            className={(pathname === link.href || (link.href === "/home" && pathname === "/discover")) ? "gbh-nav-active" : ""}>
            {link.label}
          </Link>
        ))}
        <Link href="/games" className="gbh-search-icon" title="Search games" aria-label="Search games"><Search size={18} /></Link>
      </nav>
      <div className="gbh-right">
        <Link className="gbh-user" href={user ? `/users/${encodeURIComponent(user.username)}` : "/login"} aria-label={user ? `${user.username}'s profile` : "Log in"}>
          <CircleUserRound size={27} />
        </Link>
        <button className="gbh-menu-button" type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((x) => !x)}>
          {open ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>
    </header>
  );
}

function MediaImage({ game, mode = "poster" }: { game: HomeGame; mode?: "poster" | "landscape" }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [game.imageUrl, game.backgroundUrl]);
  const src = mode === "landscape" ? game.backgroundUrl ?? game.imageUrl : game.imageUrl;
  return src && !failed ? (
    // RAWG URLs are external image locations; using img avoids adding a provider config.
    // eslint-disable-next-line @next/next/no-img-element
    <img className="gbh-cover" alt={game.name} loading="lazy" src={src} onError={() => setFailed(true)} />
  ) : <div className="gbh-cover gbh-cover-empty"><Gamepad2 size={36}/><span>{game.name}</span></div>;
}

function FeaturedHero({ game, videoUrl }: { game: HomeGame; videoUrl: string | null }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      videoRef.current?.pause();
      setPaused(true);
    }
  }, []);
  function togglePause() {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) { void el.play().then(() => setPaused(false)).catch(() => setPaused(true)); }
    else { el.pause(); setPaused(true); }
  }
  return (
    <section className="gbh-feature" aria-label="Featured game">
      {game.backgroundUrl && <div className="gbh-feature-image" style={{ backgroundImage: `url("${game.backgroundUrl}")` }} />}
      {videoUrl && <video ref={videoRef} className="gbh-feature-video" poster={game.backgroundUrl ?? undefined}
        autoPlay muted={muted} loop playsInline preload="none" src={videoUrl} />}
      <div className="gbh-feature-shade" />
      {videoUrl && <div className="gbh-media-controls">
        <button onClick={togglePause} type="button" aria-label={paused ? "Play video" : "Pause video"}>{paused ? <Play size={18}/> : <Pause size={18}/>}</button>
        <button onClick={() => setMuted((m) => !m)} type="button" aria-label={muted ? "Unmute video" : "Mute video"}>{muted ? <VolumeX size={18}/> : <Volume2 size={18}/>}</button>
      </div>}
      <div className="gbh-feature-caption">
        <span className="gbh-kicker">FEATURED GAME</span>
        <h1>{game.name}</h1>
        <p className="gbh-feature-meta">{[game.genre, game.released?.slice(0,4)].filter(Boolean).join("  ·  ")}</p>
        <div className="gbh-hero-actions">
          <Link href={game.href} className="gbh-primary-action"><Play size={17} fill="currentColor" /> View Game</Link>
          <Link href="/games" className="gbh-secondary-action">Explore Games <ArrowRight size={17} /></Link>
        </div>
      </div>
      <div className="gbh-feature-tag">{game.rating !== null ? `★ ${game.rating.toFixed(1)} RAWG` : "Explore on GameboxD"}</div>
    </section>
  );
}

function ShelfRow({ shelf, isTop = false, landscape = false }: { shelf: GameShelf; isTop?: boolean; landscape?: boolean }) {
  const scroller = useRef<HTMLDivElement>(null);
  const scroll = (direction: number) => scroller.current?.scrollBy({ left: scroller.current.clientWidth * .74 * direction, behavior: "smooth" });
  if (!shelf.games.length) return null;
  return (
    <section className={`gbh-shelf ${isTop ? "gbh-ranked-shelf" : ""}`} aria-label={shelf.title}>
      <div className="gbh-shelf-heading">
        <div><h2>{shelf.title}</h2>{shelf.subtitle && <p>{shelf.subtitle}</p>}</div>
        {!isTop && shelf.key !== "community" && <Link href={`/home/shelves/${encodeURIComponent(shelf.key)}`} className="gbh-see-all">View all <ArrowRight size={15}/></Link>}
      </div>
      <div className="gbh-slider-layout">
        <div className="gbh-scroll" ref={scroller} tabIndex={0} aria-label={`${shelf.title} games; scroll horizontally`}>
          {shelf.games.map((game, i) => (
            <Link key={`${shelf.key}:${game.id}`} href={game.href}
              className={isTop ? "gbh-rank-item" : `gbh-game-item ${landscape ? "gbh-item-wide" : ""}`}
              title={game.name}>
              {isTop && <span className="gbh-rank-number" aria-hidden="true">{i + 1}</span>}
              <div className="gbh-image-shell"><MediaImage game={game} mode={landscape ? "landscape" : "poster"} />
                <div className="gbh-card-hover"><span>View Game <ArrowRight size={14}/></span></div>
              </div>
              <div className="gbh-poster-caption"><span>{game.name}</span>{game.rating !== null && <small>★ {game.rating.toFixed(1)} <span>{game.source === "rawg" ? "RAWG" : "GameboxD"}</span></small>}</div>
            </Link>
          ))}
        </div>
        <div className="gbh-slide-buttons">
          <button type="button" aria-label={`Scroll ${shelf.title} left`} onClick={() => scroll(-1)}><ChevronLeft size={22}/></button>
          <button type="button" aria-label={`Scroll ${shelf.title} right`} onClick={() => scroll(1)}><ChevronRight size={22}/></button>
        </div>
      </div>
    </section>
  );
}

function CommunityBanner() {
  return <section className="gbh-community-banner">
    <div><span className="gbh-kicker">GAMEBOXD COMMUNITY</span><h2>Games are better together.</h2><p>Review what you play, follow other gamers, and see what they recommend.</p></div>
    <Link href="/following">Open Following Feed <ArrowRight size={17}/></Link>
  </section>;
}

export default function GameboxdHome({ data, error, mode = "all" }: {
  data: GameboxdHomePayload | null;
  error: string | null;
  mode?: "all" | "mobile";
}) {
  const top = data ? { key: "top", title: "Top 10 • Most Added on RAWG", subtitle: "Popularity based on RAWG additions, not GameboxD daily plays", games: data.topTen, page: 1, hasMore: true } satisfies GameShelf : null;
  const filtered = mode === "mobile" ? (data?.shelves.filter((s) => s.key === "mobile") ?? []) : (data?.shelves ?? []);
  const hero = mode === "mobile" ? filtered[0]?.games[0] ?? null : data?.hero ?? null;
  return <div className="gbh-root">
    <TopNav />
    <main className="gbh-main">
      {mode === "mobile" && <div className="gbh-mobile-heading"><span className="gbh-kicker">BROWSE BY PLATFORM</span><h1>Mobile Games</h1></div>}
      {error && <div className="gbh-error" role="alert">{error}</div>}
      {hero && <FeaturedHero game={hero} videoUrl={mode === "all" ? data?.heroVideoUrl ?? null : null} />}
      {mode === "all" && top && <ShelfRow shelf={top} isTop />}
      {filtered.map((s, i) => <ShelfRow key={s.key} shelf={s} landscape={mode === "all" && (s.key === "community" || i === 3)} />)}
      {mode === "all" && <CommunityBanner />}
      {data?.unavailableSections?.length ? <p className="gbh-error-footnote">Some shelves couldn't load. RAWG may be unavailable or rate-limited. Refresh after checking the backend.</p> : null}
    </main>
    <footer className="gbh-footer"><span>GAMEBOXD · Track what you play. Remember how it felt.</span><a href="https://rawg.io/" target="_blank" rel="noopener noreferrer">Game metadata and images by RAWG</a></footer>
  </div>;
}
