"use client";

import Link from "next/link";
import type { BoardSummary } from "@/types";
import { Dropdown } from "@/components/ui/Dropdown";

type BoardCardProps = {
  board: BoardSummary;
  currentUserId?: string;
  onRename?: (board: BoardSummary) => void;
  onShare?: (board: BoardSummary) => void;
  onDelete?: (board: BoardSummary) => void;
};

function formatRelative(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Updated just now";
  if (hours < 24) return `Updated ${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `Updated ${days} day${days === 1 ? "" : "s"} ago`;
}

export function BoardCard({ board, currentUserId, onRename, onShare, onDelete }: BoardCardProps) {
  const isOwner = board.ownerId === currentUserId;
  const members = board.members || [];
  const shown = members.slice(0, 3);
  const extra = Math.max(0, (board._count?.members || members.length) - shown.length);

  const menuItems = [
    ...(isOwner && onRename ? [{ label: "Rename", onClick: () => onRename(board) }] : []),
    ...(isOwner && onShare ? [{ label: "Share", onClick: () => onShare(board) }] : []),
    ...(isOwner && onDelete ? [{ label: "Delete", onClick: () => onDelete(board), danger: true }] : []),
  ];

  return (
    <article className="group relative flex h-full flex-col rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm transition hover:border-[var(--accent)]/30">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/boards/${board.id}`}
          className="text-base font-semibold text-[var(--ink)] hover:text-[var(--accent)]"
        >
          {board.name}
        </Link>
        <Dropdown items={menuItems} label={`Actions for ${board.name}`} />
      </div>

      <p className="mt-3 text-sm text-[var(--muted)]">
        {board._count?.columns ?? 0} Columns · {board._count?.tasks ?? 0} Tasks
      </p>
      {board.updatedAt ? (
        <p className="mt-1 text-xs text-[var(--muted)]">{formatRelative(board.updatedAt)}</p>
      ) : null}

      <div className="mt-auto flex items-center pt-4">
        <div className="flex -space-x-2">
          {shown.length > 0
            ? shown.map((m) => (
                <div
                  key={m.id}
                  title={m.user.name}
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[var(--accent-soft)] text-[10px] font-semibold text-[var(--accent)]"
                >
                  {m.user.name.slice(0, 1).toUpperCase()}
                </div>
              ))
            : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[var(--accent-soft)] text-[10px] font-semibold text-[var(--accent)]">
                  {board.owner.name.slice(0, 1).toUpperCase()}
                </div>
              )}
          {extra > 0 ? (
            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[var(--canvas)] text-[10px] font-medium text-[var(--muted)]">
              +{extra}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
