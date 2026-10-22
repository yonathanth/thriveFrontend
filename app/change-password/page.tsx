"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import FullScreenSpinner from "@/components/auth/FullScreenSpinner";
import { homeFor } from "@/lib/roles";
import { SITE_NAME } from "@/lib/site";

const MIN_LENGTH = 6;

/**
 * Required after signing in with a temporary password (first sign-in or after a
 * staff reset); also where anyone signed in changes their password.
 */
export default function ChangePasswordPage() {
  const { user, isAuthenticated, isLoading, changePassword, logout } = useAuth();
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/login");
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !user) return <FullScreenSpinner />;

  const forced = !!user.mustChangePassword;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (next.length < MIN_LENGTH) return setError(`Use at least ${MIN_LENGTH} characters.`);
    if (next !== confirm) return setError("The new passwords do not match.");
    if (next === current) return setError("Choose a password different from the current one.");

    setIsSubmitting(true);
    try {
      const updated = await changePassword(current, next);
      router.replace(homeFor(updated.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change the password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="v2 flex min-h-screen p-2 md:p-3">
      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-[1.25rem] bg-night px-4 py-16 md:rounded-[1.5rem]">
        <div className="relative w-full max-w-md">
          <div className="mb-6 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/thrive-logo.png" alt={SITE_NAME} width={111} height={40} className="h-10 w-auto object-contain" />
          </div>

          <div className="rounded-[1.25rem] bg-white p-7 md:p-10">
            <p className="mono text-lime-deep">{user.name}</p>
            <h1 className="mt-3 text-4xl font-light tracking-tight">
              {forced ? "Choose a new password" : "Change password"}
            </h1>
            <p className="mono mt-2 text-night/55">
              {forced
                ? "You signed in with a temporary password. Set your own to continue."
                : "Other devices will be signed out."}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {error && (
                <div className="rounded-[0.9rem] border border-red-300 bg-red-50 p-4 text-sm text-red-700" role="alert">
                  {error}
                </div>
              )}

              <label className="block">
                <span className="mono mb-2 block text-night/60">
                  {forced ? "Temporary password" : "Current password"}
                </span>
                <input
                  type="password"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="field"
                />
              </label>

              <label className="block">
                <span className="mono mb-2 block text-night/60">New password</span>
                <input
                  type="password"
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  required
                  minLength={MIN_LENGTH}
                  autoComplete="new-password"
                  className="field"
                />
              </label>

              <label className="block">
                <span className="mono mb-2 block text-night/60">Confirm new password</span>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={MIN_LENGTH}
                  autoComplete="new-password"
                  className="field"
                />
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="cta cta-lg cta-dark w-full justify-center disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Saving…" : "Save password"}
              </button>
            </form>
          </div>

          <div className="mt-6 flex justify-center gap-6">
            {forced ? (
              <button
                onClick={() => {
                  logout();
                  router.replace("/login");
                }}
                className="mono text-white/60 hover:text-white"
              >
                Sign out
              </button>
            ) : (
              <Link href={homeFor(user.role)} className="mono text-white/60 hover:text-white">
                ← Back
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
