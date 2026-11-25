"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Heart, MessageCircle, UserPlus } from "lucide-react";
import { socialRequest, isUnauthenticated } from "@/lib/social-client";
import type { NotificationFeed } from "@/lib/social-types";
import "./social.css";

export default function NotificationCenter() {
  const [data, setData] = useState<NotificationFeed | null>(null);
  const [error, setError] = useState("");
  const [guest, setGuest] = useState(false);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    try {
      const result = await socialRequest<NotificationFeed>(
        "/api/social/notifications"
      );
      setData(result);
      setError("");
      setGuest(false);
    } catch (e) {
      setGuest(isUnauthenticated(e));
      setError(e instanceof Error ? e.message : "Unable to load notifications");
    }
  }, []);

  useEffect(() => {
    void reload();
    const refresh = () => void reload();
    const onVisibility = () => {
      if (document.visibilityState === "visible") void reload();
    };
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void reload();
    }, 30_000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reload]);

  async function mark(eventKey?: string) {
    setBusy(true);
    try {
      await socialRequest("/api/social/notifications/read", {
        method: "POST",
        body: eventKey ? { eventKey } : { all: true },
      });
      await reload();
      // Tell the existing navbar bell to update without waiting for polling.
      window.dispatchEvent(new Event("gameboxd:notifications-updated"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not mark notification read");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="gbs-social">
      <div className="gbs-social-inner">
        <p className="gbs-social-eyebrow">Your activity</p>
        <h1>Notifications</h1>
        <p className="gbs-social-intro">
          New followers, likes and replies to your reviews on GameboxD.
        </p>

        {guest ? (
          <p className="gbs-social-panel">
            Please <Link href="/login" style={{ color: "#fc521e" }}>log in</Link> to see notifications.
          </p>
        ) : (
          <>
            {error && <p className="gbs-social-error" role="alert">{error}</p>}
            {!data && !error && <p>Loading notifications…</p>}

            {data && (
              <div className="gbs-social-panel">
                <div
                  className="gbs-social-row"
                  style={{ justifyContent: "space-between" }}
                >
                  <h2>
                    <Bell size={21} style={{ display: "inline", color: "#fc521e" }} />{" "}
                    Activity · {data.unreadCount} unread
                  </h2>
                  <div className="gbs-social-row">
                    <button
                      className="gbs-social-button"
                      type="button"
                      disabled={busy}
                      onClick={() => void reload()}
                    >
                      Refresh
                    </button>
                    <button
                      className="gbs-social-button"
                      type="button"
                      disabled={busy || data.unreadCount === 0}
                      onClick={() => void mark()}
                    >
                      Mark all read
                    </button>
                  </div>
                </div>

                {data.items.length ? (
                  <div className="gbs-social-list">
                    {data.items.map(item => (
                      <div
                        key={item.eventKey}
                        className={`gbs-social-notification ${item.read ? "" : "unread"}`}
                      >
                        {item.type === "follow" ? (
                          <UserPlus size={21} color="#fc521e" />
                        ) : item.type === "review_like" ? (
                          <Heart size={21} color="#fc521e" />
                        ) : (
                          <MessageCircle size={21} color="#fc521e" />
                        )}
                        <div className="gbs-social-grow">
                          <Link href={item.href}>
                            <strong>@{item.actor.username}</strong>{" "}
                            {item.type === "follow"
                              ? "followed you"
                              : item.type === "review_like"
                                ? "liked your review"
                                : "replied to your review"}
                          </Link>
                          <div className="gbs-social-muted" style={{ fontSize: 11 }}>
                            {new Date(item.createdAt).toLocaleString()}
                          </div>
                        </div>
                        {!item.read && (
                          <button
                            className="gbs-social-button gbs-social-button-sm"
                            type="button"
                            disabled={busy}
                            onClick={() => void mark(item.eventKey)}
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="gbs-social-empty">No notifications yet.</div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
