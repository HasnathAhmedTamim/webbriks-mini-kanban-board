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
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

export function BoardCard({ board, currentUserId, onDelete }: BoardCardProps) {
  const isOwner = board.ownerId === currentUserId;
  const initials = board.owner.name.slice(0, 1).toUpperCase();

  return (
    <article className="flex h-full flex-col rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/boards/${board.id}`}
          className="text-base font-semibold text-[var(--ink)] hover:text-[var(--accent)]"
        >
          {board.name}
        </Link>
        {isOwner && onDelete ? (
          <Button
            variant="ghost"
            type="button"
            className="px-2 py-1 text-xs text-[var(--danger)]"
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

      <p className="mt-3 text-sm text-[var(--muted)]">
        {board._count?.columns ?? 0} columns
        {board._count?.members != null ? ` · ${board._count.members} members` : ""}
      </p>
      {board.updatedAt ? (
        <p className="mt-1 text-xs text-[var(--muted)]">
          Updated {formatUpdated(board.updatedAt)}
        </p>
      ) : null}

      <div className="mt-auto flex items-center pt-4">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent)]"
          title={board.owner.name}
        >
          {initials}
        </div>
        {!isOwner ? (
          <span className="ml-2 text-xs text-[var(--muted)]">Shared by {board.owner.name}</span>
        ) : null}
      </div>
    </article>
  );
}
