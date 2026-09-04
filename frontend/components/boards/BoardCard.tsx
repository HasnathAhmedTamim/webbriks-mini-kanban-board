"use client";

import Link from "next/link";
import type { BoardSummary } from "@/types";
import { Button } from "@/components/ui/Button";

type BoardCardProps = {
  board: BoardSummary;
  currentUserId?: string;
  onDelete?: (boardId: string) => void;
};

function formatUpdated(value: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

export function BoardCard({ board, currentUserId, onDelete }: BoardCardProps) {
  const isOwner = board.ownerId === currentUserId;
  const initials = board.owner.name.slice(0, 1).toUpperCase();

  return (
    <article className="flex h-full flex-col rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/boards/${board.id}`}
            className="text-lg font-semibold text-[var(--ink)] hover:text-[var(--accent)]"
          >
            {board.name}
          </Link>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {isOwner ? "You own this board" : `Shared by ${board.owner.name}`}
          </p>
        </div>
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent)]"
          title={board.owner.name}
        >
          {initials}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-6 text-xs text-[var(--muted)]">
        <p>
          {board._count?.columns ?? 0} columns
          {board._count?.members != null ? ` · ${board._count.members} members` : ""}
          {board.updatedAt ? ` · ${formatUpdated(board.updatedAt)}` : ""}
        </p>
        {isOwner && onDelete ? (
          <Button
            variant="ghost"
            type="button"
            className="px-2 py-1 text-[var(--danger)]"
            onClick={() => {
              if (window.confirm("Delete this board? This cannot be undone.")) {
                onDelete(board.id);
              }
            }}
          >
            Delete
          </Button>
        ) : null}
      </div>
    </article>
  );
}
