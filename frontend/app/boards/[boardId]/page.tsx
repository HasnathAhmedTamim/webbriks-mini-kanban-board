"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useBoard, useCreateColumn } from "@/hooks/useBoards";
import { getErrorMessage } from "@/lib/utils";
import { notify } from "@/lib/notify";
import { AppShell } from "@/components/layout/AppShell";
import { ShareBoardModal } from "@/components/boards/ShareBoardModal";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loading } from "@/components/ui/Loading";
import { Modal } from "@/components/ui/Modal";

export default function BoardDetailPage() {
  const params = useParams<{ boardId: string }>();
  const boardId = params.boardId;
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const boardQuery = useBoard(boardId);
  const createColumn = useCreateColumn(boardId);
  const [shareOpen, setShareOpen] = useState(false);
  const [columnOpen, setColumnOpen] = useState(false);
  const [columnName, setColumnName] = useState("");

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user || boardQuery.isLoading) return <Loading label="Loading board…" />;

  if (boardQuery.isError || !boardQuery.data) {
    return (
      <AppShell>
        <main className="mx-auto max-w-3xl px-6 py-16">
          <p className="text-[var(--danger)]">
            {getErrorMessage(boardQuery.error, "Board not found")}
          </p>
          <Link href="/boards" className="mt-4 inline-block text-[var(--accent)] hover:underline">
            Back to boards
          </Link>
        </main>
      </AppShell>
    );
  }

  const board = boardQuery.data;
  const isOwner = board.ownerId === user.id;

  return (
    <AppShell
      actions={
        <div className="flex gap-2">
          <Button variant="secondary" type="button" onClick={() => setColumnOpen(true)}>
            Add column
          </Button>
          <Button type="button" onClick={() => setShareOpen(true)}>
            Share
          </Button>
        </div>
      }
    >
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link href="/boards" className="text-sm text-[var(--muted)] hover:text-[var(--accent)]">
              Boards
            </Link>
            <h1 className="mt-1 text-3xl font-semibold text-[var(--ink)]">{board.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="flex -space-x-2">
                {board.members.slice(0, 5).map((member) => (
                  <div
                    key={member.id}
                    title={`${member.user.name} (${member.role})`}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--surface)] bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent)]"
                  >
                    {member.user.name.slice(0, 1).toUpperCase()}
                  </div>
                ))}
              </div>
              <p className="text-sm text-[var(--muted)]">
                {board.members.length} member{board.members.length === 1 ? "" : "s"} · drag cards to
                move them
              </p>
            </div>
          </div>
        </div>

        <KanbanBoard board={board} />

        <ShareBoardModal
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          board={board}
          isOwner={isOwner}
        />

        <Modal
          open={columnOpen}
          title="Add column"
          onClose={() => setColumnOpen(false)}
          footer={
            <>
              <Button variant="secondary" type="button" onClick={() => setColumnOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                loading={createColumn.isPending}
                onClick={async () => {
                  try {
                    await createColumn.mutateAsync(columnName.trim());
                    notify.success("Column added.");
                    setColumnName("");
                    setColumnOpen(false);
                  } catch (error) {
                    notify.error(error, "We couldn’t add that column.");
                  }
                }}
              >
                Add
              </Button>
            </>
          }
        >
          <Input
            label="Column name"
            name="columnName"
            value={columnName}
            onChange={(e) => setColumnName(e.target.value)}
            placeholder="Review"
          />
        </Modal>
      </main>
    </AppShell>
  );
}
