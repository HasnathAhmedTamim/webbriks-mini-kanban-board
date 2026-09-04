"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useBoards, useDeleteBoard } from "@/hooks/useBoards";
import { getErrorMessage } from "@/lib/utils";
import { notify } from "@/lib/notify";
import { AppShell } from "@/components/layout/AppShell";
import { BoardList } from "@/components/boards/BoardList";
import { CreateBoardModal } from "@/components/boards/CreateBoardModal";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";

type Filter = "all" | "owned" | "shared";

export default function BoardsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const boardsQuery = useBoards();
  const deleteBoard = useDeleteBoard();
  const [createOpen, setCreateOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  const filtered = useMemo(() => {
    const boards = boardsQuery.data || [];
    if (!user) return boards;
    if (filter === "owned") return boards.filter((b) => b.ownerId === user.id);
    if (filter === "shared") return boards.filter((b) => b.ownerId !== user.id);
    return boards;
  }, [boardsQuery.data, filter, user]);

  if (isLoading || !user) return <Loading />;
  if (boardsQuery.isLoading) return <Loading label="Loading boards…" />;

  const tabs: { id: Filter; label: string }[] = [
    { id: "all", label: "All boards" },
    { id: "owned", label: "Owned by me" },
    { id: "shared", label: "Shared with me" },
  ];

  return (
    <AppShell
      actions={
        <Button type="button" onClick={() => setCreateOpen(true)}>
          New board
        </Button>
      }
    >
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <header className="mb-8">
          <p className="text-sm text-[var(--muted)]">Hi {user.name.split(" ")[0]}</p>
          <h1 className="mt-1 text-3xl font-semibold text-[var(--ink)]">Your boards</h1>
          <p className="mt-2 max-w-xl text-[var(--muted)]">
            Pick a board to work on, or create a new one when you need a fresh space.
          </p>
        </header>

        <div className="mb-6 flex flex-wrap gap-2 border-b border-[var(--line)] pb-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`rounded-md px-3 py-1.5 text-sm transition ${
                filter === tab.id
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {boardsQuery.isError ? (
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 text-sm text-[var(--danger)]">
            We couldn’t load your boards. {getErrorMessage(boardsQuery.error)} Refresh and try again.
          </div>
        ) : (
          <BoardList
            boards={filtered}
            currentUserId={user.id}
            emptyLabel={
              filter === "shared"
                ? "No shared boards yet"
                : filter === "owned"
                  ? "You don’t own any boards yet"
                  : "No boards yet"
            }
            emptyHint={
              filter === "shared"
                ? "When someone invites you, their board will show up here."
                : "Click “New board” to create your first one."
            }
            onDelete={async (boardId) => {
              try {
                await deleteBoard.mutateAsync(boardId);
                notify.success("Board deleted.");
              } catch (error) {
                notify.error(error, "We couldn’t delete that board.");
              }
            }}
          />
        )}

        <CreateBoardModal open={createOpen} onClose={() => setCreateOpen(false)} />
      </main>
    </AppShell>
  );
}
