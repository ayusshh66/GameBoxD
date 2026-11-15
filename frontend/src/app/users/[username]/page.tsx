
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { UserRound } from "lucide-react";

import {
  apiRequest,
  ApiError,
} from "@/lib/api";

type Profile = {
  id: string;
  username: string;
  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;

  stats?: {
    followersCount?: number;
    followingCount?: number;
    reviewsCount?: number;
    ratingsCount?: number;
    favoritesCount?: number;
  };

  favoriteGames?: {
    id: string;
    name: string;
    slug: string;
    coverUrl: string | null;
  }[];
};

type CurrentUser = {
  id: string;
  username: string;
  email: string;
};

type FollowStatus = {
  isFollowing: boolean;
  isOwnProfile: boolean;
};

export default function PublicProfilePage() {
  const params = useParams<{ username: string }>();
  const router = useRouter();

  const username = params.username;

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [isFollowing, setIsFollowing] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setError("");

      try {
        const result = await apiRequest<Profile>(
          `/api/users/${encodeURIComponent(username)}`
        );

        if (!active) return;

        const fetchedProfile = result.data;
        setProfile(fetchedProfile);

        // Authentication is optional for public profiles.
        let me: CurrentUser | null = null;

        try {
          const meResult =
            await apiRequest<CurrentUser>(
              "/api/auth/me"
            );

          me = meResult.data;
        } catch {
          me = null;
        }

        if (!active) return;

        setCurrentUser(me);

        if (me && me.id !== fetchedProfile.id) {
          try {
            const followResult =
              await apiRequest<FollowStatus>(
                `/api/users/${encodeURIComponent(username)}/follow-status`
              );

            if (active) {
              setIsFollowing(
                followResult.data.isFollowing
              );
            }
          } catch {
            if (active) {
              setIsFollowing(false);
            }
          }
        }
      } catch (err) {
        if (!active) return;

        if (
          err instanceof ApiError &&
          err.status === 404
        ) {
          setError("This user does not exist.");
        } else {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load profile."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [username]);

  async function toggleFollow() {
    if (!profile) return;

    if (!currentUser) {
      router.push("/login");
      return;
    }

    if (busy) return;

    setBusy(true);
    setError("");

    try {
      await apiRequest(
        `/api/users/${encodeURIComponent(username)}/follow`,
        {
          method: isFollowing ? "DELETE" : "POST",
        }
      );

      const newFollowing = !isFollowing;

      setIsFollowing(newFollowing);

      setProfile((previous) => {
        if (!previous) return null;

        const previousCount =
          previous.stats?.followersCount ?? 0;

        return {
          ...previous,
          stats: {
            ...previous.stats,
            followersCount: Math.max(
              0,
              previousCount + (newFollowing ? 1 : -1)
            ),
          },
        };
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update follow."
      );
    } finally {
      setBusy(false);
    }
  }

  const isOwnProfile =
    currentUser?.id === profile?.id;

  return (
    <main
      style={{
        background: "#011717",
        color: "#F0F7F6",
        minHeight: "100vh",
        padding: "5vw",
      }}
    >
      <Link
        href="/discover"
        style={{ color: "#FC521E" }}
      >
        ← Back to Discover
      </Link>

      {loading && (
        <p style={{ marginTop: 30 }}>
          Loading profile...
        </p>
      )}

      {!loading && !profile && (
        <p
          role="alert"
          style={{ marginTop: 30, color: "#FF8A79" }}
        >
          {error || "Profile unavailable."}
        </p>
      )}

      {!loading && profile && (
        <div
          style={{
            maxWidth: 1050,
            margin: "40px auto",
          }}
        >
          <section
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 24,
            }}
          >
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "#071F1F",
                border: "1px solid #163F43",
                display: "grid",
                placeItems: "center",
                overflow: "hidden",
              }}
            >
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.username}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <UserRound size={42} />
              )}
            </div>

            <div style={{ flex: 1 }}>
              <h1
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                }}
              >
                {profile.displayName ||
                  profile.username}
              </h1>

              <p style={{ color: "#87B683" }}>
                @{profile.username}
              </p>

              <p
                style={{
                  color: "#8EA4A4",
                  marginTop: 12,
                }}
              >
                {profile.bio || "No bio yet."}
              </p>
            </div>

            {!isOwnProfile && (
              <button
                disabled={busy}
                onClick={toggleFollow}
                style={{
                  padding: "12px 24px",
                  borderRadius: 4,
                  background: isFollowing
                    ? "#163F43"
                    : "#FC521E",
                  color: isFollowing
                    ? "#F0F7F6"
                    : "#011717",
                  fontWeight: 600,
                }}
              >
                {busy
                  ? "Updating..."
                  : isFollowing
                    ? "Following"
                    : "Follow"}
              </button>
            )}
          </section>

          {error && (
            <p
              role="alert"
              style={{
                color: "#FF8A79",
                marginTop: 20,
              }}
            >
              {error}
            </p>
          )}

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 30,
              padding: "28px 0",
              marginTop: 35,
              borderTop: "1px solid #163F43",
              borderBottom: "1px solid #163F43",
            }}
          >
            {[
              ["Followers", profile.stats?.followersCount],
              ["Following", profile.stats?.followingCount],
              ["Reviews", profile.stats?.reviewsCount],
              ["Ratings", profile.stats?.ratingsCount],
              ["Favorites", profile.stats?.favoritesCount],
            ].map(([label, count]) => (
              <div key={String(label)}>
                <p
                  style={{
                    fontSize: 25,
                    fontWeight: 700,
                  }}
                >
                  {count ?? 0}
                </p>
                <p
                  style={{
                    color: "#8EA4A4",
                    fontSize: 13,
                  }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>

          <h2
            style={{
              fontSize: 25,
              fontWeight: 700,
              marginTop: 42,
              marginBottom: 20,
            }}
          >
            Favorite Games
          </h2>

          {profile.favoriteGames?.length ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill,minmax(140px,1fr))",
                gap: 18,
              }}
            >
              {profile.favoriteGames.map((game) => (
                <Link
                  href={`/games/${game.slug}`}
                  key={game.id}
                >
                  {game.coverUrl && (
                    <img
                      src={game.coverUrl}
                      alt={game.name}
                      style={{
                        width: "100%",
                        aspectRatio: "3/4",
                        objectFit: "cover",
                        borderRadius: 5,
                      }}
                    />
                  )}

                  <p style={{ marginTop: 8 }}>
                    {game.name}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p style={{ color: "#8EA4A4" }}>
              No favorite games yet.
            </p>
          )}
        </div>
      )}
    </main>
  );
}
