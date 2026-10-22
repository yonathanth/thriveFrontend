"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { homeFor } from "@/lib/roles";
import { SITE_NAME } from "@/lib/site";

interface LoginFormProps {
  eyebrow: string;
  subtitle: string;
}

/** Sign-in for every role: phone number (anyone) or email (admins). */
export default function LoginForm({ eyebrow, subtitle }: LoginFormProps) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const user = await login(identifier, password);
      router.push(user.mustChangePassword ? "/change-password" : homeFor(user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="v2 flex min-h-screen p-2 md:p-3">
      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-[1.25rem] bg-night px-4 py-16 md:rounded-[1.5rem]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/hero.jpg" alt="" className="photo absolute inset-0 h-full w-full object-cover opacity-40" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night via-night/70 to-night/50" />

        <div className="relative w-full max-w-md">
          <Link href="/" className="mb-6 flex justify-center" aria-label={`${SITE_NAME} home`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/thrive-logo.png" alt={SITE_NAME} width={111} height={60} className="h-20 w-auto object-contain" />
          </Link>

          <div className="rounded-[1.25rem] bg-white p-7 md:p-10">
            <p className="mono text-lime-deep">{eyebrow}</p>
            <h1 className="mt-3 text-4xl font-light tracking-tight">Sign in</h1>
            <p className="mono mt-2 text-night/55">{subtitle}</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {error && (
                <div className="rounded-[0.9rem] border border-red-300 bg-red-50 p-4 text-sm text-red-700" role="alert">
                  {error}
                </div>
              )}

              <label className="block">
                <span className="mono mb-2 block text-night/60">Phone number or email</span>
                <input
                  id="identifier"
                  type="text"
                  inputMode="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="09XX XXX XXX"
                  className="field"
                />
              </label>

              <label className="block">
                <span className="mono mb-2 block text-night/60">Password</span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="field"
                />
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="cta cta-lg cta-dark w-full justify-center disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Signing in…" : "Sign in"}
              </button>

              <p className="text-sm text-night/55">
                First time here? Sign in with your phone number and the temporary password from the front
                desk. Forgot your password? Ask the front desk to reset it.
              </p>
            </form>
          </div>

          <div className="mt-6 flex justify-center">
            <Link href="/" className="mono text-white/60 hover:text-white">
              ← Back to website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
