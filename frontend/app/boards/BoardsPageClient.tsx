"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useBoards, useDeleteBoard } from "@/hooks/useBoards";
import { getErrorMessage } from "@/lib/utils";
import { notify } from "@/lib/notify";
import { AppShell, type BoardView } from "@/components/layout/AppShell";
import { BoardList } from "@/components/boards/BoardList";
import { CreateBoardModal } from "@/components/boards/CreateBoardModal";
import { Loading } from "@/components/ui/Loading";

function parseView(value: string | null): BoardView {
  if (value === "shared" || value === "owned" || value === "all") return value;
  return "owned";
}

export default function BoardsPageClient() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const boardsQuery = useBoards();
  const deleteBoard = useDeleteBoard();
  const [createOpen, setCreateOpen] = useState(false);
  const [filter, setFilter] = useState<BoardView>(() => parseView(searchParams.get("view")));

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    setFilter(parseView(searchParams.get("view")));
  }, [searchParams]);

  const filtered = useMemo(() => {
    const boards = boardsQuery.data || [];
    if (!user) return boards;
    if (filter === "owned") return boards.filter((b) => b.ownerId === user.id);
    if (filter === "shared") return boards.filter((b) => b.ownerId !== user.id);
    return boards;
  }, [boardsQuery.data, filter, user]);

  if (isLoading || !user) return <Loading />;
  if (boardsQuery.isLoading) return <Loading label="Loading boards…" />;

  const title = filter === "shared" ? "Shared with me" : "My Boards";

  return (
    <AppShell
      boardView={filter}
      onBoardViewChange={(view) => {
        setFilter(view);
        router.replace(`/boards?view=${view}`);
      }}
      onCreateBoard={() => setCreateOpen(true)}
    >
      <main className="px-4 py-6 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[var(--ink)]">{title}</h1>
        </div>

        {boardsQuery.isError ? (
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 text-sm text-[var(--danger)]">
            We couldn’t load your boards. {getErrorMessage(boardsQuery.error)}
          </div>
        ) : (
          <BoardList
            boards={filtered}
            currentUserId={user.id}
            emptyLabel={filter === "shared" ? "No shared boards yet" : "No boards yet"}
            emptyHint={
              filter === "shared"
                ? "When someone invites you, their board will show up here."
                : "Click Create Board to make your first one."
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
