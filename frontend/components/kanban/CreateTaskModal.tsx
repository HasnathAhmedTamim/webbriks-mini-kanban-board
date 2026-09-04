"use client";

import { FormEvent, useEffect, useState } from "react";
import { useCreateTask } from "@/hooks/useBoards";
import { notify } from "@/lib/notify";
import { taskSchema } from "@/lib/validation";
import type { Column } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

type CreateTaskModalProps = {
  open: boolean;
  boardId: string;
  columns: Column[];
  columnId: string | null;
  onClose: () => void;
};

export function CreateTaskModal({
  open,
  boardId,
  columns,
  columnId,
  onClose,
}: CreateTaskModalProps) {
  const createTask = useCreateTask(boardId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColumnId, setSelectedColumnId] = useState(columnId || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setSelectedColumnId(columnId || columns[0]?.id || "");
      setTitle("");
      setDescription("");
      setErrors({});
    }
  }, [open, columnId, columns]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = taskSchema.safeParse({
      title,
      description: description.trim() || undefined,
      columnId: selectedColumnId,
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        next[String(issue.path[0])] = issue.message;
      });
      setErrors(next);
      return;
    }

    try {
      await createTask.mutateAsync({
        columnId: parsed.data.columnId,
        title: parsed.data.title,
        description: parsed.data.description,
      });
      notify.success("Task added", {
        description: `“${parsed.data.title}” is in the selected column.`,
      });
      onClose();
    } catch (error) {
      notify.error(error, "Failed to create task");
    }
  }

  return (
    <Modal
      open={open}
      title="Create New Task"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            form="create-task-form"
            type="submit"
            loading={createTask.isPending}
            loadingText="Creating…"
          >
            Create
          </Button>
        </>
      }
    >
      <form id="create-task-form" onSubmit={onSubmit} className="space-y-3">
        <Input
          label="Title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Fix login issue"
          error={errors.title}
        />
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-[var(--ink)]">Description</span>
          <textarea
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional details"
            className="min-h-24 w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
          />
        </label>
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-[var(--ink)]">Column</span>
          <select
            value={selectedColumnId}
            onChange={(e) => setSelectedColumnId(e.target.value)}
            className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
          >
            {columns.map((col) => (
              <option key={col.id} value={col.id}>
                {col.name}
              </option>
            ))}
          </select>
          {errors.columnId ? <span className="text-xs text-[var(--danger)]">{errors.columnId}</span> : null}
        </label>
      </form>
    </Modal>
  );
}
