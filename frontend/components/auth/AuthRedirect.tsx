"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loading } from "@/components/ui/Loading";

/** Sends signed-in users away from auth pages. */
export function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/boards");
    }
  }, [isLoading, user, router]);

  if (isLoading || user) {
    return <Loading label="One moment…" />;
  }

  return <>{children}</>;
}
