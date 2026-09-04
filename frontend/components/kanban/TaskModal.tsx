"use client";

import { FormEvent, useEffect, useState } from "react";
import { useMoveTask, useUpdateTask } from "@/hooks/useBoards";
import { notify } from "@/lib/notify";
import { taskSchema } from "@/lib/validation";
import type { Column, Task } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

type TaskModalProps = {
  open: boolean;
  boardId: string;
  columns: Column[];
  task: Task | null;
  onClose: () => void;
  onRequestDelete: (task: Task) => void;
};

export function TaskModal({
  open,
  boardId,
  columns,
  task,
  onClose,
  onRequestDelete,
}: TaskModalProps) {
  const updateTask = useUpdateTask(boardId);
  const moveTask = useMoveTask(boardId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [columnId, setColumnId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setColumnId(task.columnId);
      setErrors({});
    }
  }, [task]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!task) return;
    const parsed = taskSchema.safeParse({
      title,
      description: description.trim() || undefined,
      columnId,
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
      await updateTask.mutateAsync({
        taskId: task.id,
        title: parsed.data.title,
        description: parsed.data.description || null,
      });
      if (parsed.data.columnId !== task.columnId) {
        const target = columns.find((c) => c.id === parsed.data.columnId);
        const withoutMoving = (target?.tasks || []).filter((t) => t.id !== task.id);
        await moveTask.mutateAsync({
          taskId: task.id,
          targetColumnId: parsed.data.columnId,
          targetPosition: withoutMoving.length,
        });
      }
      notify.success("Changes saved", {
        description: "Your card looks up to date.",
      });
      onClose();
    } catch (error) {
      notify.error(error, "We couldn’t save your changes.");
    }
  }

  return (
    <Modal
      open={open}
      title="Task Details"
      onClose={onClose}
      footer={
        <>
          <Button
            variant="dangerOutline"
            type="button"
            className="w-full sm:w-auto sm:mr-auto"
            onClick={() => task && onRequestDelete(task)}
          >
            Delete
          </Button>
          <Button variant="secondary" type="button" className="w-full sm:w-auto" onClick={onClose}>
            Cancel
          </Button>
          <Button
            form="edit-task-form"
            type="submit"
            className="w-full sm:w-auto"
            loading={updateTask.isPending || moveTask.isPending}
            loadingText="Saving…"
          >
            Save
          </Button>
        </>
      }
    >
      <form id="edit-task-form" onSubmit={onSubmit} className="space-y-3">
        <Input
          label="Title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
        />
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-[var(--ink)]">Description</span>
          <textarea
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-24 w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
          />
        </label>
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-[var(--ink)]">Column</span>
          <select
            value={columnId}
            onChange={(e) => setColumnId(e.target.value)}
            className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
          >
            {columns.map((col) => (
              <option key={col.id} value={col.id}>
                {col.name}
              </option>
            ))}
          </select>
        </label>
      </form>
    </Modal>
  );
}
