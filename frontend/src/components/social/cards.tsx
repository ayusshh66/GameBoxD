"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { Gamepad2, UserRound } from "lucide-react";
import type { FoundGame, Player } from "@/lib/social-types";

export function GameCard({ game }: { game: FoundGame }) {
  const img = game.coverUrl ?? game.backgroundUrl;
  return <Link href={game.href} className="gbs-social-game">
    {img ? <img src={img} alt={`${game.name} artwork`} loading="lazy"/> : <div className="gbs-social-game-placeholder"><Gamepad2 size={34}/></div>}
    <div className="gbs-social-game-body"><strong>{game.name}</strong><small>{game.averageRating != null ? `Rating ${Number(game.averageRating).toFixed(1)} / 5` : "View game details"}</small></div>
  </Link>;
}
export function PlayerCard({ user, actions }: { user: Player; actions?: ReactNode }) {
  return <div className="gbs-social-player">
    <Link href={`/users/${encodeURIComponent(user.username)}`} aria-label={`View ${user.username}'s profile`}>
      {user.avatarUrl ? <img className="gbs-social-avatar" src={user.avatarUrl} alt=""/> : <span className="gbs-social-avatar"><UserRound size={22}/></span>}
    </Link>
    <div className="gbs-social-grow" style={{ minWidth: 0 }}>
      <Link href={`/users/${encodeURIComponent(user.username)}`} className="gbs-social-name">{user.displayName || user.username}</Link>
      <small>@{user.username}</small>
      {user.bio && <p className="gbs-social-bio">{user.bio}</p>}
      {actions}
    </div>
  </div>;
}
