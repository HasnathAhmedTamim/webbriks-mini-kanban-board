"use client";

import type { BoardSummary } from "@/types";
import { BoardCard } from "./BoardCard";
import { EmptyState } from "@/components/ui/EmptyState";

type BoardListProps = {
  boards: BoardSummary[];
  currentUserId?: string;
  emptyLabel?: string;
  emptyHint?: string;
  onCreate?: () => void;
  onRename?: (board: BoardSummary) => void;
  onShare?: (board: BoardSummary) => void;
  onDelete?: (board: BoardSummary) => void;
};

export function BoardList({
  boards,
  currentUserId,
  emptyLabel = "No boards yet",
  emptyHint = "Create your first board to get started.",
  onCreate,
  onRename,
  onShare,
  onDelete,
}: BoardListProps) {
  if (boards.length === 0) {
    return (
      <EmptyState
        title={emptyLabel}
        description={emptyHint}
        actionLabel={onCreate ? "+ Create Board" : undefined}
        onAction={onCreate}
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {boards.map((board) => (
        <BoardCard
          key={board.id}
          board={board}
          currentUserId={currentUserId}
          onRename={onRename}
          onShare={onShare}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
