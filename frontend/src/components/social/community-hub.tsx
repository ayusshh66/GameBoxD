"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, UsersRound } from "lucide-react";
import { socialRequest, isUnauthenticated } from "@/lib/social-client";
import type { Community, CommunityReview, Player } from "@/lib/social-types";
import { PlayerCard } from "./cards";
import "./social.css";

function Review({ item, onLike }: { item: CommunityReview; onLike: (id: string) => void }) {
  const [revealed, setRevealed] = useState(!item.isSpoiler);
  return <article className="gbs-social-review">
    <div className="gbs-social-row"><Link href={`/users/${encodeURIComponent(item.user.username)}`}>@{item.user.username}</Link><span className="gbs-social-muted">·</span><time className="gbs-social-muted">{new Date(item.createdAt).toLocaleDateString()}</time></div>
    <h3><Link href={`/games/${encodeURIComponent(item.game.slug)}`}>{item.game.name}</Link></h3>
    {revealed ? <p>{item.content}</p> : <button className="gbs-social-button" type="button" onClick={() => setRevealed(true)}>Contains spoilers — reveal review</button>}
    <button type="button" className="gbs-social-button gbs-social-button-sm" onClick={() => onLike(item.id)} aria-label={`Like review, ${item.likes} likes`}><Heart size={15}/> {item.likes} likes</button>
  </article>;
}
export default function CommunityHub() {
  const [data, setData] = useState<Community | null>(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [tab, setTab] = useState<"popularRecent" | "latest">("popularRecent");
  const [following, setFollowing] = useState<Record<string, boolean>>({});
  useEffect(() => { socialRequest<Community>("/api/social/community").then(setData).catch(e => setError(e instanceof Error ? e.message : "Unable to load community")); }, []);
  async function like(id: string) {
    setFeedback("");
    try {
      await socialRequest(`/api/reviews/${id}/like`, { method: "POST" });
      setData(prev => prev ? { ...prev, latest: prev.latest.map(r => r.id === id ? { ...r, likes: r.likes + 1 } : r), popularRecent: prev.popularRecent.map(r => r.id === id ? { ...r, likes: r.likes + 1 } : r) } : prev);
      setFeedback("Review liked");
    } catch (e) { setFeedback(isUnauthenticated(e) ? "Sign in to like reviews" : e instanceof Error ? e.message : "Unable to like review"); }
  }
  async function follow(user: Player) {
    setFeedback("");
    try {
      await socialRequest(`/api/users/${encodeURIComponent(user.username)}/follow`, { method: "POST" });
      setFollowing(p => ({ ...p, [user.id]: true }));
      setFeedback(`Now following @${user.username}`);
    } catch (e) { setFeedback(isUnauthenticated(e) ? "Sign in to follow gamers" : e instanceof Error ? e.message : "Unable to follow"); }
  }
  return <main className="gbs-social"><div className="gbs-social-inner">
    <p className="gbs-social-eyebrow">The community</p><h1>Games are better together.</h1>
    <p className="gbs-social-intro">Find gamers, read real reviews and see what people are playing. Nothing here is a fake demo post.</p>
    {feedback && <div role="status" className="gbs-social-panel">{feedback} {feedback.startsWith("Sign in") && <Link href="/login" style={{color:"#fc521e"}}>Log in</Link>}</div>}
    {error && <p className="gbs-social-error" role="alert">{error}</p>}
    {!data && !error && <p className="gbs-social-muted">Loading community…</p>}
    {data && <>
      <section className="gbs-social-panel"><div className="gbs-social-row" style={{justifyContent:"space-between"}}><h2><MessageCircle size={21} style={{display:"inline",marginRight:8,color:"#fc521e"}}/> Community reviews</h2><Link className="gbs-social-button" href="/following">Following Feed</Link></div>
        <div className="gbs-social-tabs" style={{marginBottom:18}}><button className="gbs-social-tab" aria-selected={tab === "popularRecent"} onClick={() => setTab("popularRecent")}>Popular recent</button><button className="gbs-social-tab" aria-selected={tab === "latest"} onClick={() => setTab("latest")}>Newest</button></div>
        {data[tab].length ? <div className="gbs-social-review-list">{data[tab].map(r => <Review key={r.id} item={r} onLike={like}/>)}</div> : <p className="gbs-social-empty">No reviews yet. Be the first to write one on a game page.</p>}
      </section>
      <section className="gbs-social-panel"><div className="gbs-social-row" style={{justifyContent:"space-between"}}><h2><UsersRound size={21} style={{display:"inline",marginRight:8,color:"#fc521e"}}/> Meet other gamers</h2><Link href="/search?tab=players" className="gbs-social-button">Find players</Link></div>
      {data.players.length ? <div className="gbs-social-players">{data.players.map(user => <PlayerCard key={user.id} user={user} actions={<div style={{marginTop:7}}><button className="gbs-social-button gbs-social-button-sm" disabled={!!following[user.id]} onClick={() => void follow(user)}>{following[user.id] ? "Following" : "Follow"}</button></div>}/>)}</div> : <p className="gbs-social-empty">No players yet.</p>}</section>
    </>}
  </div></main>;
}
