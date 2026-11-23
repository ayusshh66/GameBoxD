"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Gamepad2, Star } from "lucide-react";
import type { HomeGame } from "@/lib/home-data";
import "./gameboxd-hero-carousel.css";

const AUTO_DELAY = 7600;
const PREVIEW_LIFETIME = 2600;

function wrap(value: number, length: number) {
  return ((value % length) + length) % length;
}

function getImage(game: HomeGame) {
  return game.backgroundUrl || game.imageUrl;
}

type Props = {
  games: HomeGame[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
};

/**
 * Preserve the existing GameboxD cinematic hero composition, but borrow the
 * 21st.dev filmstrip's expanding preview, spring movement and image crossfade.
 * Only real HomeGame records from the Express discovery API are used.
 */
export default function GameboxdHeroCarousel({ games, activeIndex, onActiveIndexChange }: Props) {
  const reducedMotion = useReducedMotion();
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [isStageFocused, setIsStageFocused] = useState(false);
  const previewTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const carouselRef = useRef<HTMLElement | null>(null);
  const touchStart = useRef<number | null>(null);

  const length = games.length;
  const selected = length ? wrap(activeIndex, length) : 0;
  const game = games[selected];
  const peek = length ? games[previewIndex === null ? selected : wrap(previewIndex, length)] : null;

  const clearPreviewTimer = useCallback(() => {
    if (previewTimeout.current !== null) clearTimeout(previewTimeout.current);
    previewTimeout.current = null;
  }, []);

  const showPreview = useCallback((index: number) => {
    if (length < 2) return;
    setPreviewIndex(wrap(index, length));
    setIsPreviewOpen(true);
    clearPreviewTimer();
    // The filmstrip fades on its own, including when the pointer stays still.
    previewTimeout.current = setTimeout(() => setIsPreviewOpen(false), PREVIEW_LIFETIME);
  }, [clearPreviewTimer, length]);

  const select = useCallback((index: number) => {
    if (!length) return;
    onActiveIndexChange(wrap(index, length));
    setPreviewIndex(null);
    setIsPreviewOpen(false);
    clearPreviewTimer();
  }, [clearPreviewTimer, length, onActiveIndexChange]);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(!document.hidden);
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(() => {
    return () => clearPreviewTimer();
  }, [clearPreviewTimer]);

  // Autoplay advances after the active game has been on screen long enough.
  // Pausing for preview/focus never creates stacked intervals.
  useEffect(() => {
    if (length < 2 || reducedMotion || !pageVisible || isPreviewOpen || isStageFocused) return;
    const timer = setTimeout(() => onActiveIndexChange(wrap(selected + 1, length)), AUTO_DELAY);
    return () => clearTimeout(timer);
  }, [isPreviewOpen, isStageFocused, length, onActiveIndexChange, pageVisible, reducedMotion, selected]);

  if (!game) return null;

  const heroArt = getImage(game);
  const fade = reducedMotion ? { duration: 0 } : { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <section
      ref={carouselRef}
      className="gbs-hero gbd-carousel-hero"
      aria-roledescription="carousel"
      aria-label="Featured video games"
      onFocusCapture={(event) => {
        if ((event.target as HTMLElement).matches(":focus-visible")) setIsStageFocused(true);
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsStageFocused(false);
        }
      }}
      onKeyDown={(event) => {
        // Only handle keys on the stage itself; don't interfere with links/buttons.
        if (event.target !== event.currentTarget) return;
        if (event.key === "ArrowLeft") { event.preventDefault(); select(selected - 1); }
        if (event.key === "ArrowRight") { event.preventDefault(); select(selected + 1); }
      }}
      tabIndex={0}
      onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }}
      onTouchEnd={(event) => {
        if (touchStart.current === null) return;
        const dx = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
        touchStart.current = null;
        if (Math.abs(dx) > 60) select(selected + (dx < 0 ? 1 : -1));
      }}
    >
      {/* The artwork in the large hero changes together with the background of the page. */}
      <AnimatePresence initial={false}>
        {heroArt && (
          <motion.div
            key={`${game.id}-art`}
            className="gbd-carousel-hero-art"
            initial={{ opacity: 0, scale: reducedMotion ? 1 : 1.065 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: fade, scale: reducedMotion ? { duration: 0 } : { duration: 7.5, ease: "linear" } }}
            style={{ backgroundImage: `url(${JSON.stringify(heroArt)})` }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
      <div className="gbs-hero-overlay gbd-carousel-hero-shade" aria-hidden="true" />

      <div className="gbs-hero-badge"><span className="gbs-live-dot" /> Featured Game</div>

      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={`${game.id}-details`}
          className="gbs-hero-copy gbd-carousel-copy"
          initial={{ opacity: 0, y: reducedMotion ? 0 : 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reducedMotion ? 0 : -12 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.42, ease: "easeOut" }}
        >
          <div className="gbs-hero-kicker">
            <span>SPOTLIGHT</span>
            {game.genre && <span>{game.genre}</span>}
            {game.released && <span>{game.released.slice(0, 4)}</span>}
          </div>
          <h1>{game.name}</h1>
          {game.rating !== null && Number.isFinite(game.rating) && (
            <div className="gbs-hero-rating"><span className="gbs-rating"><Star size={14} fill="currentColor" /> {game.rating.toFixed(1)} <small>{game.source === "rawg" ? "RAWG" : "GameboxD"}</small></span></div>
          )}
          <p>Explore its story, ratings, community reviews and screenshots on GameboxD.</p>
          <div className="gbs-hero-actions">
            <Link className="gbs-cta" href={game.href}><Gamepad2 size={17} /> Game Details <ArrowRight size={17} /></Link>
            <Link className="gbs-cta-secondary" href="/games">Explore games</Link>
          </div>
        </motion.div>
      </AnimatePresence>

      {length > 1 && (
        <>
          <div className="gbd-carousel-number" aria-live="off">{String(selected + 1).padStart(2, "0")} <span>/ {String(length).padStart(2, "0")}</span></div>

          {/* Filmstrip unfolds upward from the control bubbles, then fades away. */}
          <AnimatePresence initial={false}>
            {isPreviewOpen && peek && (
              <motion.div
                key="filmstrip"
                className="gbd-carousel-preview"
                initial={{ opacity: 0, y: 20, scale: 0.94, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: 8, scale: 0.98, filter: "blur(5px)" }}
                transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 31 }}
                onPointerLeave={() => { clearPreviewTimer(); setIsPreviewOpen(false); }}
              >
                <div className="gbd-carousel-preview-info">
                  <div className="gbd-carousel-preview-kicker">UP NEXT / FEATURED GAMES</div>
                  <strong>{peek.name}</strong>
                  <div className="gbd-carousel-preview-meta">
                    {peek.genre && <span>{peek.genre}</span>}
                    {peek.released && <span>{peek.released.slice(0, 4)}</span>}
                    {peek.rating !== null && <span>★ {peek.rating.toFixed(1)} {peek.source === "rawg" ? "RAWG" : "GameboxD"}</span>}
                  </div>
                  <Link href={peek.href} className="gbd-carousel-preview-link">View game <ArrowRight size={13}/></Link>
                </div>
                <div className="gbd-carousel-filmstrip" role="group" aria-label="Choose featured game">
                  {games.map((item, i) => (
                    <motion.button
                      key={`preview-${item.id}`}
                      type="button"
                      aria-label={`Show ${item.name}`}
                      aria-current={selected === i ? "true" : undefined}
                      onPointerEnter={() => setPreviewIndex(i)}
                      onFocus={() => setPreviewIndex(i)}
                      onClick={() => select(i)}
                      animate={{ height: (previewIndex ?? selected) === i ? 90 : 56, opacity: (previewIndex ?? selected) === i ? 1 : 0.76 }}
                      transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
                      className="gbd-carousel-preview-thumb"
                      title={item.name}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {getImage(item) ? <img src={getImage(item)!} alt="" loading="lazy" draggable={false} /> : <span>{item.name}</span>}
                      {(previewIndex ?? selected) === i && <span className="gbd-carousel-preview-thumb-active" />}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="gbd-carousel-dock" role="group" aria-label="Featured game navigation">
            <button type="button" className="gbd-carousel-arrow" aria-label="Previous game"
              onPointerEnter={() => showPreview(selected - 1)}
              onFocus={() => showPreview(selected - 1)}
              onClick={() => select(selected - 1)}><ChevronLeft size={18}/></button>

            <div className="gbd-carousel-bubbles">
              {games.map((item, i) => (
                <button
                  type="button"
                  key={`bubble-${item.id}`}
                  aria-label={`Show featured game ${i + 1}: ${item.name}`}
                  aria-current={selected === i ? "true" : undefined}
                  title={item.name}
                  onPointerEnter={() => showPreview(i)}
                  onFocus={() => showPreview(i)}
                  onClick={() => select(i)}
                >
                  <motion.span
                    className="gbd-carousel-bubble-fill"
                    initial={false}
                    animate={{ width: selected === i ? 22 : 7, backgroundColor: selected === i ? "#fc521e" : "#b2b9b7" }}
                    transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 370, damping: 28 }}
                  />
                </button>
              ))}
            </div>

            <button type="button" className="gbd-carousel-arrow" aria-label="Next game"
              onPointerEnter={() => showPreview(selected + 1)}
              onFocus={() => showPreview(selected + 1)}
              onClick={() => select(selected + 1)}><ChevronRight size={18}/></button>
          </div>
        </>
      )}
    </section>
  );
}
