"use client";

import { FormEvent, useState } from "react";
import { useCreateBoard } from "@/hooks/useBoards";
import { notify } from "@/lib/notify";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

type CreateBoardModalProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateBoardModal({ open, onClose }: CreateBoardModalProps) {
  const createBoard = useCreateBoard();
  const [name, setName] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await createBoard.mutateAsync(name.trim());
      notify.success("Board created. Open it to start adding tasks.");
      setName("");
      onClose();
    } catch (error) {
      notify.error(error, "We couldn't create that board. Please try again.");
    }
  }

  return (
    <Modal
      open={open}
      title="Create a board"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button form="create-board-form" type="submit" loading={createBoard.isPending}>
            Create board
          </Button>
        </>
      }
    >
      <form id="create-board-form" onSubmit={onSubmit}>
        <Input
          label="Board name"
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Product launch"
        />
      </form>
    </Modal>
  );
}
