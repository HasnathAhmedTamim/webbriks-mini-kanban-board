"use client";

import { FormEvent, useState } from "react";
import { useCreateTask } from "@/hooks/useBoards";
import { notify } from "@/lib/notify";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

type CreateTaskModalProps = {
  open: boolean;
  boardId: string;
  columnId: string | null;
  onClose: () => void;
};

export function CreateTaskModal({ open, boardId, columnId, onClose }: CreateTaskModalProps) {
  const createTask = useCreateTask(boardId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!columnId) return;
    try {
      await createTask.mutateAsync({
        columnId,
        title: title.trim(),
        description: description.trim() || undefined,
      });
      notify.success("Task added.");
      setTitle("");
      setDescription("");
      onClose();
    } catch (error) {
      notify.error(error, "We couldn’t add that task.");
    }
  }

  return (
    <Modal
      open={open}
      title="Add a task"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button form="create-task-form" type="submit" loading={createTask.isPending}>
            Add task
          </Button>
        </>
      }
    >
      <form id="create-task-form" onSubmit={onSubmit} className="space-y-3">
        <Input
          label="Title"
          name="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
        />
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-[var(--ink)]">Details (optional)</span>
          <textarea
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a short note if it helps"
            className="min-h-24 w-full rounded-lg border border-[var(--line)] px-3 py-2 outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15"
          />
        </label>
      </form>
    </Modal>
  );
}
