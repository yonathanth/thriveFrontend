"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoginForm from "@/components/auth/LoginForm";
import { homeFor } from "@/lib/roles";

export default function LoginPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Already signed in: go straight to the right place.
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      router.replace(user.mustChangePassword ? "/change-password" : homeFor(user.role));
    }
  }, [isAuthenticated, isLoading, router, user]);

  return <LoginForm eyebrow="Members & staff" subtitle="Members, trainers and staff sign in here." />;
}
