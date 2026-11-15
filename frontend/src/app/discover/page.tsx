
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { apiRequest } from "@/lib/api";

type CurrentUser = {
  id: string;
  username: string;
  email: string;
};

export default function DiscoverPage() {
  const router = useRouter();

  const [user, setUser] = useState<CurrentUser | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function checkAuthentication() {
      try {
        const response = await apiRequest<CurrentUser>(
          "/api/auth/me"
        );

        if (active) {
          setUser(response.data);
        }
      } catch {
        if (active) {
          router.replace("/login");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    checkAuthentication();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleLogout() {
    try {
      setError("");

      await apiRequest("/api/auth/logout", {
        method: "POST",
      });

      router.replace("/login");
      router.refresh();
    } catch {
      setError("Unable to log out. Please try again.");
    }
  }

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0A0B10] text-[#B0BEC5]">
        Checking authentication...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0B10] px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <nav className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            GameboxD
          </h1>

          <button
            onClick={handleLogout}
            className="rounded-xl border border-[#FF1744] px-4 py-2 text-[#FF1744] transition hover:bg-[#FF1744]/10"
          >
            Logout
          </button>
        </nav>

        <section className="mt-24 max-w-2xl">
          <p className="mb-3 text-[#15FFB5]">
            Authentication successful
          </p>

          <h2 className="mb-5 text-4xl font-bold">
            Welcome, {user.username}!
          </h2>

          <p className="text-lg text-[#B0BEC5]">
            Your Next.js frontend is successfully
            connected to the GameboxD Express API.
          </p>

          <div className="mt-8 rounded-xl border border-[#292D3A] bg-[#141720] p-5">
            <p className="text-sm text-[#B0BEC5]">
              Logged in as
            </p>

            <p className="mt-2 font-semibold">
              {user.email}
            </p>
          </div>

          {error && (
            <p role="alert" className="mt-4 text-[#FF1744]">
              {error}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

