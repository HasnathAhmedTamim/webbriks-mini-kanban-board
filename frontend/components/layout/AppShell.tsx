"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";

type AppShellProps = {
  children: React.ReactNode;
  actions?: React.ReactNode;
};

export function AppShell({ children, actions }: AppShellProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--canvas)]">
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/boards" className="text-lg font-semibold text-[var(--ink)]">
              MiniKanban
            </Link>
            <nav className="hidden items-center gap-1 text-sm sm:flex">
              <Link
                href="/boards"
                className={`rounded-md px-3 py-1.5 transition ${
                  pathname.startsWith("/boards")
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                Boards
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {actions}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium text-[var(--ink)]">{user.name}</p>
                  <p className="text-xs text-[var(--muted)]">{user.email}</p>
                </div>
                <div
                  aria-hidden
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent)]"
                >
                  {user.name.slice(0, 1).toUpperCase()}
                </div>
                <Button
                  variant="ghost"
                  type="button"
                  className="hidden sm:inline-flex"
                  onClick={() => {
                    logout();
                    router.push("/login");
                  }}
                >
                  Log out
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
