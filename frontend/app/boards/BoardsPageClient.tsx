"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useBoard, useBoards, useDeleteBoard } from "@/hooks/useBoards";
import { notify } from "@/lib/notify";
import type { BoardView } from "@/components/layout/AppShell";
import {
  useBoardCreateHandler,
  useBoardHeaderActions,
} from "@/components/layout/BoardsChrome";
import { BoardList } from "@/components/boards/BoardList";
import { CreateBoardModal } from "@/components/boards/CreateBoardModal";
import { ShareBoardModal } from "@/components/boards/ShareBoardModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { BoardSkeleton, Loading } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import type { BoardSummary } from "@/types";

function parseView(value: string | null): BoardView {
  if (value === "shared" || value === "owned") return value;
  return "owned";
}

export default function BoardsPageClient() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const boardsQuery = useBoards();
  const deleteBoard = useDeleteBoard();
  const [createOpen, setCreateOpen] = useState(false);
  const [renameBoard, setRenameBoard] = useState<BoardSummary | null>(null);
  const [shareBoardId, setShareBoardId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BoardSummary | null>(null);

  const filter = parseView(searchParams.get("view"));
  const showOwned = filter === "owned";
  const showShared = filter === "shared";
  const shareQuery = useBoard(shareBoardId || "");

  const openCreate = useCallback(() => setCreateOpen(true), []);

  const headerActions = useMemo(
    () => (
      <Button type="button" className="px-2.5 sm:px-3.5" onClick={openCreate}>
        <Plus className="h-4 w-4" />
        <span className="sm:hidden">Create</span>
        <span className="hidden sm:inline">Create Board</span>
      </Button>
    ),
    [openCreate]
  );

  useBoardHeaderActions(headerActions);
  useBoardCreateHandler(openCreate);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!searchParams.get("view")) {
      router.replace("/boards?view=owned", { scroll: false });
    }
  }, [searchParams, router]);

  const owned = useMemo(
    () => (boardsQuery.data || []).filter((b) => b.ownerId === user?.id),
    [boardsQuery.data, user]
  );
  const shared = useMemo(
    () => (boardsQuery.data || []).filter((b) => b.ownerId !== user?.id),
    [boardsQuery.data, user]
  );

  if (isLoading || !user) return <Loading />;

  return (
    <>
      <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-5 sm:px-6 sm:py-6">
        {boardsQuery.isLoading ? <BoardSkeleton /> : null}

        {boardsQuery.isError ? (
          <p className="text-sm text-[var(--danger)]">Failed to load boards. Please refresh.</p>
        ) : null}

        {!boardsQuery.isLoading && showOwned ? (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-xl font-semibold text-[var(--ink)]">My Boards</h1>
            </div>
            <BoardList
              boards={owned}
              currentUserId={user.id}
              emptyLabel="No boards yet"
              emptyHint="Create your first board to get started."
              onCreate={openCreate}
              onRename={setRenameBoard}
              onShare={(b) => setShareBoardId(b.id)}
              onDelete={setDeleteTarget}
            />
          </section>
        ) : null}

        {!boardsQuery.isLoading && showShared ? (
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-[var(--ink)]">Shared with me</h2>
            </div>
            <BoardList
              boards={shared}
              currentUserId={user.id}
              emptyLabel="No boards have been shared with you."
              emptyHint="When a teammate invites you, their board will appear here."
            />
          </section>
        ) : null}
      </main>

      <CreateBoardModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <CreateBoardModal
        open={Boolean(renameBoard)}
        mode="rename"
        boardId={renameBoard?.id}
        initialName={renameBoard?.name}
        onClose={() => setRenameBoard(null)}
      />

      {shareQuery.data ? (
        <ShareBoardModal
          open={Boolean(shareBoardId)}
          onClose={() => setShareBoardId(null)}
          board={shareQuery.data}
          isOwner={shareQuery.data.ownerId === user.id}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Board?"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        loading={deleteBoard.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            await deleteBoard.mutateAsync(deleteTarget.id);
            notify.success("Board removed", {
              description: `“${deleteTarget.name}” is gone from your list.`,
            });
            setDeleteTarget(null);
          } catch (error) {
            notify.error(error, "We couldn’t remove that board. Please try again.");
          }
        }}
      />
    </>
  );
}
