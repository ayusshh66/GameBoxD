"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Gamepad2,
  LockKeyhole,
  Radio,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

type Mode = "login" | "signup";

type Props = { mode: Mode };

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        await apiRequest<{ id: string; username: string; email: string }>(
          "/api/auth/register",
          {
            method: "POST",
            body: { username, email, password },
          }
        );
        setRegistered(true);
      } else {
        await apiRequest<string>("/api/auth/login", {
          method: "POST",
          body: { email, password },
        });
        // Express sets an HttpOnly JWT cookie in the response.
        // With the Next.js /api rewrite, the browser stores it normally.
        router.replace("/discover");
        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-dvh grid-cols-1 bg-[#011717] text-[#F0F7F6] lg:grid-cols-2">
      {/* Brand panel */}
      <section className="relative hidden min-h-dvh flex-col justify-between border-r border-[#163F43]/55 bg-[#021A18] px-10 py-12 lg:flex xl:px-14 xl:py-14">
        <Link href="/" className="relative z-10 flex w-fit items-center gap-3" aria-label="GameboxD home">
          <span className="flex size-12 items-center justify-center rounded-[4px] bg-[#FC521E] text-[#011717]">
            <Gamepad2 className="size-6" strokeWidth={2.2} />
          </span>
          <span className="font-mono text-sm font-bold tracking-[0.27em]">GAMEBOXD</span>
        </Link>

        <div className="relative z-10 max-w-[580px] py-14">
          <p className="mb-8 font-display text-xs font-bold uppercase tracking-[0.25em] text-[#D4E7E4]">
            The player&apos;s diary
          </p>
          <h1 className="max-w-[550px] font-display text-[clamp(2.8rem,4.15vw,5rem)] font-bold leading-[1.04] tracking-[-0.055em]">
            Track what you play. Remember how it felt.
          </h1>
          <p className="mt-8 max-w-[530px] text-base leading-8 text-[#8EAFA9] xl:text-lg">
            A living archive for your backlog, your ratings, and the games
            that stay with you long after the credits.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-3">
            {[
              { value: "01", caption: "Log games", highlight: true },
              { value: "02", caption: "Share reviews" },
              { value: "03", caption: "Find your people" },
            ].map((item) => (
              <div key={item.value} className="min-h-28 rounded-[4px] border border-[#163F43] bg-[#001411]/40 p-4">
                <p className={`font-display text-2xl font-bold ${item.highlight ? "text-[#FC521E]" : "text-[#F0F7F6]"}`}>
                  {item.value}
                </p>
                <p className="mt-3 text-[11px] font-semibold uppercase leading-4 tracking-[0.13em] text-[#8EA4A4]">
                  {item.caption}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-end justify-between gap-5 border-t border-[#163F43]/65 pt-6">
          <p className="max-w-[350px] text-sm leading-6 text-[#8EA4A4]">
            “The best games become part of your personal mythology.”
          </p>
          <span className="flex shrink-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[#8EA4A4]">
            <Radio className="size-3" /> Signal online
          </span>
        </div>
      </section>

      {/* Authentication panel */}
      <section className="flex min-h-dvh items-center justify-center bg-[#001310] px-6 py-10 sm:px-10 lg:px-12 xl:px-16">
        <div className="w-full max-w-[525px]">
          <div className="mb-12 flex items-center gap-3 lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-[4px] bg-[#FC521E] text-[#011717]">
              <Gamepad2 className="size-5" />
            </span>
            <span className="font-mono text-xs font-bold tracking-[0.27em]">GAMEBOXD</span>
          </div>

          {registered ? (
            <div className="space-y-5" role="status">
              <CheckCircle2 className="size-11 text-[#87B683]" />
              <h2 className="font-display text-4xl font-bold tracking-[-0.045em]">
                Save file created.
              </h2>
              <p className="text-[#8EA4A4]">
                Your account is ready. Log in to enter the archive.
              </p>
              <Link href="/login" className="auth-submit mt-5 no-underline">
                Log in to GameboxD <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : (
            <>
              <header className="mb-9">
                <p className="mb-5 font-mono text-xs font-bold uppercase tracking-[0.21em] text-[#FC521E]">
                  {isSignup ? "New player detected" : "Welcome back, player"}
                </p>
                <h2 className="font-display text-[clamp(2rem,3vw,3rem)] font-bold leading-tight tracking-[-0.055em]">
                  {isSignup ? "Make your mark." : "Enter the archive."}
                </h2>
                <p className="mt-4 text-sm leading-6 text-[#8EA4A4] sm:text-base">
                  {isSignup
                    ? "Create your record and start collecting your gaming stories."
                    : "Log in to continue your journey, or make a new record."}
                </p>
              </header>

              <nav aria-label="Authentication" className="mb-9 grid grid-cols-2 rounded-[4px] bg-[#06211E] p-1">
                <Link
                  href="/login"
                  aria-current={!isSignup ? "page" : undefined}
                  className={`rounded-[3px] px-3 py-3 text-center text-sm font-medium transition-colors ${!isSignup ? "bg-[#001310] text-[#F0F7F6]" : "text-[#A4BDB8] hover:text-white"}`}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  aria-current={isSignup ? "page" : undefined}
                  className={`rounded-[3px] px-3 py-3 text-center text-sm font-medium transition-colors ${isSignup ? "bg-[#001310] text-[#F0F7F6]" : "text-[#A4BDB8] hover:text-white"}`}
                >
                  Create account
                </Link>
              </nav>

              <form onSubmit={handleSubmit} className="space-y-6">
                {isSignup && (
                  <div>
                    <label className="auth-label" htmlFor="signup-username">Username</label>
                    <input
                      id="signup-username"
                      className="auth-input"
                      type="text"
                      autoComplete="username"
                      placeholder="Your gamer username"
                      minLength={3}
                      maxLength={30}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="auth-label" htmlFor="auth-email">Email address</label>
                  <input
                    id="auth-email"
                    className="auth-input"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="auth-label" htmlFor="auth-password">
                    {isSignup ? "Create password" : "Password"}
                  </label>
                  <div className="relative">
                    <input
                      id="auth-password"
                      className="auth-input !pr-14"
                      type={showPassword ? "text" : "password"}
                      autoComplete={isSignup ? "new-password" : "current-password"}
                      placeholder={isSignup ? "At least 8 characters" : "Enter your password"}
                      minLength={isSignup ? 8 : 1}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#8EA4A4] hover:text-[#F0F7F6]"
                    >
                      {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p role="alert" className="rounded-[4px] border border-[#FF8A79]/40 bg-[#3A1715]/40 px-4 py-3 text-sm text-[#FF9F91]">
                    {error}
                  </p>
                )}

                <button type="submit" disabled={loading} className="auth-submit">
                  {loading ? "Please wait..." : isSignup ? "Create my account" : "Log in to GameboxD"}
                  {!loading && <ArrowRight className="size-5" />}
                </button>
                {isSignup && (
                  <p className="text-center text-xs leading-5 text-[#8EA4A4]">
                    Join a thoughtful, spoiler-aware gaming community.
                  </p>
                )}
              </form>
            </>
          )}

          <footer className="mt-12 flex items-center justify-between gap-3 border-t border-[#163F43]/65 pt-6 font-mono text-[10px] uppercase tracking-[0.15em] text-[#8EA4A4]">
            <span>GameboxD / 001</span>
            <span className="flex items-center gap-2"><LockKeyhole className="size-3" /> Private by design</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
