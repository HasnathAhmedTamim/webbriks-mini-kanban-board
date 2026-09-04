"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
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
  boardView = "all",
  onBoardViewChange,
  onCreateBoard,
  headerActions,
}: AppShellProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const onBoards = pathname.startsWith("/boards");

  const navBtn = (active: boolean) =>
    `flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
      active
        ? "bg-[var(--accent-soft)] font-medium text-[var(--accent)]"
        : "text-[var(--muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
    }`;

  const sidebar = (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-[var(--line)] bg-[var(--surface)]">
      <div className="border-b border-[var(--line)] px-4 py-4">
        <Link href="/boards" className="text-lg font-semibold text-[var(--ink)]">
          MiniKanban
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        <button
          type="button"
          className={navBtn(onBoards && boardView === "owned")}
          onClick={() => {
            onBoardViewChange?.("owned");
            if (!onBoards) router.push("/boards?view=owned");
            setMobileOpen(false);
          }}
        >
          My Boards
        </button>
        <button
          type="button"
          className={navBtn(onBoards && boardView === "shared")}
          onClick={() => {
            onBoardViewChange?.("shared");
            if (!onBoards) router.push("/boards?view=shared");
            setMobileOpen(false);
          }}
        >
          Shared with me
        </button>
        {onCreateBoard ? (
          <Button type="button" className="mt-2 w-full" onClick={onCreateBoard}>
            + Create Board
          </Button>
        ) : (
          <Link href="/boards" className="mt-2">
            <Button type="button" className="w-full">
              + Create Board
            </Button>
          </Link>
        )}
      </nav>

      {user ? (
        <div className="border-t border-[var(--line)] p-3">
          <div className="mb-2 flex items-center gap-2 px-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent)]">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[var(--ink)]">{user.name}</p>
              <p className="truncate text-xs text-[var(--muted)]">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            className={navBtn(false)}
            onClick={() => {
              logout();
              router.push("/login");
            }}
          >
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
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 h-full">{sidebar}</div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--surface)] px-4 sm:px-6">
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-sm text-[var(--muted)] hover:bg-[var(--canvas)] md:hidden"
            onClick={() => setMobileOpen(true)}
          >
            Menu
          </button>
          <div className="ml-auto flex items-center gap-2">{headerActions}</div>
        </header>
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
