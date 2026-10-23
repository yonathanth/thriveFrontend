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

  // Already signed in: go straight to the right place.
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      router.replace(user.mustChangePassword ? "/change-password" : homeFor(user.role));
    }
  }, [isAuthenticated, isLoading, router, user]);

  if (isLoading || (isAuthenticated && user)) return <FullScreenSpinner />;

  return <LoginForm />;
}
