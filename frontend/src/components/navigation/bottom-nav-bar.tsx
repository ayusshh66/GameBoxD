"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home, Gamepad2, Smartphone, UsersRound, Bookmark,
  MessageCircle, UserRound,
} from "lucide-react";
import "./navigation.css";

type NavItem = { label: string; href: string; icon: typeof Home };

// Same expanding-label behaviour as the referenced 21st.dev component.
// Items point to real GameboxD pages, not the demo's finance pages.
const navigationItems: NavItem[] = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Games", href: "/games", icon: Gamepad2 },
  { label: "Mobile", href: "/mobile", icon: Smartphone },
  { label: "Following", href: "/following", icon: UsersRound },
  { label: "Wishlist", href: "/wishlist", icon: Bookmark },
  { label: "Community", href: "/community", icon: MessageCircle },
  { label: "Profile", href: "/login", icon: UserRound },
];

const LABEL_WIDTH = 83;
const AUTH_PAGES = ["/login", "/signup", "/register", "/forgot-password"];

function activeFor(pathname: string, href: string, label: string): boolean {
  if (label === "Home") return pathname === "/" || pathname === "/home" || pathname === "/discover";
  if (label === "Games") return pathname === "/games" || pathname.startsWith("/games/") || pathname.startsWith("/home/shelves/");
  if (label === "Profile") return pathname.startsWith("/users/") || pathname === "/profile";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNavBar() {
  const pathname = usePathname() ?? "";
  const router = useRouter();

  async function openProfile() {
    // Only check auth on an explicit Profile click. No 400/401 network noise
    // from an anonymous visitor just opening the public homepage.
    try {
      const response = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
      if (!response.ok) { router.push("/login"); return; }
      const body = await response.json();
      const username = body?.data?.username;
      router.push(typeof username === "string" && username.trim()
        ? `/users/${encodeURIComponent(username)}`
        : "/login");
    } catch {
      router.push("/login");
    }
  }

  if (AUTH_PAGES.some((p) => pathname === p || pathname.startsWith(p + "/"))) return null;

  return (
    <div className="gbd-top-nav-position">
      <motion.nav
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        aria-label="GameboxD navigation"
        className="gbd-bottom-nav"
      >
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const selected = activeFor(pathname, item.href, item.label);
          return (
            <motion.div key={item.label} whileTap={{ scale: 0.97 }} className="gbd-nav-item-wrap">
              {item.label === "Profile" ? (
                <button type="button" onClick={() => void openProfile()}
                  aria-current={selected ? "page" : undefined} aria-label="Profile" title="Profile"
                  className={`gbd-nav-item${selected ? " gbd-nav-item-active" : ""}`}>
                  <Icon aria-hidden="true" size={21} strokeWidth={2} className="gbd-nav-icon" />
                  <motion.span initial={false}
                    animate={{ width: selected ? LABEL_WIDTH : 0, opacity: selected ? 1 : 0, marginLeft: selected ? 7 : 0 }}
                    transition={{ width: { type: "spring", stiffness: 350, damping: 32 }, opacity: { duration: 0.19 }, marginLeft: { duration: 0.19 } }}
                    className="gbd-nav-label-clip" aria-hidden={!selected}>
                    <span className="gbd-nav-label">Profile</span>
                  </motion.span>
                </button>
              ) : (
                <Link href={item.href} aria-current={selected ? "page" : undefined}
                  aria-label={item.label} title={item.label}
                  className={`gbd-nav-item${selected ? " gbd-nav-item-active" : ""}`}>
                  <Icon aria-hidden="true" size={21} strokeWidth={2} className="gbd-nav-icon" />
                  <motion.span initial={false}
                    animate={{ width: selected ? LABEL_WIDTH : 0, opacity: selected ? 1 : 0, marginLeft: selected ? 7 : 0 }}
                    transition={{ width: { type: "spring", stiffness: 350, damping: 32 }, opacity: { duration: 0.19 }, marginLeft: { duration: 0.19 } }}
                    className="gbd-nav-label-clip" aria-hidden={!selected}>
                    <span className="gbd-nav-label">{item.label}</span>
                  </motion.span>
                </Link>
              )}
            </motion.div>
          );
        })}
      </motion.nav>
    </div>
  );
}

export default BottomNavBar;
