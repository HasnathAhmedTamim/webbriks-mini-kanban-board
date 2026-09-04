"use client";

import { FormEvent, useEffect, useState } from "react";
import { useCreateBoard, useUpdateBoard } from "@/hooks/useBoards";
import { notify } from "@/lib/notify";
import { boardNameSchema } from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

type CreateBoardModalProps = {
  open: boolean;
  onClose: () => void;
  mode?: "create" | "rename";
  boardId?: string;
  initialName?: string;
};

export function CreateBoardModal({
  open,
  onClose,
  mode = "create",
  boardId,
  initialName = "",
}: CreateBoardModalProps) {
  const createBoard = useCreateBoard();
  const updateBoard = useUpdateBoard();
  const [name, setName] = useState(initialName);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName(initialName);
      setError("");
    }
  }, [open, initialName]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = boardNameSchema.safeParse({ name });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid name");
      return;
    }
    try {
      if (mode === "rename" && boardId) {
        await updateBoard.mutateAsync({ boardId, name: parsed.data.name });
        notify.success("Board renamed", {
          description: `New name: “${parsed.data.name}”`,
        });
      } else {
        await createBoard.mutateAsync(parsed.data.name);
        notify.success("Board created", {
          description: `“${parsed.data.name}” is ready — open it to add tasks.`,
        });
      }
      onClose();
    } catch (err) {
      notify.error(err, mode === "rename" ? "Failed to rename board" : "Failed to create board");
    }
  }

  const pending = createBoard.isPending || updateBoard.isPending;

  return (
    <Modal
      open={open}
      title={mode === "rename" ? "Rename Board" : "Create New Board"}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            form="board-form"
            type="submit"
            loading={pending}
            loadingText={mode === "rename" ? "Saving…" : "Creating…"}
          >
            {mode === "rename" ? "Save" : "Create"}
          </Button>
        </>
      }
    >
      <form id="board-form" onSubmit={onSubmit}>
        <Input
          label="Board Name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Website Development"
          error={error}
        />
      </form>
    </Modal>
  );
}
