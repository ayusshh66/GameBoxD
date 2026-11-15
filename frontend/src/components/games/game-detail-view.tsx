"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Bookmark, Check, ChevronDown, ChevronLeft, ChevronRight,
  CircleUserRound, Gamepad2, Heart, ImageIcon, LoaderCircle, LogIn,
  Menu, MessageSquare, PenLine, PlayCircle, Plus, Search, ShieldAlert,
  Star, X,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import type { GameDetailModel, GameReview, PageExtra } from "./game-detail-types";
import "./game-detail.css";

type CurrentUser = { id: string; username: string };
type LibraryResult = { games: Array<{ gameId: string }> };

type ReviewResponse = {
  data: GameReview[];
  success: boolean;
  page: number;
  limit: number;
  count: number;
};

function readable(text: string | null) {
  return (text ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function formattedDate(date: string | null | undefined) {
  if (!date) return "Unknown";
  const d = new Date(date);
  return Number.isFinite(d.valueOf())
    ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : date;
}

function RatingStars({ value, size = 15 }: { value: number | null; size?: number }) {
  if (value === null || !Number.isFinite(value)) return <span className="gdx-muted">Not yet rated</span>;
  return <span className="gdx-stars" aria-label={`${value.toFixed(1)} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} size={size} fill={i <= Math.round(value) ? "currentColor" : "none"} />
    ))}
  </span>;
}

function SiteHeader({ user }: { user: CurrentUser | null }) {
  const [mobileSearch, setMobileSearch] = useState(false);
  return <>
    <header className="gdx-header">
      <div className="gdx-header-inner">
        <Link href="/discover" className="gdx-logo" aria-label="GameboxD Discover">
          <Gamepad2 size={23} /><span>GAMEBOX<strong>D</strong></span>
        </Link>
        <nav className="gdx-header-links" aria-label="Main navigation">
          <Link href="/discover">Discover</Link>
          <Link href="/following">Following</Link>
          <Link href="/wishlist">Wishlist</Link>
          <Link href="/lists">Lists</Link>
        </nav>
        <form className="gdx-search" action="/discover" method="get" role="search">
          <Search size={17}/><input name="q" aria-label="Search games" placeholder="Search games, reviews, lists..." /><kbd>/</kbd>
        </form>
        <button className="gdx-header-log" type="button" disabled title="Game logging is coming later"><Plus size={15}/> Log Game</button>
        <Link className="gdx-user-link" href={user ? `/users/${encodeURIComponent(user.username)}` : "/login"} aria-label={user ? `Profile: ${user.username}` : "Log in"}>
          <CircleUserRound size={24}/><ChevronDown size={12}/>
        </Link>
        <button className="gdx-mobile-toggle" type="button" onClick={() => setMobileSearch((x) => !x)} aria-label="Toggle search">{mobileSearch ? <X size={22}/> : <Menu size={22}/>}</button>
      </div>
      {mobileSearch && <form className="gdx-mobile-search" action="/discover" method="get"><input name="q" placeholder="Search games..." autoFocus /><button type="submit" aria-label="Search"><Search size={18}/></button></form>}
    </header>
    <nav className="gdx-mobile-nav" aria-label="Mobile navigation">
      <Link href="/discover"><Gamepad2 size={20}/>Discover</Link>
      <Link href="/following"><MessageSquare size={20}/>Following</Link>
      <Link href="/wishlist"><Bookmark size={20}/>Wishlist</Link>
      <Link href={user ? `/users/${encodeURIComponent(user.username)}` : "/login"}><CircleUserRound size={20}/>Profile</Link>
    </nav>
  </>;
}

function ReviewCard({ review, user, onChange }: {
  review: GameReview; user: CurrentUser | null; onChange: () => void;
}) {
  const router = useRouter();
  const [spoilersVisible, setSpoilersVisible] = useState(!review.isSpoiler);
  const [likeCount, setLikeCount] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedText, setEditedText] = useState(review.content);
  const [error, setError] = useState("");
  const own = Boolean(user && review.user?.id === user.id);

  useEffect(() => {
    let active = true;
    const endpoint = user
      ? `/api/reviews/${review.id}/like-status`
      : `/api/reviews/${review.id}/likes`;
    apiRequest<{ likesCount: number; isLiked?: boolean }>(endpoint)
      .then((response) => { if (active) { setLikeCount(response.data.likesCount); setLiked(Boolean(response.data.isLiked)); } })
      .catch(() => { if (active) setLikeCount(null); });
    return () => { active = false; };
  }, [review.id, user]);

  async function toggleLike() {
    if (!user) { router.push("/login"); return; }
    if (busy) return;
    setBusy(true); setError("");
    try {
      await apiRequest(`/api/reviews/${review.id}/like`, { method: liked ? "DELETE" : "POST" });
      setLiked(!liked);
      setLikeCount((c) => c === null ? null : Math.max(0, c + (liked ? -1 : 1)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update like.");
    } finally { setBusy(false); }
  }

  async function saveEdit() {
    if (busy || !editedText.trim()) return;
    setBusy(true); setError("");
    try {
      await apiRequest(`/api/reviews/${review.id}`, { method: "PATCH", body: { content: editedText.trim() } });
      setEditing(false);
      onChange();
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to edit review."); }
    finally { setBusy(false); }
  }

  return <article className="gdx-review-card">
    <div className="gdx-review-author">
      {review.user?.avatarUrl
        // eslint-disable-next-line @next/next/no-img-element
        ? <img className="gdx-avatar" src={review.user.avatarUrl} alt="" />
        : <span className="gdx-avatar gdx-avatar-fallback"><CircleUserRound size={22}/></span>}
      <div className="gdx-review-name">
        {review.user?.username
          ? <Link href={`/users/${encodeURIComponent(review.user.username)}`}><strong>{review.user.displayName || review.user.username}</strong><small> @{review.user.username}</small></Link>
          : <strong>GameboxD player</strong>}
        <span>Reviewed {formattedDate(review.createdAt)} {review.isEdited ? "· Edited" : ""}</span>
      </div>
      {own && <button type="button" className="gdx-text-action" onClick={() => setEditing(!editing)}>{editing ? "Cancel" : "Edit"}</button>}
    </div>
    {editing ? <div className="gdx-edit-form">
      <textarea value={editedText} onChange={(e) => setEditedText(e.target.value)} maxLength={5000}/>
      <button type="button" className="gdx-orange-button" onClick={saveEdit} disabled={busy || !editedText.trim()}>Save changes</button>
    </div> : review.isSpoiler && !spoilersVisible ? <div className="gdx-spoiler">
      <ShieldAlert size={18}/><span>Contains story spoilers</span>
      <button type="button" onClick={() => setSpoilersVisible(true)}>Reveal spoilers</button>
    </div> : <p className="gdx-review-content">{review.content}</p>}
    <div className="gdx-review-footer">
      <button type="button" className={liked ? "gdx-like gdx-liked" : "gdx-like"} onClick={toggleLike} disabled={busy}>
        <Heart size={16} fill={liked ? "currentColor" : "none"}/> {likeCount === null ? "Like" : `${likeCount} ${likeCount === 1 ? "Like" : "Likes"}`}
      </button>
      {review.isSpoiler && spoilersVisible && <button className="gdx-text-action" type="button" onClick={() => setSpoilersVisible(false)}>Hide spoilers</button>}
    </div>
    {error && <p className="gdx-inline-error" role="alert">{error}</p>}
  </article>;
}

export default function GameDetailView({ game }: { game: GameDetailModel }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [localId, setLocalId] = useState<string | null>(game.localId);
  const [localSlug, setLocalSlug] = useState<string | null>(game.extra.localSlug);
  const [extra, setExtra] = useState<PageExtra>(game.extra);
  const [expanded, setExpanded] = useState(false);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [rating, setRating] = useState<number>(0);
  const [reviewContent, setReviewContent] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [reviewRows, setReviewRows] = useState<GameReview[]>([]);
  const [reviewPage, setReviewPage] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [wishlistSaved, setWishlistSaved] = useState(false);
  const [favoriteSaved, setFavoriteSaved] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [onlySpoilers, setOnlySpoilers] = useState(false);

  const description = useMemo(() => readable(game.description), [game.description]);
  const trimmed = description.length > 470 && !expanded
    ? `${description.slice(0, 470).trimEnd()}…` : description;
  const media = useMemo(() => {
    const collection = [...extra.screenshots];
    if (collection.length === 0) {
      if (game.backgroundUrl) collection.push(game.backgroundUrl);
      else if (game.coverUrl) collection.push(game.coverUrl);
    }
    return collection;
  }, [extra.screenshots, game.backgroundUrl, game.coverUrl]);
  const selectedMedia = media[Math.min(mediaIndex, media.length - 1)] ?? null;
  const community = extra.community;
  const maxCount = Math.max(1, ...community.distribution.map((d) => d.count));

  useEffect(() => {
    let active = true;
    apiRequest<CurrentUser>("/api/auth/me")
      .then((r) => { if (active) setCurrentUser(r.data); })
      .catch(() => { if (active) setCurrentUser(null); })
      .finally(() => { if (active) setAuthReady(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!authReady || !currentUser || !localId) return;
    let active = true;
    Promise.allSettled([
      apiRequest<LibraryResult>("/api/users/me/wishlist?page=1&limit=50"),
      apiRequest<LibraryResult>("/api/users/me/favorites?page=1&limit=50"),
    ]).then(([wish, fav]) => {
      if (!active) return;
      if (wish.status === "fulfilled") setWishlistSaved(wish.value.data.games.some((g) => g.gameId === localId));
      if (fav.status === "fulfilled") setFavoriteSaved(fav.value.data.games.some((g) => g.gameId === localId));
    });
    return () => { active = false; };
  }, [authReady, currentUser, localId]);

  const loadReviews = useCallback(async (id: string, page: number, append = false) => {
    setReviewLoading(true); setReviewError("");
    try {
      // The existing Express controller returns { success, data: Review[], page, limit, count }.
      const response = await apiRequest<GameReview[]>(`/api/games/${id}/reviews?page=${page}&limit=10`);
      const rows = Array.isArray(response.data) ? response.data : [];
      setReviewRows((prev) => append ? [...prev, ...rows] : rows);
      setReviewPage(page);
      setHasMoreReviews(rows.length === 10);
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "Could not load community reviews.");
    } finally { setReviewLoading(false); }
  }, []);

  useEffect(() => {
    if (!localId) { setReviewRows([]); return; }
    void loadReviews(localId, 1);
  }, [localId, loadReviews]);

  async function refreshGamePage(id: string, slug: string | null) {
    if (!slug) return;
    try {
      const r = await apiRequest<PageExtra>(`/api/games/local/${encodeURIComponent(slug)}/page-data`);
      setExtra(r.data);
    } catch { /* User action succeeded; summary can be refreshed on next page load */ }
    await loadReviews(id, 1);
  }

  async function ensureLocalGame() {
    if (localId) return { id: localId, slug: localSlug };
    if (!game.rawgId) throw new Error("Game is not available for import.");
    const imported = await apiRequest<{ gameId: string; slug: string }>(
      `/api/games/catalog/${game.rawgId}/import`, { method: "POST" },
    );
    setLocalId(imported.data.gameId);
    setLocalSlug(imported.data.slug);
    return { id: imported.data.gameId, slug: imported.data.slug };
  }

  async function perform(name: string, callback: (id: string) => Promise<void>) {
    if (busy) return;
    if (!currentUser) { router.push("/login"); return; }
    setBusy(name); setError(""); setFeedback("");
    try {
      const local = await ensureLocalGame();
      await callback(local.id);
      setFeedback(`${name} saved successfully.`);
      if (name === "Rating" || name === "Review") await refreshGamePage(local.id, local.slug);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      if (/already.*(wishlist|favorite)|already exists/i.test(message)) {
        if (name === "Wishlist") setWishlistSaved(true);
        if (name === "Favorites") setFavoriteSaved(true);
        setFeedback("This game is already saved.");
      } else if (/already reviewed/i.test(message)) {
        setError("You already reviewed this game. Edit your existing review in the Community Reviews section.");
      } else setError(message);
    } finally { setBusy(null); }
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reviewContent.trim()) return;
    await perform("Review", async (id) => {
      await apiRequest(`/api/games/${id}/reviews`, {
        method: "POST", body: { content: reviewContent.trim(), isSpoiler },
      });
      setReviewContent(""); setIsSpoiler(false);
    });
  }

  function jumpToReview() {
    document.getElementById("gdx-compose-review")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const visibleReviews = reviewRows.filter((r) => !onlySpoilers || r.isSpoiler);
  return <div className="gdx-page">
    <SiteHeader user={currentUser}/>
    <main className="gdx-main">
      <Link href="/discover" className="gdx-back"><ArrowLeft size={15}/> Back to Discover</Link>
      <section className="gdx-hero" aria-label={`${game.name} header`}>
        {game.backgroundUrl && <img src={game.backgroundUrl} alt="" className="gdx-hero-back" />}
        <div className="gdx-hero-gradient"/>
        <div className="gdx-hero-inner">
          <div className="gdx-hero-cover">
            {game.coverUrl ? <img src={game.coverUrl} alt={`${game.name} artwork`}/> : <div className="gdx-no-cover"><Gamepad2 size={45}/></div>}
          </div>
          <div className="gdx-hero-copy">
            <p className="gdx-eyebrow">CATALOG / {game.rawgId ? "RAWG VERIFIED" : "GAMEBOXD"} / GAME DETAILS</p>
            <h1>{game.name}</h1>
            <div className="gdx-meta">
              <span>{game.releaseDate?.slice(0,4) ?? "Release date unknown"}</span>
              {game.genres.slice(0,2).map((g) => <span key={g}>{g}</span>)}
            </div>
            {game.platforms.length > 0 && <div className="gdx-chips">{game.platforms.slice(0,7).map((p) => <span key={p}>{p}</span>)}</div>}
            <div className="gdx-hero-telemetry">
              <div className="gdx-hero-score">
                <b>{game.rawgRating === null ? "—" : game.rawgRating.toFixed(1)}</b>
                <div><RatingStars value={game.rawgRating}/><small>RAWG rating · / 5</small></div>
              </div>
              <div className="gdx-hero-score gdx-hero-score-alt">
                <b>{community.averageRating === null ? "—" : community.averageRating.toFixed(1)}</b>
                <div><span className="gdx-hero-source">GAMEBOXD</span><small>{community.ratingsCount} community ratings</small></div>
              </div>
              {extra.videos.length > 0 && <a className="gdx-trailer" href={extra.videos[0].videoUrl} target="_blank" rel="noopener noreferrer"><PlayCircle size={18}/> Watch trailer</a>}
            </div>
          </div>
        </div>
      </section>
      <div className="gdx-columns">
        <div className="gdx-primary">
          <section className="gdx-panel gdx-about">
            <h2 className="gdx-section-title"><span className="gdx-accent"/> About the Game <small>Story synopsis</small></h2>
            <p className="gdx-about-text">{trimmed || "A description is not available for this title yet."}</p>
            {description.length > 470 && <button type="button" className="gdx-text-action gdx-readmore" onClick={() => setExpanded((v) => !v)}>{expanded ? "Read Less" : "Read More"}</button>}
            <div className="gdx-facts">
              <div><small>Release date</small><strong>{formattedDate(game.releaseDate)}</strong></div>
              <div><small>Genres</small><strong>{game.genres.slice(0,2).join(" / ") || "Not listed"}</strong></div>
              <div><small>Platforms</small><strong>{game.platforms.slice(0,2).join(", ") || "Not listed"}</strong></div>
              <div><small>GameboxD reviews</small><strong>{community.reviewsCount}</strong></div>
            </div>
          </section>

          <section className="gdx-panel gdx-media-panel">
            <div className="gdx-section-head"><h2 className="gdx-section-title"><span className="gdx-accent gdx-accent-green"/> Media & Screen Captures</h2>
              {media.length > 1 && <div className="gdx-gallery-nav"><button type="button" aria-label="Previous image" onClick={() => setMediaIndex((i) => (i - 1 + media.length) % media.length)}><ChevronLeft size={17}/></button><button type="button" aria-label="Next image" onClick={() => setMediaIndex((i) => (i + 1) % media.length)}><ChevronRight size={17}/></button></div>}
            </div>
            {selectedMedia ? <>
              <div className="gdx-main-shot"><img src={selectedMedia} alt={`${game.name} screenshot ${mediaIndex + 1}`}/><span><ImageIcon size={15}/> {media.length > 1 ? `Screenshot ${mediaIndex + 1} of ${media.length}` : "Game artwork"}</span></div>
              {media.length > 1 && <div className="gdx-thumbnails">{media.map((src, i) => <button key={`${src}-${i}`} type="button" aria-label={`Show screenshot ${i + 1}`} aria-pressed={mediaIndex === i} onClick={() => setMediaIndex(i)} className={mediaIndex === i ? "gdx-thumb gdx-thumb-active" : "gdx-thumb"}><img src={src} alt="" /></button>)}</div>}
            </> : <div className="gdx-shot-empty"><ImageIcon size={35}/><span>No screenshots available for this game.</span></div>}
            {extra.videos.length > 0 && <div className="gdx-videos">{extra.videos.map((v) => <a key={v.videoUrl} href={v.videoUrl} target="_blank" rel="noopener noreferrer"><PlayCircle size={15}/> {v.name || "Watch trailer"}</a>)}</div>}
          </section>

          <section className="gdx-panel gdx-ratings-panel">
            <div className="gdx-section-head"><h2 className="gdx-section-title"><span className="gdx-accent"/> Rating Telemetry</h2><span className="gdx-count">{community.ratingsCount} ratings recorded</span></div>
            <div className="gdx-rating-layout">
              <div className="gdx-average">
                <strong>{community.averageRating === null ? "—" : community.averageRating.toFixed(1)}</strong>
                <RatingStars value={community.averageRating} size={18}/>
                <small>GameboxD community rating</small>
              </div>
              <div className="gdx-distribution">
                {community.distribution.map((d) => <div className="gdx-dist-row" key={d.stars}><span>{d.stars} <Star size={10}/></span><div className="gdx-dist-track"><div style={{ width: `${(d.count / maxCount)*100}%` }} /></div><b>{d.count.toLocaleString()}</b></div>)}
              </div>
            </div>
            {community.ratingsCount === 0 && <p className="gdx-muted gdx-note">No GameboxD ratings yet. RAWG's rating is shown separately above.</p>}
          </section>

          <section className="gdx-community" id="gdx-community-reviews">
            <div className="gdx-section-head"><h2 className="gdx-section-title"><span className="gdx-accent gdx-accent-green"/> Community Reviews <small>({community.reviewsCount})</small></h2>
              <div className="gdx-filter-tabs"><button type="button" aria-pressed={!onlySpoilers} className={!onlySpoilers ? "gdx-tab-active" : ""} onClick={() => setOnlySpoilers(false)}>Recent</button><button type="button" aria-pressed={onlySpoilers} className={onlySpoilers ? "gdx-tab-active" : ""} onClick={() => setOnlySpoilers(true)}>With Spoilers</button></div>
            </div>
            {!localId ? <div className="gdx-empty">No GameboxD community activity for this RAWG preview yet. You can write the first review.</div> : reviewError ? <div className="gdx-error"><p>{reviewError}</p><button type="button" onClick={() => loadReviews(localId, 1)}>Retry loading reviews</button></div> : <>
              {reviewLoading && reviewRows.length === 0 ? <div className="gdx-empty">Loading community reviews…</div> : visibleReviews.length ? <div className="gdx-review-list">{visibleReviews.map((review) => <ReviewCard key={review.id} review={review} user={currentUser} onChange={() => void loadReviews(localId,1)} />)}</div> : <div className="gdx-empty">{onlySpoilers ? "No spoiler-marked reviews on this page." : "No reviews yet. Be the first to share your thoughts."}</div>}
              {hasMoreReviews && !onlySpoilers && <button className="gdx-load-more" type="button" disabled={reviewLoading} onClick={() => void loadReviews(localId, reviewPage + 1, true)}>{reviewLoading ? "Loading…" : "Load more reviews"}</button>}
            </>}
          </section>
        </div>

        <aside className="gdx-aside">
          <section className="gdx-panel gdx-user-actions">
            <div className="gdx-personal-rating">
              <small>Your personal rating</small>
              <div className="gdx-interactive-stars" role="group" aria-label="Select your rating">
                {[1,2,3,4,5].map((i) => <button key={i} type="button" title={`Rate ${i} stars`} aria-label={`Rate ${i} stars`} aria-pressed={rating === i} onClick={() => setRating(i)}><Star size={23} fill={i <= rating ? "currentColor" : "none"}/></button>)}
              </div>
              <span>{rating ? `${rating} / 5 selected` : "Tap stars to select your rating"}</span>
              {rating > 0 && <button type="button" className="gdx-save-rating" disabled={!!busy} onClick={() => perform("Rating", async(id) => { await apiRequest(`/api/games/${id}/rating`, { method: "PUT", body: { rating } }); })}>{busy === "Rating" ? "Saving…" : "Save rating"}</button>}
            </div>
            <button type="button" className="gdx-orange-button" onClick={jumpToReview}><PenLine size={16}/> Write a Review</button>
            <button type="button" className="gdx-dark-action" disabled={!!busy} onClick={() => perform("Wishlist", async (id) => {
              await apiRequest(`/api/games/${id}/wishlist`, { method: wishlistSaved ? "DELETE" : "POST" });
              setWishlistSaved((v) => !v);
            })}><Bookmark size={17} fill={wishlistSaved ? "currentColor" : "none"}/>{wishlistSaved ? "Remove from Wishlist" : "Save to Wishlist"}{wishlistSaved && <Check size={14} className="gdx-green"/>}</button>
            <button type="button" className="gdx-dark-action" disabled={!!busy} onClick={() => perform("Favorites", async (id) => {
              await apiRequest(`/api/games/${id}/favorite`, { method: favoriteSaved ? "DELETE" : "POST" });
              setFavoriteSaved((v) => !v);
            })}><Heart size={17} fill={favoriteSaved ? "currentColor" : "none"}/>{favoriteSaved ? "Remove from Favorites" : "Add to Favorites"}{favoriteSaved && <Check size={14} className="gdx-green"/>}</button>
            <button type="button" className="gdx-dark-action gdx-coming-soon" disabled><Plus size={16}/> Log Game <small>Coming Soon</small></button>
            <p className="gdx-info-note"><ShieldAlert size={14}/> Game logging is not implemented yet. Reviews, ratings and saves work through GameboxD.</p>
            {!currentUser && authReady && <Link href="/login" className="gdx-login-notice"><LogIn size={15}/> Sign in to interact with this game</Link>}
            {busy && <p className="gdx-feedback"><LoaderCircle className="gdx-spin" size={14}/> {busy} in progress…</p>}
            {feedback && <p className="gdx-feedback" role="status"><Check size={15}/> {feedback}</p>}
            {error && <p className="gdx-inline-error" role="alert">{error}</p>}
          </section>

          <section id="gdx-compose-review" className="gdx-panel gdx-compose">
            <h2 className="gdx-section-title"><PenLine size={18} color="#FC521E"/> Compose Review</h2>
            <form onSubmit={submitReview}>
              <label htmlFor="gdx-review-content">Your critique</label>
              <textarea id="gdx-review-content" maxLength={5000} minLength={1} placeholder="Share your thoughts on the narrative, gameplay mechanics, pacing, and open-world fidelity..." value={reviewContent} onChange={(e) => setReviewContent(e.target.value)} required />
              <span className="gdx-char-count">{reviewContent.length}/5000</span>
              <label className="gdx-check"><input type="checkbox" checked={isSpoiler} onChange={(e) => setIsSpoiler(e.target.checked)}/> This review contains story spoilers</label>
              <div className="gdx-form-actions"><button type="button" className="gdx-cancel" onClick={() => {setReviewContent("");setIsSpoiler(false);}}>Cancel</button><button type="submit" className="gdx-orange-button" disabled={!!busy || !reviewContent.trim()}>{busy === "Review" ? "Posting…" : "Submit Review"}</button></div>
              <p className="gdx-muted">You can submit one review per game. Your rating is saved separately above.</p>
            </form>
          </section>
        </aside>
      </div>
      <footer className="gdx-footer"><Link href="/discover">GAMEBOX<span>D</span></Link><p>Discover, rate, and review the games that stay with you.</p><small>Game metadata provided by RAWG where available.</small></footer>
    </main>
  </div>;
}
