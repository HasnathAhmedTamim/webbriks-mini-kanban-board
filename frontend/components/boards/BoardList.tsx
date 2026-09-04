"use client";

import type { BoardSummary } from "@/types";
import { BoardCard } from "./BoardCard";

type BoardListProps = {
  boards: BoardSummary[];
  currentUserId?: string;
  onDelete?: (boardId: string) => void;
  emptyLabel?: string;
  emptyHint?: string;
};

export function BoardList({
  boards,
  currentUserId,
  onDelete,
  emptyLabel = "No boards here yet",
  emptyHint = "Create a board to get started.",
}: BoardListProps) {
  if (boards.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-8 py-12 text-center">
        <p className="font-medium text-[var(--ink)]">{emptyLabel}</p>
        <p className="mt-1 text-sm text-[var(--muted)]">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {boards.map((board) => (
        <BoardCard
          key={board.id}
          board={board}
          currentUserId={currentUserId}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
