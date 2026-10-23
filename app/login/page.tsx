"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoginForm from "@/components/auth/LoginForm";
import { homeFor } from "@/lib/roles";
import FullScreenSpinner from "@/components/auth/FullScreenSpinner";

export default function LoginPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Signed in (just now, or already): go to the right place. The only redirect off
  // this page. If the client-side move has not happened shortly after, do a full load:
  // an interrupted soft navigation otherwise leaves the user waiting on this page.
  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) return;
    const target = user.mustChangePassword ? "/change-password" : homeFor(user.role);
    router.replace(target);
    const fallback = window.setTimeout(() => {
      if (window.location.pathname === "/login") window.location.replace(target);
    }, 2500);
    return () => window.clearTimeout(fallback);
  }, [isAuthenticated, isLoading, router, user]);

  if (isLoading || (isAuthenticated && user)) return <FullScreenSpinner />;

  return <LoginForm />;
}
