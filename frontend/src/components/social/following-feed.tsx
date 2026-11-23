"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { socialRequest, isUnauthenticated } from "@/lib/social-client";
import "./social.css";
// The existing Feed module may use different field names. Accept its current rows without changing it.
type FeedActivity = { id: string; type?: string; createdAt?: string;
  user?: { username?: string }; actor?: { username?: string }; username?: string;
  game?: { slug?: string; name?: string }; gameSlug?: string; gameName?: string;
  content?: string; review?: { content?: string }; rating?: number | string };
type Feed = { activities: FeedActivity[]; page: number; limit: number; hasMore: boolean };
export default function FollowingFeed() {
  const [activities, setActivities] = useState<FeedActivity[]>([]);
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guest, setGuest] = useState(false);
  const [error, setError] = useState("");
  async function load(p: number) {
    setLoading(true);setError("");
    try {
      const data = await socialRequest<Feed>(`/api/feed/following?page=${p}&limit=12`);
      setActivities(prev => p === 1 ? data.activities : [...prev, ...data.activities]);setPage(p);setMore(data.hasMore);
    } catch(e) {setGuest(isUnauthenticated(e));setError(e instanceof Error ? e.message : "Unable to load feed");}
    finally {setLoading(false);}
  }
  useEffect(() => {void load(1);}, []);
  return <main className="gbs-social"><div className="gbs-social-inner" style={{maxWidth:960}}><p className="gbs-social-eyebrow">Your network</p><h1>Following Feed</h1>
    <p className="gbs-social-intro">The latest reviews and activities from people you follow. Find more gamers through <Link style={{color:"#fc521e"}} href="/search?tab=players">player search</Link>.</p>
    {guest ? <div className="gbs-social-panel">Please <Link href="/login" style={{color:"#fc521e"}}>log in</Link> to see the people you follow.</div> : <>
      {error && <p className="gbs-social-error" role="alert">{error}</p>}
      {!activities.length && !loading && !error && <div className="gbs-social-panel gbs-social-empty">Your feed is empty. Follow some gamers from their profiles and their new activity will appear here.</div>}
      <div className="gbs-social-list">{activities.map((activity,i) => {
        const username = activity.actor?.username ?? activity.user?.username ?? activity.username ?? "a player";
        const title = activity.game?.name ?? activity.gameName;
        const slug = activity.game?.slug ?? activity.gameSlug;
        const content = activity.review?.content ?? activity.content;
        return <article className="gbs-social-review" key={`${activity.type ?? "review"}-${activity.id}-${i}`}>
          <div className="gbs-social-row"><strong>{username}</strong><span className="gbs-social-muted">{activity.type ?? "review"}</span>{activity.createdAt && <time className="gbs-social-muted">{new Date(activity.createdAt).toLocaleString()}</time>}</div>
          {title && <h3>{slug ? <Link href={`/games/${encodeURIComponent(slug)}`}>{title}</Link> : title}</h3>}
          {content && <p>{content}</p>}{activity.rating != null && <small>Rating: {activity.rating}/5</small>}
        </article>;
      })}</div>
      {loading && <p className="gbs-social-muted">Loading feed…</p>}
      {more && !loading && <button className="gbs-social-button" onClick={() => void load(page+1)}>Load more</button>}
    </>}
  </div></main>;
}
