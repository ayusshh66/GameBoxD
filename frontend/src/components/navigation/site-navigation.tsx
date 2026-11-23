"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Bookmark, Gamepad2, House, LogOut, MessageCircle, Search, Settings, UserRound, UsersRound } from "lucide-react";
import "./navigation.css";

const tabs = [
  { label: "Home", href: "/home", icon: House },
  { label: "Search", href: "/search", icon: Search },
  { label: "Following", href: "/following", icon: UsersRound },
  { label: "Library", href: "/library", icon: Bookmark },
  { label: "Community", href: "/community", icon: MessageCircle },
] as const;
const hidden = ["/login", "/signup", "/register", "/forgot-password"];
const currentTab = (path: string, tab: string) => {
  if (tab === "/home") return path === "/home" || path === "/" || path === "/discover" || path === "/games" || path.startsWith("/games/") || path.startsWith("/home/shelves/") || path === "/mobile";
  if (tab === "/library") return path.startsWith("/library") || path.startsWith("/wishlist");
  return path === tab || path.startsWith(tab + "/");
};

type Me = { username: string; id: string };
export default function SiteNavigation() {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [me, setMe] = useState<Me | null>(null);
  const [checking, setChecking] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => { setMenu(false); }, [pathname]);
  useEffect(() => {
    if (!menu) return;
    const handler = (e: PointerEvent) => { if (!dropdownRef.current?.contains(e.target as Node)) setMenu(false); };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [menu]);

  async function toggleMenu() {
    if (menu) { setMenu(false); return; }
    setMenu(true);
    setChecking(true);
    try {
      const r = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
      const body = r.ok ? await r.json() : null;
      setMe(body?.data?.username ? body.data : null);
    } catch { setMe(null); }
    finally { setChecking(false); }
  }
  async function logout() {
    try { await fetch("/api/social/logout", { method: "POST", credentials: "include" }); }
    finally { setMe(null); setMenu(false); router.push("/login"); router.refresh(); }
  }
  if (hidden.some(x => pathname === x || pathname.startsWith(x + "/"))) return null;

  return <header className="gbd-site-header">
    <Link href="/home" className="gbd-site-brand" aria-label="GameboxD Home">
      <span className="gbd-brand-mark"><Gamepad2 size={22}/></span>
      <span>GAMEBOX<span className="gbd-brand-accent">D</span></span>
    </Link>
    <motion.nav className="gbd-bottom-nav" aria-label="Main navigation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: "spring", stiffness: 270, damping: 27 }}>
      {tabs.map(tab => {
        const selected = currentTab(pathname, tab.href);
        const Icon = tab.icon;
        return <Link key={tab.href} href={tab.href} aria-label={tab.label} title={tab.label} aria-current={selected ? "page" : undefined} className={`gbd-nav-item ${selected ? "gbd-nav-item-active" : ""}`}>
          <Icon className="gbd-nav-icon" size={20}/>
          <motion.span className="gbd-nav-label-clip" initial={false} animate={{ width: selected ? 77 : 0, opacity: selected ? 1 : 0, marginLeft: selected ? 7 : 0 }} transition={{ width: { type: "spring", stiffness: 350, damping: 32 }, opacity: { duration: 0.19 }, marginLeft: { duration: 0.19 } }}><span className="gbd-nav-label">{tab.label}</span></motion.span>
        </Link>;
      })}
    </motion.nav>
    <div className="gbd-site-actions">
      <Link href="/notifications" className="gbd-action gbd-icon-action" title="Notifications" aria-label="Notifications"><Bell size={20}/></Link>
      <div className="gbd-avatar-wrap" ref={dropdownRef}>
        <button className="gbd-action gbd-icon-action" aria-label="Account menu" aria-expanded={menu} type="button" onClick={() => void toggleMenu()}><UserRound size={20}/></button>
        <AnimatePresence>{menu && <motion.div className="gbd-avatar-menu" role="menu" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
          {checking ? <p>Checking account…</p> : me ? <>
            <strong>@{me.username}</strong>
            <Link role="menuitem" href={`/users/${encodeURIComponent(me.username)}`}><UserRound size={16}/>My Profile</Link>
            <Link role="menuitem" href="/settings"><Settings size={16}/>Edit Profile & Settings</Link>
            <button role="menuitem" onClick={() => void logout()} type="button"><LogOut size={16}/>Log out</button>
          </> : <><p>You are browsing as a guest.</p><Link role="menuitem" href="/login">Log in</Link><Link role="menuitem" href="/signup">Create account</Link></>}
        </motion.div>}</AnimatePresence>
      </div>
    </div>
  </header>;
}
