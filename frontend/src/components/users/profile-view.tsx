"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserRound, UserPlus, UserCheck, Settings } from "lucide-react";
import { apiRequest, ApiError, isAuthenticationError } from "@/lib/api";
import "./profile-view.css";

type Profile = {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  stats?: {
    followersCount?: number;
    followingCount?: number;
    reviewsCount?: number;
    ratingsCount?: number;
    favoritesCount?: number;
  };
  favoriteGames?: Array<{
    id: string;
    name: string;
    slug: string;
    coverUrl: string | null;
  }>;
};

type CurrentUser = { id: string; username: string };
type FollowStatus = { isFollowing: boolean; isOwnProfile?: boolean };

/** Next.js usually decodes route parameters already. This handles old
 * links that accidentally passed an encoded username as the parameter. */
function decodeUsername(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default function ProfileView({ username }: { username: string }) {
  const router = useRouter();
  const handle = useMemo(() => decodeUsername(username), [username]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [me, setMe] = useState<CurrentUser | null>(null);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setError("");
      setProfile(null);
      setFollowing(false);

      // A public profile works even when the visitor is signed out.
      const [publicResult, meResult] = await Promise.allSettled([
        apiRequest<Profile>(`/api/users/${encodeURIComponent(handle)}`),
        apiRequest<CurrentUser>("/api/auth/me"),
      ]);

      if (!active) return;
      const current = meResult.status === "fulfilled" ? meResult.value.data : null;
      setMe(current);

      try {
        let result: Profile;
        if (publicResult.status === "fulfilled") {
          result = publicResult.value.data;
        } else {
          // The existing broken link sometimes uses a display name rather
          // than a username. Only redirect if it matches THIS logged-in user.
          let own: Profile | null = null;
          if (current) {
            try {
              const response = await apiRequest<Profile>("/api/users/me");
              own = response.data;
            } catch {
              // Do not override the public-profile error.
            }
          }
          if (own && (
            own.username.toLowerCase() === handle.toLowerCase() ||
            own.displayName?.toLowerCase() === handle.toLowerCase()
          )) {
            result = own;
            router.replace(`/users/${encodeURIComponent(own.username)}`);
          } else if (publicResult.reason instanceof ApiError && publicResult.reason.status === 404) {
            throw new Error(`No player found for @${handle}. Check the username.`);
          } else {
            throw publicResult.reason;
          }
        }

        if (!active) return;
        setProfile(result);

        if (current && current.id !== result.id) {
          try {
            const status = await apiRequest<FollowStatus>(
              `/api/users/${encodeURIComponent(result.username)}/follow-status`
            );
            if (active) setFollowing(status.data.isFollowing);
          } catch {
            // Leave the public profile usable if follow status fails.
          }
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load player profile.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProfile();
    return () => { active = false; };
  }, [handle, router]);

  async function toggleFollow() {
    if (!profile || busy) return;
    if (!me) {
      router.push("/login");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const old = following;
      await apiRequest(
        `/api/users/${encodeURIComponent(profile.username)}/follow`,
        { method: old ? "DELETE" : "POST" }
      );
      setFollowing(!old);
      setProfile(prev => prev ? {
        ...prev,
        stats: {
          ...prev.stats,
          followersCount: Math.max(0, (prev.stats?.followersCount ?? 0) + (old ? -1 : 1)),
        },
      } : prev);
    } catch (err) {
      if (isAuthenticationError(err)) router.push("/login");
      else setError(err instanceof Error ? err.message : "Could not update follow status.");
    } finally {
      setBusy(false);
    }
  }

  const ownProfile = Boolean(me && profile && me.id === profile.id);

  return (
    <main className="gp-page">
      <div className="gp-container">
        <Link className="gp-back" href="/discover">← Back to Discover</Link>

        {loading ? (
          <p className="gp-feedback">Loading profile...</p>
        ) : !profile ? (
          <section className="gp-empty">
            <UserRound size={42} />
            <h1>Profile unavailable</h1>
            <p role="alert">{error || "This player could not be found."}</p>
            <Link href="/search">Find other players</Link>
          </section>
        ) : (
          <>
            <section className="gp-header">
              <div className="gp-avatar">
                {profile.avatarUrl ? (
                  // User-set image URLs may come from external hosts.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatarUrl} alt={`${profile.username}'s avatar`} />
                ) : <UserRound size={42} />}
              </div>

              <div className="gp-info">
                <p className="gp-eyebrow">GAMEBOXD / PLAYER PROFILE</p>
                <h1>{profile.displayName || profile.username}</h1>
                <p className="gp-handle">@{profile.username}</p>
                <p className="gp-bio">{profile.bio || "No bio added yet."}</p>
              </div>

              <div className="gp-actions">
                {ownProfile ? (
                  <Link href="/settings" className="gp-follow">
                    <Settings size={17} /> Edit Profile
                  </Link>
                ) : (
                  <button type="button" className="gp-follow" disabled={busy} onClick={() => void toggleFollow()}>
                    {following ? <UserCheck size={17} /> : <UserPlus size={17} />}
                    {busy ? "Updating..." : following ? "Following" : "Follow"}
                  </button>
                )}
              </div>
            </section>

            {error && <p className="gp-error" role="alert">{error}</p>}

            <div className="gp-stats">
              <div><strong>{profile.stats?.followersCount ?? 0}</strong><span>Followers</span></div>
              <div><strong>{profile.stats?.followingCount ?? 0}</strong><span>Following</span></div>
              <div><strong>{profile.stats?.reviewsCount ?? 0}</strong><span>Reviews</span></div>
              <div><strong>{profile.stats?.ratingsCount ?? 0}</strong><span>Ratings</span></div>
              <div><strong>{profile.stats?.favoritesCount ?? 0}</strong><span>Favorites</span></div>
            </div>

            <h2 className="gp-subtitle">Favorite games</h2>
            {profile.favoriteGames?.length ? (
              <div className="gp-games">
                {profile.favoriteGames.map(game => (
                  <Link key={game.id} href={`/games/${encodeURIComponent(game.slug)}`} className="gp-game">
                    {game.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={game.coverUrl} alt={`${game.name} cover`} loading="lazy" />
                    ) : <div className="gp-no-cover">No cover</div>}
                    <span>{game.name}</span>
                  </Link>
                ))}
              </div>
            ) : <p className="gp-muted">No favorite games yet.</p>}
          </>
        )}
      </div>
    </main>
  );
}
