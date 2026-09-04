"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/boards");
    }
  }, [isLoading, user, router]);

  if (isLoading) return <Loading />;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-medium text-[var(--accent)]">MiniKanban</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--ink)]">
        Keep work moving, simply.
      </h1>
      <p className="mt-4 max-w-xl text-lg text-[var(--muted)]">
        Create boards, invite teammates, and drag tasks between columns. Clear access control
        included.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/register">
          <Button>Get started</Button>
        </Link>
        <Link href="/login">
          <Button variant="secondary">Sign in</Button>
        </Link>
      </div>
    </main>
  );
}
