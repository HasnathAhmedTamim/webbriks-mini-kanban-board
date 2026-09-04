"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Columns3, Share2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useBoard, useCreateColumn } from "@/hooks/useBoards";
import { getErrorMessage } from "@/lib/utils";
import { notify } from "@/lib/notify";
import { AppShell } from "@/components/layout/AppShell";
import { ShareBoardModal } from "@/components/boards/ShareBoardModal";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { KanbanSkeleton } from "@/components/ui/Loading";
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

  if (isLoading || !user) {
    return (
      <AppShell>
        <main className="px-3 py-4 sm:px-6 sm:py-5">
          <KanbanSkeleton />
        </main>
      </AppShell>
    );
  }

  if (boardQuery.isLoading && !boardQuery.data) {
    return (
      <AppShell>
        <main className="px-3 py-4 sm:px-6 sm:py-5">
          <KanbanSkeleton />
        </main>
      </AppShell>
    );
  }

  if (boardQuery.isError || !boardQuery.data) {
    return (
      <AppShell>
        <main className="mx-auto max-w-3xl px-6 py-16">
          <p className="text-[var(--danger)]">
            {getErrorMessage(boardQuery.error, "Board not found")}
          </p>
          <Link href="/boards" className="mt-4 inline-block text-[var(--accent)] hover:underline">
            Back to Boards
          </Link>
        </main>
      </AppShell>
    );
  }

  const board = boardQuery.data;
  const isOwner = board.ownerId === user.id;

  return (
    <AppShell
      headerActions={
        <>
          <Button
            variant="secondary"
            type="button"
            className="px-2.5 sm:px-3.5"
            aria-label="Share board"
            onClick={() => setShareOpen(true)}
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button
            type="button"
            className="px-2.5 sm:px-3.5"
            aria-label="Add column"
            onClick={() => setColumnOpen(true)}
          >
            <Columns3 className="h-4 w-4" />
            <span className="hidden sm:inline">Add Column</span>
          </Button>
        </>
      }
    >
      <main className="px-3 py-4 sm:px-6 sm:py-5">
        <div className="mb-4 sm:mb-5">
          <Link href="/boards?view=owned" className="text-sm text-[var(--accent)] hover:underline">
            Back to Boards
          </Link>
          <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="min-w-0 break-words text-xl font-semibold text-[var(--ink)] sm:text-2xl">
              {board.name}
            </h1>
            <div className="flex -space-x-2">
              {board.members.slice(0, 4).map((member) => (
                <div
                  key={member.id}
                  title={`${member.user.name} (${member.role})`}
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--surface)] bg-[var(--accent-soft)] text-[10px] font-semibold text-[var(--accent)]"
                >
                  {member.user.name.slice(0, 1).toUpperCase()}
                </div>
              ))}
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
          title="Add Column"
          onClose={() => setColumnOpen(false)}
          footer={
            <>
              <Button
                variant="secondary"
                type="button"
                className="w-full sm:w-auto"
                onClick={() => setColumnOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="w-full sm:w-auto"
                loading={createColumn.isPending}
                onClick={async () => {
                  try {
                    await createColumn.mutateAsync(columnName.trim());
                    notify.success("New column ready", {
                      description: `You can add cards to “${columnName.trim()}” now.`,
                    });
                    setColumnName("");
                    setColumnOpen(false);
                  } catch (error) {
                    notify.error(error, "We couldn’t add that column.");
                  }
                }}
              >
                Create
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
