"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Heart, UserPlus } from "lucide-react";
import { socialRequest, isUnauthenticated } from "@/lib/social-client";
import type { NotificationFeed } from "@/lib/social-types";
import "./social.css";
export default function NotificationCenter() {
  const [data, setData] = useState<NotificationFeed | null>(null);
  const [error, setError] = useState("");
  const [guest, setGuest] = useState(false);
  const [busy, setBusy] = useState(false);
  const reload = async () => {
    try { setData(await socialRequest<NotificationFeed>("/api/social/notifications"));setError(""); }
    catch (e) { setGuest(isUnauthenticated(e)); setError(e instanceof Error ? e.message : "Unable to load notifications"); }
  };
  useEffect(() => { void reload(); }, []);
  async function mark(eventKey?: string) {
    setBusy(true);
    try { await socialRequest("/api/social/notifications/read", {method:"POST", body:eventKey ? {eventKey} : {all:true}});await reload(); }
    catch(e) {setError(e instanceof Error ? e.message : "Could not mark read");}
    finally { setBusy(false); }
  }
  return <main className="gbs-social"><div className="gbs-social-inner">
    <p className="gbs-social-eyebrow">Your activity</p><h1>Notifications</h1>
    <p className="gbs-social-intro">New followers and likes on your reviews, based on real GameboxD activity.</p>
    {guest ? <p className="gbs-social-panel">Please <Link style={{color:"#fc521e"}} href="/login">log in</Link> to see notifications.</p> : <>
      {error && <p className="gbs-social-error" role="alert">{error}</p>}
      {!data && !error && <p>Loading notifications…</p>}
      {data && <div className="gbs-social-panel"><div className="gbs-social-row" style={{justifyContent:"space-between"}}><h2><Bell size={21} style={{display:"inline",color:"#fc521e"}}/> Activity · {data.unreadCount} unread</h2><div className="gbs-social-row"><button className="gbs-social-button" type="button" disabled={busy} onClick={() => void reload()}>Refresh</button><button className="gbs-social-button" disabled={busy || data.unreadCount===0} onClick={() => void mark()} type="button">Mark all read</button></div></div>
        {data.items.length ? <div className="gbs-social-list">{data.items.map(item => <div key={item.eventKey} className={`gbs-social-notification ${item.read ? "" : "unread"}`}>
          {item.type === "follow" ? <UserPlus size={21} color="#fc521e"/> : <Heart size={21} color="#fc521e"/>}
          <div className="gbs-social-grow"><Link href={item.href}><strong>@{item.actor.username}</strong> {item.type === "follow" ? "followed you" : "liked your review"}</Link><div className="gbs-social-muted" style={{fontSize:11}}>{new Date(item.createdAt).toLocaleString()}</div></div>
          {!item.read && <button className="gbs-social-button gbs-social-button-sm" disabled={busy} onClick={() => void mark(item.eventKey)}>Mark read</button>}
        </div>)}</div> : <div className="gbs-social-empty">No notifications yet.</div>}
      </div>}
    </>}
  </div></main>;
}
