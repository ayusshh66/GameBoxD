"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, Search } from "lucide-react";
import BottomNavBar from "./bottom-nav-bar";
import "./navigation.css";

const AUTH_PAGES = ["/login", "/signup", "/register", "/forgot-password"];

export default function SiteNavigation() {
  const pathname = usePathname() ?? "";
  if (AUTH_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;

  return (
    <>
      {/* Stitch brand header; navigation itself is the 21st.dev animated bottom pill. */}
      <header className="gbd-site-header">
        <Link href="/home" className="gbd-site-brand" aria-label="GameboxD Home">
          <span className="gbd-brand-mark"><Gamepad2 size={21} strokeWidth={2.3}/></span>
          <span>GAMEBOX<span className="gbd-brand-accent">D</span></span>
        </Link>
        <Link href="/games" className="gbd-site-search" aria-label="Browse and search games" title="Browse games">
          <Search size={20}/><span>Explore games</span>
        </Link>
      </header>
      <BottomNavBar />
    </>
  );
}
