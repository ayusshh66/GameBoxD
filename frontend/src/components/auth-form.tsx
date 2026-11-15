
"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { apiRequest } from "@/lib/api";

type AuthMode = "login" | "signup";

type Props = {
  mode: AuthMode;
};

export default function AuthForm({ mode }: Props) {
  const router = useRouter();
  const isSignup = mode === "signup";

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);

  const inputClass =
    "w-full rounded-xl border border-[#292D3A] " +
    "bg-[#141720] px-4 py-3 text-white " +
    "placeholder:text-[#7A8593] " +
    "outline-none transition " +
    "focus:border-[#3D5AFE] focus:ring-2 " +
    "focus:ring-[#3D5AFE]/20";

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      if (isSignup) {
        await apiRequest("/api/auth/register", {
          method: "POST",
          body: {
            username,
            email,
            password,
          },
        });

        setRegistered(true);
      } else {
        await apiRequest("/api/auth/login", {
          method: "POST",
          body: {
            email,
            password,
          },
        });

        router.replace("/discover");
        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#0A0B10] text-white lg:grid-cols-2">
      {/* Left: Form */}
      <section className="flex min-h-screen flex-col px-6 py-8 sm:px-12 lg:px-20">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight"
        >
          <span className="h-3 w-3 rounded-sm bg-[#15FFB5]" />
          GameboxD
        </Link>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          {registered ? (
            <div className="space-y-5">
              <div className="text-4xl text-[#15FFB5]">
                ✓
              </div>

              <h1 className="text-3xl font-bold">
                Account created!
              </h1>

              <p className="text-[#B0BEC5]">
                Your GameboxD account is ready.
                Sign in to start exploring.
              </p>

              <Link
                href="/login"
                className="inline-block rounded-xl bg-[#3D5AFE] px-6 py-3 font-semibold text-white transition hover:bg-[#3048D9]"
              >
                Continue to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-9 space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#15FFB5]">
                  {isSignup
                    ? "Join the community"
                    : "Welcome back"}
                </p>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {isSignup
                    ? "Create your account."
                    : "Welcome back, gamer."}
                </h1>

                <p className="text-[#B0BEC5]">
                  {isSignup
                    ? "Discover games, share reviews and connect with gamers."
                    : "Sign in to continue your gaming journey."}
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {isSignup && (
                  <div className="space-y-2">
                    <label
                      htmlFor="username"
                      className="text-sm font-medium"
                    >
                      Username
                    </label>

                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      placeholder="Your gamer username"
                      className={inputClass}
                      value={username}
                      onChange={(e) =>
                        setUsername(e.target.value)
                      }
                      minLength={3}
                      maxLength={30}
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={inputClass}
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword ? "text" : "password"
                      }
                      autoComplete={
                        isSignup
                          ? "new-password"
                          : "current-password"
                      }
                      placeholder={
                        isSignup
                          ? "At least 8 characters"
                          : "Enter your password"
                      }
                      className={`${inputClass} pr-20`}
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      minLength={isSignup ? 8 : 1}
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#B0BEC5] hover:text-white"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-[#FF1744]/30 bg-[#FF1744]/10 px-4 py-3 text-sm text-[#FF728D]"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#3D5AFE] px-4 py-3.5 font-semibold text-white transition hover:bg-[#3048D9] disabled:opacity-60"
                >
                  {loading
                    ? "Please wait..."
                    : isSignup
                      ? "Create Account"
                      : "Sign In"}
                </button>
              </form>

              <p className="mt-7 text-center text-sm text-[#B0BEC5]">
                {isSignup
                  ? "Already have an account?"
                  : "New to GameboxD?"}{" "}
                <Link
                  href={isSignup ? "/login" : "/signup"}
                  className="font-semibold text-[#15FFB5] hover:underline"
                >
                  {isSignup ? "Sign in" : "Create account"}
                </Link>
              </p>
            </>
          )}
        </div>

        <p className="text-xs text-[#B0BEC5]">
          © GameboxD
        </p>
      </section>

      {/* Right: Decorative panel */}
      <section className="relative hidden overflow-hidden border-l border-[#292D3A] bg-[#101626] lg:flex lg:flex-col lg:justify-end">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_20%,rgba(61,90,254,0.38),transparent_55%)]" />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(21,255,181,0.12),transparent_50%)]" />

        <div className="relative z-10 p-14">
          <div className="mb-8 flex gap-3">
            <div className="h-48 w-32 rotate-[-7deg] rounded-xl border border-[#3D5AFE]/50 bg-gradient-to-b from-[#3D5AFE] to-[#111527]" />

            <div className="h-48 w-32 translate-y-5 rounded-xl border border-[#15FFB5]/40 bg-gradient-to-b from-[#176F60] to-[#111527]" />

            <div className="h-48 w-32 rotate-[7deg] rounded-xl border border-[#FF1744]/40 bg-gradient-to-b from-[#8B1C38] to-[#111527]" />
          </div>

          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#15FFB5]">
            Play. Review. Connect.
          </p>

          <h2 className="max-w-lg text-4xl font-bold leading-tight">
            Every game has a story.
            <span className="text-[#B0BEC5]">
              {" "}Share yours.
            </span>
          </h2>

          <p className="mt-5 max-w-md text-[#B0BEC5]">
            Your home for discovering games,
            sharing opinions and connecting
            with the gaming community.
          </p>
        </div>
      </section>
    </main>
  );
}
