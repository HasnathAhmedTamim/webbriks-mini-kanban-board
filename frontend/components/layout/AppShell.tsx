"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutGrid, LogOut, Plus, Share2, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";

export type BoardView = "all" | "owned" | "shared";

type AppShellProps = {
  children: React.ReactNode;
  boardView?: BoardView;
  onBoardViewChange?: (view: BoardView) => void;
  onCreateBoard?: () => void;
  headerActions?: React.ReactNode;
};

export function AppShell({
  children,
  boardView = "owned",
  onBoardViewChange,
  onCreateBoard,
  headerActions,
}: AppShellProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const onBoards = pathname.startsWith("/boards") && !pathname.split("/")[2];

  const navBtn = (active: boolean) =>
    `flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm transition ${
      active
        ? "bg-[var(--accent-soft)] font-medium text-[var(--accent)]"
        : "text-[var(--muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
    }`;

  const goView = (view: BoardView) => {
    onBoardViewChange?.(view);
    router.push(`/boards?view=${view}`);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const sidebar = (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-[var(--line)] bg-[var(--surface)]">
      <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-4">
        <Link href="/boards" className="text-base font-semibold text-[var(--ink)]">
          Kanban Board
        </Link>
        <button
          type="button"
          className="rounded-md p-1 text-[var(--muted)] md:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
          Boards
        </p>
        <button
          type="button"
          className={navBtn(onBoards && boardView === "owned")}
          onClick={() => goView("owned")}
        >
          <LayoutGrid className="h-4 w-4" />
          My Boards
        </button>
        <button
          type="button"
          className={navBtn(onBoards && boardView === "shared")}
          onClick={() => goView("shared")}
        >
          <Share2 className="h-4 w-4" />
          Shared with me
        </button>
        <Button
          type="button"
          className="mt-3 w-full"
          onClick={() => {
            if (onCreateBoard) onCreateBoard();
            else router.push("/boards?view=owned");
            setMobileOpen(false);
          }}
        >
          <Plus className="h-4 w-4" />
          Create Board
        </Button>
      </nav>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-[var(--canvas)]">
      <div className="hidden md:block">{sidebar}</div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            aria-label="Close"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 h-full">{sidebar}</div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--surface)] px-4 sm:px-6">
          <button
            type="button"
            className="rounded-md p-2 text-[var(--muted)] hover:bg-[var(--canvas)] md:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {headerActions}
            {user ? (
              <div className="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--canvas)] py-1 pl-1 pr-2 sm:pr-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-semibold text-white"
                  aria-hidden
                >
                  {user.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="hidden min-w-0 sm:block">
                  <p className="truncate text-sm font-medium text-[var(--ink)]">{user.name}</p>
                  <p className="truncate text-xs text-[var(--muted)]">{user.email}</p>
                </div>
                <Button
                  variant="ghost"
                  type="button"
                  className="ml-1 px-2 py-1"
                  aria-label="Log out"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden lg:inline">Logout</span>
                </Button>
              </div>
            ) : null}
          </div>
        </header>
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
