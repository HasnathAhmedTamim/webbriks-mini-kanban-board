"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutGrid, LogOut, Plus, Share2, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { notify } from "@/lib/notify";

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
    `flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition ${
      active
        ? "bg-[var(--accent-soft)] font-medium text-[var(--accent)]"
        : "text-[var(--muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
    }`;

  const goView = (view: BoardView) => {
    onBoardViewChange?.(view);
    router.push(`/boards?view=${view}`);
    setMobileOpen(false);
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
        <button type="button" className={navBtn(onBoards && boardView === "owned")} onClick={() => goView("owned")}>
          <LayoutGrid className="h-4 w-4" />
          My Boards
        </button>
        <button type="button" className={navBtn(onBoards && boardView === "shared")} onClick={() => goView("shared")}>
          <Share2 className="h-4 w-4" />
          Shared with me
        </button>
        <Button
          type="button"
          className="mt-2 w-full"
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

      {user ? (
        <div className="border-t border-[var(--line)] p-3">
          <div className="mb-2 flex items-center gap-2 px-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent)]">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-[var(--muted)]">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            className={navBtn(false)}
            onClick={() => {
              notify.message("Settings are not part of this assessment build.");
            }}
          >
            Settings
          </button>
          <button
            type="button"
            className={navBtn(false)}
            onClick={() => {
              logout();
              router.push("/login");
            }}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      ) : null}
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-[var(--canvas)]">
      <div className="hidden md:block">{sidebar}</div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button type="button" className="absolute inset-0 bg-slate-900/40" aria-label="Close" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 h-full">{sidebar}</div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--surface)] px-4 sm:px-6">
          <button
            type="button"
            className="rounded-md p-2 text-[var(--muted)] hover:bg-[var(--canvas)] md:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden text-sm font-medium text-[var(--ink)] md:block">Kanban Board</div>
          <div className="ml-auto flex items-center gap-3">
            {headerActions}
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden text-sm text-[var(--muted)] sm:inline">{user.name}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent)]">
                  {user.name.slice(0, 1).toUpperCase()}
                </div>
              </div>
            ) : null}
          </div>
        </header>
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
