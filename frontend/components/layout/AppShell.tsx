"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { LayoutGrid, LogOut, Plus, Share2, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { notify } from "@/lib/notify";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export type BoardView = "all" | "owned" | "shared";

type AppShellProps = {
  children: React.ReactNode;
  onCreateBoard?: () => void;
  headerActions?: React.ReactNode;
};

function parseView(value: string | null): BoardView {
  if (value === "shared" || value === "owned") return value;
  return "owned";
}

function SidebarNav({
  onNavigate,
  onCreateBoard,
}: {
  onNavigate?: () => void;
  onCreateBoard?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const onBoardsList = pathname === "/boards";
  const activeView = onBoardsList ? parseView(searchParams.get("view")) : null;

  const navBtn = (active: boolean) =>
    `flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm transition ${
      active
        ? "bg-[var(--accent-soft)] font-medium text-[var(--accent)]"
        : "text-[var(--muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
    }`;

  const goView = (view: "owned" | "shared") => {
    onNavigate?.();
    router.replace(`/boards?view=${view}`, { scroll: false });
  };

  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
        Boards
      </p>
      <button
        type="button"
        className={navBtn(activeView === "owned")}
        onClick={() => goView("owned")}
      >
        <LayoutGrid className="h-4 w-4" />
        My Boards
      </button>
      <button
        type="button"
        className={navBtn(activeView === "shared")}
        onClick={() => goView("shared")}
      >
        <Share2 className="h-4 w-4" />
        Shared with me
      </button>
      <Button
        type="button"
        className="mt-3 w-full"
        onClick={() => {
          onNavigate?.();
          if (onCreateBoard) onCreateBoard();
          else router.replace("/boards?view=owned", { scroll: false });
        }}
      >
        <Plus className="h-4 w-4" />
        Create Board
      </Button>
    </nav>
  );
}

function SidebarNavFallback({
  onNavigate,
  onCreateBoard,
}: {
  onNavigate?: () => void;
  onCreateBoard?: () => void;
}) {
  const router = useRouter();
  const navBtn =
    "flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm text-[var(--muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]";

  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
        Boards
      </p>
      <button
        type="button"
        className={navBtn}
        onClick={() => {
          onNavigate?.();
          router.replace("/boards?view=owned", { scroll: false });
        }}
      >
        <LayoutGrid className="h-4 w-4" />
        My Boards
      </button>
      <button
        type="button"
        className={navBtn}
        onClick={() => {
          onNavigate?.();
          router.replace("/boards?view=shared", { scroll: false });
        }}
      >
        <Share2 className="h-4 w-4" />
        Shared with me
      </button>
      <Button
        type="button"
        className="mt-3 w-full"
        onClick={() => {
          onNavigate?.();
          if (onCreateBoard) onCreateBoard();
          else router.replace("/boards?view=owned", { scroll: false });
        }}
      >
        <Plus className="h-4 w-4" />
        Create Board
      </Button>
    </nav>
  );
}

export function AppShell({ children, onCreateBoard, headerActions }: AppShellProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const confirmLogout = () => {
    setLogoutOpen(false);
    logout();
    notify.success("You’re signed out", {
      description: "Come back anytime.",
    });
    router.push("/login");
  };

  const sidebar = (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-[var(--line)] bg-[var(--surface)]">
      <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-4">
        <Link
          href="/boards?view=owned"
          scroll={false}
          className="text-base font-semibold text-[var(--ink)]"
          onClick={() => setMobileOpen(false)}
        >
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

      <Suspense
        fallback={
          <SidebarNavFallback
            onNavigate={() => setMobileOpen(false)}
            onCreateBoard={onCreateBoard}
          />
        }
      >
        <SidebarNav
          onNavigate={() => setMobileOpen(false)}
          onCreateBoard={onCreateBoard}
        />
      </Suspense>
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
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-[var(--line)] bg-[var(--surface)] px-3 sm:gap-3 sm:px-6">
          <button
            type="button"
            className="shrink-0 rounded-md p-2 text-[var(--muted)] hover:bg-[var(--canvas)] md:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="ml-auto flex min-w-0 items-center gap-1.5 sm:gap-3">
            {headerActions ? (
              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">{headerActions}</div>
            ) : null}
            {user ? (
              <div className="flex min-w-0 items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--canvas)] py-1 pl-1 pr-1.5 sm:gap-2 sm:pr-3">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-semibold text-white"
                  aria-hidden
                >
                  {user.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="hidden min-w-0 max-w-[9rem] sm:block md:max-w-[12rem] lg:max-w-[16rem]">
                  <p className="truncate text-sm font-medium text-[var(--ink)]">{user.name}</p>
                  <p className="truncate text-xs text-[var(--muted)]">{user.email}</p>
                </div>
                <Button
                  variant="ghost"
                  type="button"
                  className="ml-0.5 shrink-0 px-2 py-1"
                  aria-label="Log out"
                  onClick={() => setLogoutOpen(true)}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden lg:inline">Logout</span>
                </Button>
              </div>
            ) : null}
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-auto">{children}</div>
      </div>

      <ConfirmDialog
        open={logoutOpen}
        title="Log out?"
        description="Are you sure you want to sign out of your account?"
        confirmLabel="Log out"
        confirmVariant="primary"
        loadingText="Signing out…"
        onClose={() => setLogoutOpen(false)}
        onConfirm={confirmLogout}
      />
    </div>
  );
}
