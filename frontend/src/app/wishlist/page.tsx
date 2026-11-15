
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  apiRequest,
  isAuthenticationError,
} from "@/lib/api";
import "../discover/discover.css";

type Item = {
  gameId: string;
  createdAt: string;
  game?: {
    id: string;
    slug: string;
    name: string;
    coverUrl?: string | null;
    averageRating?: string | null;
  };
};

type Result = {
  games: Item[];
  page: number;
  limit: number;
};

type Status =
  | "loading"
  | "success"
  | "unauthorized"
  | "error";

export default function WishlistPage() {
  const [games, setGames] = useState<Item[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [removingId, setRemovingId] = useState<
    string | null
  >(null);

  useEffect(() => {
    let active = true;

    async function loadWishlist() {
      setStatus("loading");
      setError("");

      try {
        const response = await apiRequest<Result>(
          "/api/users/me/wishlist?page=1&limit=20"
        );

        if (!Array.isArray(response.data?.games)) {
          throw new Error("Unexpected wishlist response.");
        }

        if (!active) return;

        setGames(response.data.games);
        setStatus("success");

      } catch (err) {
        if (!active) return;

        if (isAuthenticationError(err)) {
          setStatus("unauthorized");
        } else {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to fetch wishlist."
          );
          setStatus("error");
        }
      }
    }

    loadWishlist();

    return () => {
      active = false;
    };
  }, [retry]);

  async function removeGame(gameId: string) {
    if (removingId) return;

    setRemovingId(gameId);
    setError("");

    try {
      await apiRequest(
        `/api/games/${gameId}/wishlist`,
        { method: "DELETE" }
      );

      setGames((previous) =>
        previous.filter(
          (game) => game.gameId !== gameId
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to remove game."
      );
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <main
      className="gd-discover"
      style={{
        minHeight: "100vh",
        padding: "45px max(16px,5vw)",
      }}
    >
      <Link
        href="/discover"
        style={{ color: "#FC521E" }}
      >
        ← Back to Discover
      </Link>

      <h1
        style={{
          fontSize: 36,
          fontWeight: 750,
          marginTop: 32,
          marginBottom: 25,
        }}
      >
        Your Wishlist
      </h1>

      {status === "loading" && (
        <p>Loading your wishlist...</p>
      )}

      {status === "unauthorized" && (
        <div>
          <p>Please log in to view your wishlist.</p>
          <Link
            href="/login"
            style={{ color: "#FC521E" }}
          >
            Log in
          </Link>
        </div>
      )}

      {status === "error" && (
        <div role="alert">
          <p>Failed to load wishlist: {error}</p>
          <button
            onClick={() => setRetry((n) => n + 1)}
            style={{ color: "#FC521E", marginTop: 12 }}
          >
            Try again
          </button>
        </div>
      )}

      {status === "success" && (
        <>
          {games.length === 0 ? (
            <p>You haven&apos;t saved any games yet.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill,minmax(150px,1fr))",
                gap: 18,
              }}
            >
              {games.map((item) => (
                <div
                  key={item.gameId}
                  style={{
                    background: "#092725",
                    padding: 10,
                    borderRadius: 6,
                    border: "1px solid #163F43",
                  }}
                >
                  <Link
                    href={
                      item.game?.slug
                        ? `/games/${item.game.slug}`
                        : "/discover"
                    }
                  >
                    {item.game?.coverUrl ? (
                      <img
                        src={item.game.coverUrl}
                        alt={item.game.name}
                        style={{
                          width: "100%",
                          aspectRatio: "3/4",
                          objectFit: "cover",
                          borderRadius: 4,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          aspectRatio: "3/4",
                          display: "grid",
                          placeItems: "center",
                          background: "#071F1F",
                        }}
                      >
                        No cover
                      </div>
                    )}

                    <p
                      style={{
                        fontSize: 13,
                        marginTop: 8,
                      }}
                    >
                      {item.game?.name ?? "Saved game"}
                    </p>
                  </Link>

                  <button
                    type="button"
                    disabled={removingId === item.gameId}
                    onClick={() =>
                      removeGame(item.gameId)
                    }
                    style={{
                      marginTop: 12,
                      color: "#FC521E",
                      fontSize: 12,
                    }}
                  >
                    {removingId === item.gameId
                      ? "Removing..."
                      : "Remove from Wishlist"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <p
              role="alert"
              style={{
                marginTop: 16,
                color: "#FF8A79",
              }}
            >
              {error}
            </p>
          )}
        </>
      )}
    </main>
  );
}
