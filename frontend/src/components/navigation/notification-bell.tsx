"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import "./notification-bell.css";

type NotificationsResponse = {
  success?: boolean;
  data?: { unreadCount?: number };
};

/**
 * Navbar bell badge for GameboxD's existing GET /api/social/notifications route.
 * Only shows a number when the authenticated API returns an unread count > 0.
 */
export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/social/notifications", {
        credentials: "include",
        cache: "no-store",
      });

      // Guests and unavailable APIs should not show a misleading count.
      if (!response.ok) {
        setUnreadCount(null);
        return;
      }

      const result = (await response.json()) as NotificationsResponse;
      const count = result.data?.unreadCount;
      setUnreadCount(
        result.success === true &&
          typeof count === "number" &&
          Number.isFinite(count)
          ? Math.max(0, Math.floor(count))
          : null
      );
    } catch {
      setUnreadCount(null);
    }
  }, []);

  useEffect(() => {
    void refresh();

    const onFocus = () => void refresh();
    const onVisibility = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 30_000);

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("gameboxd:notifications-updated", onFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("gameboxd:notifications-updated", onFocus);
    };
  }, [refresh]);

  const label = unreadCount && unreadCount > 0
    ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
    : "Notifications";

  return (
    <Link
      href="/notifications"
      className="gbd-action gbd-icon-action gbd-notification-action"
      aria-label={label}
      title={label}
    >
      <Bell size={20} aria-hidden="true" />
      {unreadCount !== null && unreadCount > 0 && (
        <span className="gbd-notification-badge" aria-hidden="true">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
